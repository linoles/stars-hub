import { config } from "@/app/config";
import { createClient } from "@supabase/supabase-js";
import { Markup, Telegraf } from "telegraf";
import { TelegramEmoji } from "telegraf/types";
import { NextRequest, NextResponse } from 'next/server';

const bot = new Telegraf("8270325718:AAFfL73Yy6cpOO-WEFwys-qnb7t5kA_qVmE");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
declare global {
  interface Context {
    message: {
      text: string;
      reply_to_message?: {
        from: {
          id: number;
        };
        forward_origin?: {
          message_id: number;
        };
      };
    };
  }
}

const levenshteinDistance = (a: string, b: string) => {
  const matrix: number[][] = Array(b.length + 1)
    .fill(null)
    .map(() => Array(a.length + 1).fill(null));

  for (let i = 0; i <= a.length; i++) {
    matrix[0][i] = i;
  }

  for (let j = 0; j <= b.length; j++) {
    matrix[j][0] = j;
  }

  for (let j = 1; j <= b.length; j++) {
    for (let i = 1; i <= a.length; i++) {
      const substitutionCost = a[i - 1] === b[j - 1] ? 0 : 1;
      matrix[j][i] = Math.min(
        matrix[j][i - 1] + 1, // delete
        matrix[j - 1][i] + 1, // insert
        matrix[j - 1][i - 1] + substitutionCost // substitute
      );
    }
  }

  return matrix[b.length][a.length];
};

const levenshteinSearch = (
  targetName: string,
  profiles: { id: number; name: string; points: number }[],
  maxDistance = 2
): { id: number; name: string; points: number; x: number }[] => {
  return profiles
    .filter(
      (profile) =>
        levenshteinDistance(
          targetName.toLowerCase(),
          profile.name.toLowerCase()
        ) <= maxDistance
    )
    .map((profile) => ({ ...profile, x: 0 }));
};

const getNGrams = (str: string, n: number): string[] => {
  const nGrams: string[] = [];
  for (let i = 0; i <= str.length - n; i++) {
    nGrams.push(str.slice(i, i + n));
  }
  return nGrams;
};

const nGramsSearch = (
  targetName: string,
  profiles: { id: number; name: string; points: number }[],
  n = 2,
  minCommon = 2
): { id: number; name: string; points: number; x: number }[] => {
  const targetNGrams = getNGrams(targetName.toLowerCase(), n);
  return profiles
    .filter((profile) => {
      const profileNGrams = getNGrams(profile.name.toLowerCase(), n);
      const commonNGrams = targetNGrams.filter((nGram) =>
        profileNGrams.includes(nGram)
      );
      return commonNGrams.length >= minCommon;
    })
    .map((profile) => ({ ...profile, x: 0 }));
};

const substringSearch = (
  targetName: string,
  profiles: { id: number; name: string; points: number }[]
): { id: number; name: string; points: number; x: number }[] => {
  return profiles
    .filter((profile) =>
      profile.name.toLowerCase().includes(targetName.toLowerCase())
    )
    .map((profile) => ({ ...profile, x: 0 }));
};

const globalSearch = (
  targetName: string,
  profiles: { id: number; name: string; points: number; x: number }[]
): { id: number; name: string; points: number }[] => {
  const results: { id: number; name: string; points: number; x: number }[][] = [
    levenshteinSearch(targetName.toLowerCase(), profiles),
    nGramsSearch(targetName.toLowerCase(), profiles),
    substringSearch(targetName.toLowerCase(), profiles),
  ];
  let x: any = {};
  results.forEach((result) => {
    result.forEach((profile) => {
      if (!profile.x) {
        profile.x = 0;
      }
      x[profile.id] = (!x[profile.id] ? 0 : x[profile.id]) + 1;
    });
  });
  return profiles
    .map((profile) => ({
      id: profile.id,
      name: profile.name,
      points: profile.points,
      x: x[profile.id],
    }))
    .sort((a, b) => a.x - b.x);
};

const getLudkaButtons = async () => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();

  return Markup.inlineKeyboard([
    [Markup.button.callback("Текущие настройки ⚡", "showSettings")],
    [
      Markup.button.callback("7️⃣", "ludka 7️⃣"),
      Markup.button.callback("🍋", "ludka 🍋"),
      Markup.button.callback("🍇", "ludka 🍇"),
      Markup.button.callback("BAR", "ludka BAR"),
    ],
    [
      Markup.button.callback("➖", "minuswinners"),
      Markup.button.callback(
        `${row.ludka.winners !== 1000 ? row.ludka.winners : "∞"} 🏆`,
        "showwinners"
      ),
      Markup.button.callback("➕", "pluswinners"),
    ],
    [
      Markup.button.callback("➖", "minusrequiredTimes"),
      Markup.button.callback(
        `${row.ludka.requiredTimes} 🔢`,
        "showrequiredTimes"
      ),
      Markup.button.callback("➕", "plusrequiredTimes"),
    ],
    [
      Markup.button.callback("➖", "minusrequiredRow"),
      Markup.button.callback(`${row.ludka.requiredRow} 💯`, "showrequiredRow"),
      Markup.button.callback("➕", "plusrequiredRow"),
    ],
    [Markup.button.callback("Остановить лудку 🛑", "stopLudka")],
  ]);
};

const getLudkaMessage = async () => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  return `✅ Лудка успешно запущена!\n<blockquote expandable><b>🔗 Текущие настройки:</b>\n<i>Цель:</i> ${row.ludka.neededComb}${row.ludka.neededComb}${row.ludka.neededComb} 🎰\n<i>🎊 Победители:</i> ${row.ludka.winners}\n<i>Надо выбить (раз):</i> ${row.ludka.requiredTimes} 🗝\n<i>💪 Надо выбить (подряд):</i> ${row.ludka.requiredRow}</blockquote>\n\nВыберите настройки лудки кнопками ниже! ⚙\n\n<blockquote expandable><b>Описание настроек ❕</b>\n<i>7️⃣, 🍋, 🍇, BAR:</i> Установка цели лудки\n<i>🏆:</i> Максимальное количество победителей\n<i>🔢:</i> Нужное для победы количество выигрышных комбинаций\n<i>💯:</i> Нужное для победы количество выигрышных комбинаций <b>подряд</b></blockquote>`;
};

const getHludkaButtons = async () => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();

  return Markup.inlineKeyboard([
    [Markup.button.callback("Текущие настройки ⚡", "hshowSettings")],
    [
      Markup.button.callback("➖", "hminuswinners"),
      Markup.button.callback(`${row.hludka.winners} 🏆`, "return"),
      Markup.button.callback("➕", "hpluswinners"),
    ],
    [
      Markup.button.callback("7️⃣", "return"),
      Markup.button.callback("🍋", "return"),
      Markup.button.callback("🍇", "return"),
      Markup.button.callback("BAR", "return"),
    ],
    [
      Markup.button.callback("➕", "hplus=7️⃣"),
      Markup.button.callback("➕", "hplus=🍋"),
      Markup.button.callback("➕", "hplus=🍇"),
      Markup.button.callback("➕", "hplus=BAR"),
    ],
    [
      Markup.button.callback(`🎫 ${row.hludka.tickets["7️⃣"]}`, "return"),
      Markup.button.callback(`🎫 ${row.hludka.tickets["🍋"]}`, "return"),
      Markup.button.callback(`🎫 ${row.hludka.tickets["🍇"]}`, "return"),
      Markup.button.callback(`🎫 ${row.hludka.tickets["BAR"]}`, "return"),
    ],
    [
      Markup.button.callback("➖", "hminus=7️⃣"),
      Markup.button.callback("➖", "hminus=🍋"),
      Markup.button.callback("➖", "hminus=🍇"),
      Markup.button.callback("➖", "hminus=BAR"),
    ],
    [Markup.button.callback("Остановить лудку 🛑", "hstopLudka")],
  ]);
};

const getLoteryButtons = (row: any) => {
  const arr: any = {};
  for (let i = 1; i <= 8; i++) {
    for (let j = 1; j <= 10; j++) {
      while (
        Object.values(arr).find((value: any) => value === i * j) !==
          undefined &&
        j >= i
      ) {
        delete arr[
          Object.keys(arr).find((key: any) => arr[key] === i * j) || 1000
        ];
      }
      arr[`${i}${j}`] = i * j;
    }
  }
  const difs = Object.values(arr).map((number: any) =>
    Math.abs(number - row.lotery.tickets)
  );
  const minDif = Math.min(...difs);
  const num =
    Number(
      Object.keys(arr)
        .find((key: any) => arr[key] === difs.indexOf(minDif))
        ?.split("")[1]
    ) || 8;
  return Markup.inlineKeyboard(
    row.lotery.doneTickets.reduce(
      (acc: any, val: any, idx: any) => {
        if (idx % num === 0) {
          acc.push([]);
        }
        acc[acc.length - 1].push(
          Markup.button.callback(
            !val.from?.id || val.from?.id == null
              ? "🎫"
              : val.win
              ? Object.keys(row.lotery.prizes)[
                  Object.values(row.lotery.prizes).findIndex(
                    (value: any) => value === val.from?.id
                  )
                ]?.split(" ")[0]
              : "❌",
            `lotery=${idx}`
          )
        );
        return acc;
      },
      [[]]
    )
  );
};

const getHludkaMessage = async () => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  return `✅ Лудка по билетам успешно запущена! 🎫\n<blockquote expandable><b>🔗 Текущие настройки:</b>\n<i>🎊 Победители:</i> ${
    row.hludka.winners
  }\n<i>Начисления (за билеты):</i>\n\t${Object.entries(row.hludka.tickets)
    .map((emoji: any) => `${emoji[0]}: ${emoji[1]}`)
    .join("\n\t")}</blockquote>\n\nВыберите настройки лудки кнопками ниже! ⚙`;
};

const getGameButtons = async (row: any) => {
  switch (row.game.setupStage) {
    case 0:
      return Markup.inlineKeyboard([
        [
          Markup.button.callback("🎲", "gametype=cubic"),
          Markup.button.callback("🎯", "gametype=darts"),
          Markup.button.callback("🎳", "gametype=bowling"),
          Markup.button.callback("🏀", "gametype=basketball"),
          Markup.button.callback("⚽️", "gametype=football"),
        ],
        [Markup.button.callback("Дальше 👉", "gameNextStage")],
      ]);
    case 1:
      return Markup.inlineKeyboard([
        [
          Markup.button.callback("3", "gamespace=3"),
          Markup.button.callback("4", "gamespace=4"),
          Markup.button.callback("5", "gamespace=5"),
          Markup.button.callback("6", "gamespace=6"),
          Markup.button.callback("7", "gamespace=7"),
          Markup.button.callback("8", "gamespace=8"),
        ],
        [
          Markup.button.callback("9", "gamespace=9"),
          Markup.button.callback("10", "gamespace=10"),
          Markup.button.callback("11", "gamespace=11"),
          Markup.button.callback("12", "gamespace=12"),
          Markup.button.callback("13", "gamespace=13"),
          Markup.button.callback("14", "gamespace=14"),
        ],
        [
          Markup.button.callback("15", "gamespace=15"),
          Markup.button.callback("16", "gamespace=16"),
          Markup.button.callback("17", "gamespace=17"),
          Markup.button.callback("18", "gamespace=18"),
          Markup.button.callback("19", "gamespace=19"),
          Markup.button.callback("20", "gamespace=20"),
        ],
        [
          Markup.button.callback("25", "gamespace=25"),
          Markup.button.callback("30", "gamespace=30"),
          Markup.button.callback("35", "gamespace=35"),
          Markup.button.callback("40", "gamespace=40"),
          Markup.button.callback("45", "gamespace=45"),
          Markup.button.callback("50", "gamespace=50"),
        ],
        [
          Markup.button.callback("60", "gamespace=60"),
          Markup.button.callback("70", "gamespace=70"),
          Markup.button.callback("80", "gamespace=80"),
          Markup.button.callback("90", "gamespace=90"),
          Markup.button.callback("100", "gamespace=100"),
        ],
        [
          Markup.button.callback("120", "gamespace=120"),
          Markup.button.callback("140", "gamespace=140"),
          Markup.button.callback("160", "gamespace=160"),
          Markup.button.callback("180", "gamespace=180"),
          Markup.button.callback("200", "gamespace=200"),
        ],
        [
          Markup.button.callback("Назад ⬅", "gamePrevStage"),
          Markup.button.callback("Дальше 👉", "gameNextStage"),
        ],
      ]);
    case 2:
      return Markup.inlineKeyboard([
        [
          Markup.button.callback("2", "gamemoves=2"),
          Markup.button.callback("3", "gamemoves=3"),
          Markup.button.callback("4", "gamemoves=4"),
          Markup.button.callback("5", "gamemoves=5"),
        ],
        [
          Markup.button.callback("6", "gamemoves=6"),
          Markup.button.callback("7", "gamemoves=7"),
          Markup.button.callback("8", "gamemoves=8"),
          Markup.button.callback("9", "gamemoves=9"),
          Markup.button.callback("10", "gamemoves=10"),
        ],
        [
          Markup.button.callback("11", "gamemoves=11"),
          Markup.button.callback("12", "gamemoves=12"),
          Markup.button.callback("13", "gamemoves=13"),
          Markup.button.callback("14", "gamemoves=14"),
          Markup.button.callback("15", "gamemoves=15"),
        ],
        [
          Markup.button.callback("16", "gamemoves=16"),
          Markup.button.callback("17", "gamemoves=17"),
          Markup.button.callback("18", "gamemoves=18"),
          Markup.button.callback("19", "gamemoves=19"),
          Markup.button.callback("20", "gamemoves=20"),
        ],
        [
          Markup.button.callback("21", "gamemoves=21"),
          Markup.button.callback("22", "gamemoves=22"),
          Markup.button.callback("23", "gamemoves=23"),
          Markup.button.callback("24", "gamemoves=24"),
          Markup.button.callback("25", "gamemoves=25"),
        ],
        [
          Markup.button.callback("Назад ⬅", "gamePrevStage"),
          Markup.button.callback("Дальше 👉", "gameNextStage"),
        ],
      ]);
    case 3:
      return Markup.inlineKeyboard([
        [
          Markup.button.callback("1", "gamewinners=1"),
          Markup.button.callback("2", "gamewinners=2"),
          Markup.button.callback("3", "gamewinners=3"),
          Markup.button.callback("5", "gamewinners=5"),
          Markup.button.callback("10", "gamewinners=10"),
        ],
        [
          Markup.button.callback("Назад ⬅", "gamePrevStage"),
          Markup.button.callback("Готово ✅", "startGame"),
        ],
      ]);
    default:
      return Markup.inlineKeyboard([]);
  }
};

const getGameMessage = async (row: any) => {
  switch (row.game.setupStage) {
    case 0:
      return `⚙ Для начала, выберите тип игры 👇\nСейчас установлено: ${
        row.game.type === "cubic"
          ? "🎲"
          : row.game.type === "darts"
          ? "🎯"
          : row.game.type === "bowling"
          ? "🎳"
          : row.game.type === "basketball"
          ? "🏀"
          : "⚽️"
      }`;
    case 1:
      return `<i>⚙ Теперь выберите количество мест в игре 👇</i>\nСейчас установлено: ${row.game.space}`;
    case 2:
      return `<i>⚙ Теперь выберите количество ходов 👇</i>\nСейчас установлено: ${row.game.moves}`;
    case 3:
      return `<i>⚙ Ну и наконец, количество победителей 👇</i>\nСейчас установлено: ${row.game.winners}`;
    default:
      return "✅ Игра успешно запущена!";
  }
};

const sendResults = async (finalText: string) => {
  try {
    bot.telegram.sendMessage(7441988500, finalText, {
      parse_mode: "HTML",
    }); /* !! */
    const { data: row, error } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", 1)
      .single();
    if (row.ludka.chatId == -1002506008123) {
      bot.telegram.sendMessage(6233759034, finalText, {
        parse_mode: "HTML",
      });
    }
    await bot.telegram.sendMessage(row.ludka.chatId, finalText, {
      parse_mode: "HTML",
      reply_parameters: {
        message_id: row.ludka.msgId,
      },
    });
  } catch (error: any) {
    bot.telegram.sendMessage(
      7441988500,
      `Error occurred while processing message:\n${
        error.stack || error.message
      }`
    );
  }
};

const hsendResults = async (finalText: string) => {
  try {
    bot.telegram.sendMessage(7441988500, finalText, {
      parse_mode: "HTML",
    }); /* !! */
    const { data: row, error } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", 1)
      .single();
    if (row.hludka.chatId == -1002506008123) {
      bot.telegram.sendMessage(6233759034, finalText, {
        parse_mode: "HTML",
      });
    }
    await bot.telegram.sendMessage(row.hludka.chatId, finalText, {
      parse_mode: "HTML",
      reply_parameters: {
        message_id: row.hludka.msgId,
      },
    });
  } catch (error: any) {
    bot.telegram.sendMessage(
      7441988500,
      `Error occurred while processing message:\n${
        error.stack || error.message
      }`
    );
  }
};

const lsendResults = async (finalText: string, row: any) => {
  try {
    bot.telegram.sendMessage(7441988500, finalText, {
      parse_mode: "HTML",
    });

    if (row.lotery.chatId === -1002506008123) {
      bot.telegram.sendMessage(6233759034, finalText, {
        parse_mode: "HTML",
      });
    }

    bot.telegram.sendMessage(row.lotery.chatId, finalText, {
      parse_mode: "HTML",
    });
  } catch (error: any) {
    await bot.telegram.sendMessage(
      7441988500,
      `Error occurred while sending results:\n${error.stack || error.message}`
    );
  }
};

const getStartGameMessage = async (row: any, from: number) => {
  const set = row.game.doneUsers[`${from}`].set;
  const emoji =
    row.game.type === "cubic"
      ? "🎲"
      : row.game.type === "darts"
      ? "🎯"
      : row.game.type === "bowling"
      ? "🎳"
      : row.game.type === "basketball"
      ? "🏀"
      : "⚽️";
  if (set === "") {
    return "✅ Вы успешно присоединились к игре! Теперь выберете, кто будет отправлять эмодзи 🍀";
  } else if (set === "gamer") {
    bot.telegram.sendDice(from, { emoji: emoji });
    return `✅ Начинайте отправлять эмодзи! (Надо отправить раз: ${row.game.moves}) 👣`;
  } else {
    return `✅ Сейчас бот начнёт отправлять вам все ${row.game.moves} эмодзи для игры! 🎮`;
  }
};

const getStartGameButtons = async (row: any, from: number) => {
  const set = row.game.doneUsers[`${from}`].set;
  if (set === "") {
    return Markup.inlineKeyboard([
      [
        Markup.button.callback("👤 Я сам", "gameSet=gamer"),
        Markup.button.callback("🤖 Бот", "gameSet=bot"),
      ],
    ]);
  } else {
    startBotGaming(row, from);
    return Markup.inlineKeyboard([]);
  }
};

const saveGameState = async (gameData: any) => {
  try {
    const { data: row, error: fetchError } = await supabase
      .from("users")
      .select("game")
      .eq("tgId", 1)
      .single();

    if (fetchError) throw fetchError;

    const updatedGame = {
      ...row.game,
      ...gameData,
      doneUsers: {
        ...row.game?.doneUsers,
        ...gameData.doneUsers,
      },
    };

    const { error } = await supabase
      .from("users")
      .update({ game: updatedGame })
      .eq("tgId", 1);

    if (error) throw error;
    return true;
  } catch (err) {
    console.error("Ошибка сохранения:", err);
    return false;
  }
};

const startBotGaming = async (row: any, from: number) => {
  if (!row.game.isActive || row.game.doneUsers[`${from}`].set !== "bot") return;

  const emoji =
    row.game.type === "cubic"
      ? "🎲"
      : row.game.type === "darts"
      ? "🎯"
      : row.game.type === "bowling"
      ? "🎳"
      : row.game.type === "basketball"
      ? "🏀"
      : "⚽️";

  const startMessage = await bot.telegram.sendMessage(
    from,
    `🎮 Готовы начать игру? Нажмите кнопку ниже!`,
    {
      reply_markup: {
        inline_keyboard: [
          [{ text: "Начать игру 🚀", callback_data: `start_game_${from}` }],
        ],
      },
    }
  );

  row.game.doneUsers[`${from}`].startMessageId = startMessage.message_id;
  await supabase.from("users").update({ game: row.game }).eq("tgId", from);
};

bot.action(/start_game_(\d+)/, async (ctx) => {
  const from = ctx.callbackQuery.from.id;
  const { data: row, error } = await supabase
    .from("users")
    .select("game")
    .eq("tgId", 1)
    .single();
  if (
    row?.game.doneUsers[`${from}`].set !== "bot" ||
    error ||
    row?.game.doneUsers[`${from}`].progress >= row.game.moves
  ) {
    await ctx.answerCbQuery(
      "Check: some errors: " +
        String(error) +
        " " +
        row?.game.doneUsers[`${ctx.callbackQuery.from.id}`].set
    );
    return;
  }

  try {
    // Удаление сообщения и бросок кубика
    if (row.game.doneUsers[`${from}`].startMessageId) await ctx.deleteMessage();
    const dice = await ctx.sendDice({
      emoji:
        row.game.type === "cubic"
          ? "🎲"
          : row.game.type === "darts"
          ? "🎯"
          : row.game.type === "bowling"
          ? "🎳"
          : row.game.type === "basketball"
          ? "🏀"
          : "⚽️",
    });

    // Обновление состояния
    const PlusDice = (() => {
      if (row.game.type === "cubic") {
        return dice.dice.value;
      } else if (row.game.type === "darts") {
        return dice.dice.value - 1;
      } else if (row.game.type === "basketball") {
        return dice.dice.value >= 4 ? 1 : 0;
      } else if (row.game.type === "football") {
        return dice.dice.value >= 3 ? 1 : 0;
      } else if (row.game.type === "bowling") {
        return dice.dice.value === 2
          ? 1
          : dice.dice.value === 1
          ? 0
          : dice.dice.value;
      }
      return 0;
    })();
    row.game.doneUsers[`${from}`].points += PlusDice;
    row.game.doneUsers[`${from}`].progress++;

    // Атомарное сохранение
    const success = await saveGameState({
      doneUsers: {
        [`${from}`]: {
          name: ctx.from?.first_name || "Игрок",
          progress: row.game.doneUsers[`${from}`].progress,
          points: row.game.doneUsers[`${from}`].points,
          set: "bot",
        },
      },
    });

    if (!success) throw new Error("Save failed");

    const pointsEarned = PlusDice;
    await ctx.reply(
      `🐾 Вы получили +${pointsEarned} очк${
        pointsEarned === 1 ? "о" : [2, 3, 4].includes(pointsEarned) ? "а" : "ов"
      }\nВаши очки: ${row.game.doneUsers[`${from}`].points} 🦾\n♟ Ход: ${
        row.game.doneUsers[`${from}`].progress
      }/${row.game.moves}`
    );

    // Проверка завершения
    if (row.game.doneUsers[`${from}`].progress >= row.game.moves) {
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await finishGame(ctx, from);
    } else {
      // Кнопка для следующего хода
      const msg = await ctx.reply("Готовы к следующему броску?", {
        reply_markup: {
          inline_keyboard: [
            [{ text: "👣 Следующий ход", callback_data: `start_game_${from}` }],
          ],
        },
      });
      row.game.doneUsers[`${from}`].startMessageId = msg.message_id;
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
    }
  } catch (error) {
    console.error("Ошибка:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
  }
});

bot.action(/lotery=(.+)/, async (ctx) => {
  const num = Number(ctx.match[1]);
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  const user = row.lotery.doneTickets.find(
    (u: any) => u.from?.id === ctx.callbackQuery.from.id
  );
  const ticket = row.lotery.doneTickets[num];
  if (!row.lotery.isActive) {
    ctx.answerCbQuery("❌ Лотерея не активна!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  } else if (user) {
    ctx.answerCbQuery("❌ Вы уже вытянули свой билет!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  } else if (ticket.from !== null) {
    ctx.answerCbQuery("❌ Билет уже вытянули!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  } else {
    if (!ticket.win) {
      ctx.answerCbQuery(
        `✅ Вы вытянули билет №${num + 1}! \n❌ Но он не оказался выигрышным!`,
        {
          show_alert: true,
          cache_time: 0,
        }
      );
      row.lotery.doneTickets[num].from = { id: ctx.callbackQuery.from.id };
      await supabase.from("users").update({ lotery: row.lotery }).eq("tgId", 1);
      await ctx.editMessageReplyMarkup(
        (
          await getLoteryButtons(row)
        ).reply_markup
      );
      return;
    }
    row.lotery.currentWinners[`${ctx.callbackQuery.from.id}`] =
      ctx.callbackQuery.from.first_name;
    row.lotery.doneTickets[num].from = { id: ctx.callbackQuery.from.id };
    row.lotery.prizes[
      Object.keys(row.lotery.prizes)[
        Object.keys(row.lotery.currentWinners).length - 1
      ]
    ] = ctx.callbackQuery.from.id;
    await supabase.from("users").update({ lotery: row.lotery }).eq("tgId", 1);
    await ctx.editMessageReplyMarkup(getLoteryButtons(row).reply_markup);
    await ctx.answerCbQuery(
      `✅ Вы вытянули билет №${num + 1}! \n🎉 И он оказался выигрышным!\n${
        Object.keys(row.lotery.currentWinners).length < row.lotery.winners
          ? "Ожидайте конца лотереи! 🥇"
          : "Поздравляем с победой! 🎊"
      }`,
      {
        show_alert: true,
        cache_time: 0,
      }
    );
    if (Object.keys(row.lotery.currentWinners).length < row.lotery.winners) {
      return;
    } else {
      lsendResults(
        `🎉 Лотерея окончена!\n<blockquote expandable>\t\t🥇 Победители: ${Object.entries(
          row.lotery.currentWinners
        )
          .map(
            (win) =>
              `<a href="tg://openmessage?user_id=${win[0]}">${win[1]} (${win[0]})</a> ${
                Object.keys(row.lotery.prizes)
                  .find((key: any) => row.lotery.prizes[key] === Number(win[0]))
                  ?.split(" ")[0] || "🎉"
              }`
          )
          .join(", ")}</blockquote>`,
        row
      );
      row.lotery.isActive = false;
      row.lotery.currentWinners = {};
      row.lotery.winners = 1;
      await supabase.from("users").update({ lotery: row.lotery }).eq("tgId", 1);
      return;
    }
  }
});

const updateLeaderboard = async (ctx: any, from: number) => {
  try {
    const { data: currentData, error } = await supabase
      .from("users")
      .select("game")
      .eq("tgId", 1)
      .single();

    if (error || !currentData?.game)
      throw new Error("Не удалось загрузить данные игры");

    const top = Object.entries(currentData.game.doneUsers)
      .sort((a: any, b: any) => b[1].points - a[1].points)
      .slice(0, 50);

    const sortedUsers = top
      .map(
        ([user, data]: any, index) =>
          `<a href="https://t.me/StarzHubBot?start=profile_${user}">${
            index + 1
          }. </a><b><a href="tg://openmessage?user_id=${user}">${data.name}</a></b>: ${
            data.points
          }`
      )
      .join("\n");

    await bot.telegram.editMessageText(
      currentData.game.chatId,
      currentData.game.msgId,
      undefined,
      `${await getPostGameMessage(
        currentData
      )}\n\n<blockquote expandable><b>Топ 🏅</b>\n${sortedUsers}</blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [
              Markup.button.url(
                `🧩 Играть (${
                  Object.entries(currentData.game.doneUsers).length
                }/${currentData.game.space})`,
                "https://t.me/StarzHubBot?start=game"
              ),
            ],
          ],
        },
      }
    );
  } catch (error) {
    console.error("Ошибка при обновлении таблицы лидеров:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
  }
};

const endGlobalGame = async (ctx: any) => {
  try {
    // Получаем актуальные данные
    const { data: row } = await supabase
      .from("users")
      .select("game")
      .eq("tgId", 1)
      .single();

    if (!row?.game) throw new Error("Данные игры не найдены");

    if (!row.game.isActive) return;
    // Определяем победителей
    const winners = Object.entries(row.game.doneUsers)
      .sort((a: any, b: any) => b[1].points - a[1].points)
      .slice(0, row.game.winners)
      .map(
        ([user, data]: any, index) =>
          `${index + 1}. <a href="tg://openmessage?user_id=${user}">${data.name}</a>: ${
            data.points
          } <a href="https://t.me/StarzHubBot?start=profile_${user}">📎</a>`
      )
      .join("\n");
    const sortedUsers = Object.entries(row?.game.doneUsers)
      .sort((a: any, b: any) => b[1].points - a[1].points)
      .slice(0, 50)
      .map(
        ([user, data]: any, index) =>
          `<a href="https://t.me/StarzHubBot?start=profile_${user}">${
            index + 1
          }. </a><b><a href="tg://openmessage?user_id=${user}">${data.name}</a></b>: ${
            data.points
          }`
      )
      .join("\n");

    // Отправляем сообщение о победителях
    await bot.telegram.sendMessage(
      row?.game.chatId,
      `✅ Игра завершена!\n<blockquote expandable><b>🏆 Победители</b>\n${winners}</blockquote>`,
      {
        reply_parameters: { message_id: row?.game.msgId },
        parse_mode: "HTML",
        link_preview_options: {
          is_disabled: true,
        },
      }
    );

    await bot.telegram.editMessageText(
      row?.game.chatId,
      row?.game.msgId,
      undefined,
      `${await getPostGameMessage(
        row
      )}\n\n<blockquote expandable><b>Топ 🏅</b>\n${sortedUsers}</blockquote>\n\n✅ Игра завершена!\n<blockquote expandable><b>🏆 Победители</b>\n${winners}</blockquote>`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(`🏁 Игра завершена!`, "return")],
          ],
        },
        link_preview_options: {
          is_disabled: true,
        },
      }
    );

    // Деактивируем игру
    await supabase
      .from("users")
      .update({
        game: {
          ...row?.game,
          isActive: false,
          setupStage: 0,
        },
      })
      .eq("tgId", 1);
  } catch (error) {
    console.error("Ошибка при завершении игры:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
  }
};

const finishGame = async (ctx: any, from: number) => {
  const { data: row } = await supabase
    .from("users")
    .select("game")
    .eq("tgId", 1)
    .single();
  try {
    const success = await saveGameState({
      doneUsers: {
        [`${from}`]: {
          name: ctx.from?.first_name || "Игрок",
          progress: row?.game.moves,
          points: row?.game.doneUsers[`${from}`].points,
          set: row?.game.doneUsers[`${from}`].set,
        },
      },
    });

    if (!success) throw new Error("Final save failed");

    await ctx.reply(
      `🎉 Игра завершена! Ваш результат: ${
        row?.game.doneUsers[`${from}`].points
      } очков! 🏆`
    );

    await updateLeaderboard(ctx, from);

    if (Object.entries(row?.game.doneUsers).length >= row?.game.space) {
      await endGlobalGame(ctx);
    }
  } catch (error) {
    console.error("Ошибка завершения:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
  }
};

const getPostGameMessage = async (row: any) => {
  return `<b>🎮 Начало игры!</b>\n<blockquote>${row.game.text}</blockquote>\n\n<i>🚪 Мест:</i> <b>${row.game.space}</b>\n<i>Победителей:</i> <b>${row.game.winners}</b> 🏆\n<i>👣 Ходов:</i> <b>${row.game.moves}</b>`;
};

bot.action("return", async (ctx) => {
  return;
});

bot.action(/^gameSet=(gamer|bot)$/, async (ctx) => {
  const value = ctx.match[0].split("=")[1];
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (!row.game.doneUsers[`${ctx.callbackQuery.from.id}`]) {
    row.game.doneUsers[`${ctx.callbackQuery.from.id}`] = {
      name: ctx.callbackQuery.from.first_name,
      set: value,
      progress: 0,
      points: 0,
    };
  } else {
    row.game.doneUsers[`${ctx.callbackQuery.from.id}`].set = value;
  }
  await supabase
    .from("users")
    .update({
      game: row.game,
    })
    .eq("tgId", 1);
  ctx.editMessageText(
    await getStartGameMessage(row, ctx.callbackQuery.from.id),
    {
      parse_mode: "HTML",
      reply_markup: (await getStartGameButtons(row, ctx.callbackQuery.from.id))
        .reply_markup,
    }
  );
});

bot.action("gamePrevStage", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.game.setupStage -= 1;
  await supabase
    .from("users")
    .update({
      game: row.game,
    })
    .eq("tgId", 1);
  ctx.editMessageText(await getGameMessage(row), {
    parse_mode: "HTML",
    reply_markup: (await getGameButtons(row)).reply_markup,
  });
});

bot.action("gameNextStage", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.game.setupStage += 1;
  await supabase
    .from("users")
    .update({
      game: row.game,
    })
    .eq("tgId", 1);
  ctx.editMessageText(await getGameMessage(row), {
    parse_mode: "HTML",
    reply_markup: (await getGameButtons(row)).reply_markup,
  });
});

bot.action("showSettings", async (ctx) => {
  ctx.editMessageText(await getLudkaMessage(), {
    parse_mode: "HTML",
    reply_markup: (await getLudkaButtons()).reply_markup,
  });
  ctx.answerCbQuery("✅ Текущие настройки успешно отображены!");
});

bot.action("hshowSettings", async (ctx) => {
  ctx.editMessageText(await getHludkaMessage(), {
    parse_mode: "HTML",
    reply_markup: (await getHludkaButtons()).reply_markup,
  });
  ctx.answerCbQuery("✅ Текущие настройки успешно отображены!");
});

bot.action("stopLudka", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.ludka.isActive = false;
  row.ludka.doneUsers = {};
  row.ludka.currentWinners = [];
  await supabase
    .from("users")
    .update({
      ludka: row.ludka,
    })
    .eq("tgId", 1);
  const currentWinners = row.ludka.currentWinners;
  let finalText = `🏆 Лудка закончена! Победители:\n`;
  await Promise.all(
    currentWinners.map(async (id: any) => {
      finalText += `<a href="tg://openmessage?user_id=${id}">${
        row.ludka.doneUsers[`${id}`].name
      }</a>\n`;
    })
  );
  sendResults(finalText);
  ctx.editMessageText("📛 Лудка закончена!", {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [Markup.button.callback("✅ Включить лудку", "startLudka")],
      ],
    },
  });
  ctx.answerCbQuery("✅ Лудка успешно остановлена!", {
    show_alert: false,
    cache_time: 0,
  });
});

bot.action("hstopLudka", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  const currentWinners = Object.entries(row.hludka.doneUsers)
    .sort((a: any, b: any) => b[1].points - a[1].points)
    .slice(0, row.hludka.winners);
  let finalText = `🏆 Лудка по билетам закончена!\n<blockquote expandable>Победители:\n`;
  await Promise.all(
    currentWinners.map(async (id: any) => {
      finalText += `<a href="tg://openmessage?user_id=${id}">${
        row.hludka.doneUsers[`${id}`].name
      }</a>: ${row.hludka.doneUsers[`${id}`].tickets} 🎫\n`;
    })
  );
  await hsendResults(finalText + "</blockquote>");
  row.hludka.isActive = false;
  row.hludka.doneUsers = {};
  await supabase
    .from("users")
    .update({
      hludka: row.hludka,
    })
    .eq("tgId", 1);
  ctx.editMessageText("📛 Лудка закончена!", {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [Markup.button.callback("✅ Включить лудку", "hstartLudka")],
      ],
    },
  });
  ctx.answerCbQuery("✅ Лудка по билетам успешно остановлена!", {
    show_alert: false,
    cache_time: 0,
  });
});

bot.action("startLudka", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.ludka.isActive = true;
  await supabase
    .from("users")
    .update({
      ludka: row.ludka,
    })
    .eq("tgId", 1);
  ctx.editMessageText(await getLudkaMessage(), {
    parse_mode: "HTML",
    reply_markup: (await getLudkaButtons()).reply_markup,
  });
  ctx.answerCbQuery("✅ Лудка успешно запущена!", {
    show_alert: false,
    cache_time: 0,
  });
});

bot.action("hstartLudka", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.hludka.isActive = true;
  await supabase
    .from("users")
    .update({
      hludka: row.hludka,
    })
    .eq("tgId", 1);
  ctx.editMessageText(await getHludkaMessage(), {
    parse_mode: "HTML",
    reply_markup: (await getHludkaButtons()).reply_markup,
  });
  ctx.answerCbQuery("✅ Лудка по билетам успешно запущена!", {
    show_alert: false,
    cache_time: 0,
  });
});

bot.action("startGame", async (ctx) => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.game.isActive = true;
  row.game.doneUsers = {};
  row.game.setupStage = 4;
  const postText = await getPostGameMessage(row);
  const msg = await bot.telegram.sendMessage(row.game.chatId, postText, {
    parse_mode: "HTML",
    reply_markup: {
      inline_keyboard: [
        [Markup.button.url("🧩 Играть", `https://t.me/StarzHubBot?start=game`)],
      ],
    },
  });
  row.game.msgId = msg.message_id;
  await supabase
    .from("users")
    .update({
      game: row.game,
    })
    .eq("tgId", 1);
  ctx.editMessageText(await getGameMessage(row), {
    parse_mode: "HTML",
    reply_markup: (await getGameButtons(row)).reply_markup,
  });
});

bot.action(/^game(?:space|moves|winners)=[0-9]+$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const action = ctx.match[0].split("=")[0].slice(4);
  const value = ctx.match[0].split("=")[1];
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  row.game[action] = Number(value);
  const { error: updateError } = await supabase
    .from("users")
    .update({
      game: row.game,
    })
    .eq("tgId", 1);
  if (updateError) {
    ctx.answerCbQuery("❌ Ошибка при сохранении изменений", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  ctx.editMessageText(await getGameMessage(row), {
    parse_mode: "HTML",
    reply_markup: (await getGameButtons(row)).reply_markup,
  });
  ctx.answerCbQuery("✅ Текущие настройки успешно обновлены!", {
    show_alert: false,
    cache_time: 0,
  });
});

bot.action(
  /^gametype=(?:cubic|darts|bowling|basketball|football)$/,
  async (ctx) => {
    const admins = [7441988500, 6233759034, 7177688298];
    if (!admins.includes(ctx.callbackQuery.from.id)) {
      ctx.answerCbQuery("❌ У вас нет прав!", {
        show_alert: true,
        cache_time: 0,
      });
      return;
    }
    const { data: row, error } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", 1)
      .single();
    row.game.type = ctx.match[0].split("=")[1];
    await supabase
      .from("users")
      .update({
        game: row.game,
      })
      .eq("tgId", 1);
    ctx.editMessageText(await getGameMessage(row), {
      parse_mode: "HTML",
      reply_markup: (await getGameButtons(row)).reply_markup,
    });
    ctx.answerCbQuery("✅ Текущие настройки успешно обновлены!", {
      show_alert: false,
      cache_time: 0,
    });
    return;
  }
);

bot.action(/^ludka\s+(?:7️⃣|🍋|🍇|BAR)$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления цели лудки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  row.ludka.neededComb = ctx.match[0].split(" ")[1];
  await supabase
    .from("users")
    .update({
      ludka: row.ludka,
    })
    .eq("tgId", 1);
  ctx.answerCbQuery(
    `✅ Цель лудки успешно обновлена на: ${row.ludka.neededComb}${row.ludka.neededComb}${row.ludka.neededComb}`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getLudkaButtons()).reply_markup);
  return;
});

bot.action(/^show(?:winners|requiredTimes|requiredRow)$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка показа настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  ctx.answerCbQuery(
    `⚙ Текущая настройка: ${
      row.ludka[ctx.match[0].slice(4)] !== 1000
        ? row.ludka[ctx.match[0].slice(4)]
        : "∞"
    }`,
    {
      show_alert: true,
      cache_time: 0,
    }
  );
});

bot.action("hpluswinners", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  row.hludka.winners += 1;
  await supabase
    .from("users")
    .update({
      hludka: row.hludka,
    })
    .eq("tgId", 1);
  ctx.answerCbQuery(
    `✅ Настройка успешно обновлена на: ${row.hludka.winners}`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getHludkaButtons()).reply_markup);
});

bot.action("hminuswinners", async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  if (row.hludka.winners <= 0) {
    ctx.answerCbQuery("❌ Настройка не может быть меньше 0", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  row.hludka.winners -= 1;
  await supabase
    .from("users")
    .update({
      hludka: row.hludka,
    })
    .eq("tgId", 1);
  ctx.answerCbQuery(
    `✅ Настройка успешно обновлена на: ${row.hludka.winners}`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getHludkaButtons()).reply_markup);
});

bot.action(/^plus(?:winners|requiredTimes|requiredRow)$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  if (
    ctx.match[0].slice(4) == "winners" &&
    row.ludka[ctx.match[0].slice(4)] == 1000
  ) {
    row.ludka[ctx.match[0].slice(4)] = 1;
  } else {
    row.ludka[ctx.match[0].slice(4)] += 1;
  }
  await supabase
    .from("users")
    .update({
      ludka: row.ludka,
    })
    .eq("tgId", 1);
  ctx.answerCbQuery(
    `✅ Настройка успешно обновлена на: ${
      row.ludka[ctx.match[0].slice(4)] !== 1000
        ? row.ludka[ctx.match[0].slice(4)]
        : "∞"
    }`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getLudkaButtons()).reply_markup);
});

bot.action(/^hplus=(?:7️⃣|🍋|🍇|BAR)$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  row.hludka.tickets[ctx.match[0].slice(6)] += 1;
  await supabase
    .from("users")
    .update({
      hludka: row.hludka,
    })
    .eq("tgId", 1);
  ctx.answerCbQuery(
    `✅ Настройка успешно обновлена на: ${
      row.hludka.tickets[ctx.match[0].slice(6)]
    }`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getHludkaButtons()).reply_markup);
});

bot.action(/^hminus=(?:7️⃣|🍋|🍇|BAR)$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  if (row.hludka.tickets[ctx.match[0].slice(7)] <= 0) {
    ctx.answerCbQuery("❌ Настройка не может быть меньше 0", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }
  row.hludka.tickets[ctx.match[0].slice(7)] -= 1;
  await supabase
    .from("users")
    .update({
      hludka: row.hludka,
    })
    .eq("tgId", 1);
  ctx.answerCbQuery(
    `✅ Настройка успешно обновлена на: ${
      row.hludka.tickets[ctx.match[0].slice(7)]
    }`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getHludkaButtons()).reply_markup);
});

bot.action(/^minus(?:winners|requiredTimes|requiredRow)$/, async (ctx) => {
  const admins = [7441988500, 6233759034, 7177688298];
  if (!admins.includes(ctx.callbackQuery.from.id)) {
    ctx.answerCbQuery("❌ У вас нет прав!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  // Получаем данные из Supabase
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();

  if (error) {
    ctx.answerCbQuery("❌ Ошибка обновления настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  const settingName = ctx.match[0].slice(5);
  const currentValue = row.ludka[settingName];

  if (typeof currentValue !== "number") {
    ctx.answerCbQuery("❌ Некорректное значение настройки", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  // Обработка разных типов настроек
  if (settingName !== "winners" && currentValue <= 1) {
    await ctx.answerCbQuery("❌ Данная настройка не может быть меньше 1!", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  const updatedLudka = { ...row.ludka };

  if (settingName === "winners") {
    if (currentValue === 1000) {
      updatedLudka.winners = 1;
    } else if (currentValue === 1) {
      updatedLudka.winners = 1000;
    } else {
      updatedLudka.winners -= 1;
    }
  } else {
    updatedLudka[settingName] -= 1;
  }

  const { error: updateError } = await supabase
    .from("users")
    .update({ ludka: updatedLudka })
    .eq("tgId", 1);

  if (updateError) {
    ctx.answerCbQuery("❌ Ошибка при сохранении изменений", {
      show_alert: true,
      cache_time: 0,
    });
    return;
  }

  // Отправляем подтверждение с корректным значением
  ctx.answerCbQuery(
    `✅ Настройка успешно обновлена на: ${
      updatedLudka[settingName] !== 1000 ? updatedLudka[settingName] : "∞"
    }`,
    {
      show_alert: false,
      cache_time: 0,
    }
  );
  ctx.editMessageReplyMarkup((await getLudkaButtons()).reply_markup);
});

const getClava = () => {
  return Markup.keyboard([
    ["🎮 Начать игру", "🔄 Обновить данные", "📛 Закончить игру"],
    ["🎰 Начать лудку", "📛 Закончить лудку"],
    ["🎫 Начать hлудку", "🏆 Топ", "📛 Закончить hлудку"],
    ["🎫 Начать лотерею"],
  ]).resize();
};

bot.on("message", async (ctx) => {
  try {
    const chats = [
      -1002608961312, -1002560347854, -1002674341448, -1002688586546,
    ];
    if (
      !chats.includes(ctx.message.chat.id) &&
      ctx.message.chat.id !== ctx.message.from.id
    ) {
      await bot.telegram.leaveChat(ctx.message.chat.id);
      return;
    }

    const msg = (ctx as Context).message.text;
    const senderId = ctx.message.from.id;
    const senderName = `${ctx.message.from.first_name ?? ""}${
      ctx.message.from.first_name && ctx.message.from.last_name ? " " : ""
    }${ctx.message.from.last_name ?? ""}`;
    const { data: row, error } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", 1)
      .single();

    if (
      "dice" in ctx.message &&
      !("forward_origin" in ctx.message) &&
      (row.ludka.isActive || row.hludka.isActive) &&
      ctx.message.reply_to_message?.from?.id !== 777000 &&
      ctx.message.dice.emoji == "🎰"
    ) {
      const phrases = [
        "Броо, я тебе настоятельно рекомендую перейти в комментарии под пост о лудке 😢 (ну или не играть в это дерьмо)",
        "Возможно ты и выиграл, но мы тебе не выдадим приз, потому что ты крутишь не под постом 😩",
        "🤬 Ты читать разучился? КРУТИТЬ ТОЛЬКО В КОММЕНТАРИЯХ",
        "А ну быстро пошёл крутить под постом! 😈",
        "💢 Опять мимо! Нажимай там, где все нормальные люди - под постом!",
        "Ты серьезно думаешь, что так выиграешь? Под постом крути, дружок! 🧐",
        "🤡 Клоунада! Приз только тем, кто в комментах крутит!",
        "Мне больно видеть, как ты тыкаешь не туда... Под постом же! 💔",
        "👮‍♂️ Полиция лудки на месте! Это нарушение - крутить под постом!",
        "🙅‍♂️ Не-не-не, так не пойдет! Бегом в комментарии под пост!",
        "БУМ! Ты только что проиграл битву с интерфейсом! Комменты ищи! 💣",
        "Эх, если бы ты так же метко в комментах тыкал, как мимо них... 🎲",
        "🤖 бип-буп-ошибка Обнаружено нарушение протокола: лудка вне зоны комментов!",
        "🧨 Бах! Твой шанс взорвался, потому что ты не в комментах!",
        "Ой, всё... Опять не там жмёшь! Читай правила, братик! 🤦‍♂️",
        "🎪 Цирк! Где ты видишь тут пост? В комментах крути!",
        "🧟‍♂️ Ты как зомби - ходишь и тыкаешь куда попало! В комменты иди!",
        "🚫 Стоп-стоп-стоп! Не видишь, где все крутят? Под постом!",
      ];
      ctx.reply(phrases[Math.floor(Math.random() * phrases.length)], {
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
      return;
    }

    /*if (row.hludka.isActive && row.hludka.endIn[0] === "time") {
      if (row.hludka.endIn[1] <= Date.now()) {
        const sortedWinners = Object.entries(row.hludka.doneUsers).sort(
          (a: any, b: any) => b[1].tickets - a[1].tickets
        );
        const hcurrentWinners = sortedWinners.slice(0, row.hludka.winners);
        let hfinalText = `🏆 Лудка по билетам закончена!\n<blockquote expandable>Победители:\n`;
        for (const id of hcurrentWinners as any) {
          hfinalText += `<a href="tg://openmessage?user_id=${id[0]}">${id[1].name}</a>: ${id[1].tickets} 🎫\n`;
        }
        hsendResults(hfinalText + "</blockquote>");
        row.hludka.isActive = false;
        row.hludka.doneUsers = {};
        await supabase
          .from("users")
          .update({
            hludka: row.hludka,
          })
          .eq("tgId", 1);
        return;
      }
    }*/

    const admins = [7441988500, 6233759034, 7177688298];
    if (admins.includes(senderId) && msg) {
      switch (msg) {
        case "/ludka":
        case "/лудка":
        case ".лудка":
        case "🎰 Начать лудку":
        case "/ludka@StarzHubBot":
          ctx.reply(await getLudkaMessage(), {
            reply_markup: (await getLudkaButtons()).reply_markup,
            parse_mode: "HTML",
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          ctx.replyWithDice({
            emoji: "🎰",
            reply_parameters: {
              message_id: ctx.message?.message_id,
            },
          });
          let msgId = row.ludka.msgId;
          let chatId = row.ludka.chatId;
          if (
            "reply_to_message" in ctx.message &&
            ctx.message.reply_to_message?.sender_chat?.type === "channel" &&
            "forward_origin" in ctx.message.reply_to_message &&
            ctx.message.reply_to_message.forward_origin !== undefined &&
            "message_id" in ctx.message.reply_to_message.forward_origin
          ) {
            msgId = ctx.message.reply_to_message.forward_origin?.message_id;
            chatId = ctx.message.reply_to_message.sender_chat.id;
          }
          await supabase
            .from("users")
            .update({
              ludka: {
                isActive: true,
                winners: row.ludka.winners,
                doneUsers: row.ludka.doneUsers,
                currentWinners: row.ludka.currentWinners,
                requiredTimes: row.ludka.requiredTimes,
                requiredRow: row.ludka.requiredRow,
                neededComb: row.ludka.neededComb,
                msgId: await msgId,
                chatId: await chatId,
              },
            })
            .eq("tgId", 1);
          return;

        case "/stop_ludka":
        case "-лудка":
        case "📛 Закончить лудку":
        case "/stop_ludka@StarzHubBot":
          ctx.reply("❌ Лудка успешно остановлена!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const currentWinners = row.ludka.currentWinners;
          let finalText = `🏆 Лудка закончена! Победители:\n`;
          await Promise.all(
            currentWinners.map(async (id: any) => {
              finalText += `<a href="tg://openmessage?user_id=${id}">${
                row.ludka.doneUsers[`${id}`].name
              }</a>\n`;
            })
          );
          await sendResults(finalText);
          await supabase
            .from("users")
            .update({
              ludka: {
                isActive: false,
                winners: row.ludka.winners,
                doneUsers: {},
                currentWinners: [],
                requiredTimes: row.ludka.requiredTimes,
                requiredRow: row.ludka.requiredRow,
                neededComb: row.ludka.neededComb,
                msgId: row.ludka.msgId,
                chatId: row.ludka.chatId,
              },
            })
            .eq("tgId", 1);
          return;

        case "/hludka":
        case "/хлудка":
        case ".хлудка":
        case "🎫 Начать hлудку":
        case "/hludka@StarzHubBot":
          try {
            ctx.reply(await getHludkaMessage(), {
              reply_markup: (await getHludkaButtons()).reply_markup,
              parse_mode: "HTML",
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            });
          } catch (error: any) {
            ctx.reply(
              "❌ " + error.message || error.stack || JSON.stringify(error),
              {
                reply_parameters: {
                  message_id: ctx.message.message_id,
                },
              }
            );
          }
          ctx.replyWithDice({
            emoji: "🎰",
            reply_parameters: {
              message_id: ctx.message?.message_id,
            },
          });
          let hmsgId = row.ludka.msgId;
          let hchatId = row.ludka.chatId;
          if (
            "reply_to_message" in ctx.message &&
            ctx.message.reply_to_message?.sender_chat?.type === "channel" &&
            "forward_origin" in ctx.message.reply_to_message &&
            ctx.message.reply_to_message.forward_origin !== undefined &&
            "message_id" in ctx.message.reply_to_message.forward_origin
          ) {
            hmsgId = ctx.message.reply_to_message.forward_origin?.message_id;
            hchatId = ctx.message.reply_to_message.sender_chat.id;
          }
          row.hludka.msgId = await hmsgId;
          row.hludka.chatId = await hchatId;
          row.hludka.isActive = true;
          await supabase
            .from("users")
            .update({
              hludka: row.hludka,
            })
            .eq("tgId", 1);
          return;

        case "/game":
        case "/игра":
        case ".игра":
        case "🎮 Начать игру":
        case "/game@StarzHubBot":
          ctx.reply(await getGameMessage(row), {
            reply_markup: (await getGameButtons(row)).reply_markup,
            parse_mode: "HTML",
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          return;

        case "/stop_game":
        case "-игра":
        case "📛 Закончить игру":
        case "/stop_game@StarzHubBot":
          ctx.reply("❌ Игра успешно остановлена!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const winners = Object.entries(row.game.doneUsers)
            .sort((a: any, b: any) => b[1].points - a[1].points)
            .slice(0, row.game.winners)
            .map(
              ([user, data]: any, index) =>
                `${index + 1}. <a href="tg://openmessage?user_id=${user}">${
                  data.name
                }</a>: ${
                  data.points
                } <a href="https://t.me/StarzHubBot?start=profile_${user}">📎</a>`
            )
            .join("\n");
          const sortedUsers = Object.entries(row?.game.doneUsers)
            .filter(([_, data]: any) => data?.progress >= row?.game.moves)
            .sort((a: any, b: any) => b[1].points - a[1].points)
            .slice(0, 50)
            .map(
              ([user, data]: any, index) =>
                `<a href="https://t.me/StarzHubBot?start=profile_${user}">${
                  index + 1
                }. </a><b><a href="tg://openmessage?user_id=${user}">${
                  data.name
                }</a></b>: ${data.points}`
            )
            .join("\n");
          bot.telegram.sendMessage(
            row.game.chatId,
            `❌ Игра остановлена!\n<blockquote expandable><b>🏆 Победители</b>\n${winners}</blockquote>`,
            {
              reply_parameters: {
                message_id: row.game.msgId,
              },
              parse_mode: "HTML",
              link_preview_options: {
                is_disabled: true,
              },
            }
          );
          bot.telegram.editMessageText(
            row.game.chatId,
            row.game.msgId,
            undefined,
            `${await getPostGameMessage(
              row
            )}\n\n<blockquote expandable><b>Топ 🎖️</b>\n${sortedUsers}</blockquote>\n\n❌ Игра остановлена!\n<blockquote expandable><b>🏆 Победители</b>\n${winners}</blockquote>`,
            {
              parse_mode: "HTML",
              reply_markup: {
                inline_keyboard: [
                  [Markup.button.callback(`🏁 Игра завершена!`, "return")],
                ],
              },
              link_preview_options: {
                is_disabled: true,
              },
            }
          );
          row.game.isActive = false;
          row.game.setupStage = 0;
          row.game.msgId = 0;
          await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
          return;

        case "/upd":
        case "🔄 Обновить данные":
          await updateLeaderboard(ctx, senderId);
          await ctx.reply(`${Object.keys(row.game.doneUsers).length}`);
          break;

        case "/set_game*hub":
        case "/set_game*lnt":
        case "/set_game*test":
          ctx.reply("Успешно ✅", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const channel = msg.split("*")[1];
          row.game.chatId =
            channel === "hub"
              ? -1002506008123
              : channel === "lnt"
              ? -1002551457192
              : -1002606260123;
          await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
          return;

        case "/set_hludka*hub":
        case "/set_hludka*lnt":
        case "/set_hludka*test":
          ctx.reply("Успешно ✅", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const channel1 = msg.split("*")[1];
          row.hludka.chatId =
            channel1 === "hub"
              ? -1002506008123
              : channel1 === "lnt"
              ? -1002551457192
              : -1002606260123;
          await supabase
            .from("users")
            .update({ hludka: row.hludka })
            .eq("tgId", 1);
          return;

        case "/set_lotery*hub":
        case "/set_lotery*lnt":
        case "/set_lotery*test":
          ctx.reply("Успешно ✅", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const channel2 = msg.split("*")[1];
          row.lotery.chatId =
            channel2 === "hub"
              ? -1002506008123
              : channel2 === "lnt"
              ? -1002551457192
              : -1002606260123;
          await supabase
            .from("users")
            .update({ lotery: row.lotery })
            .eq("tgId", 1);
          return;

        case "/hludka_top":
        case "/top":
        case "/hludka_top@StarzHubBot":
        case "/top@StarzHubBot":
        case "🏆 Топ":
        case "/топ":
          const htop = Object.entries(row.hludka.doneUsers)
            .filter((arr: any) => arr[1].tickets > 0)
            .sort((a: any, b: any) => b[1].tickets - a[1].tickets)
            .map(
              (arr: any, index: number) =>
                `${
                  index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`
                } <a href="tg://openmessage?user_id=${arr[0]}">${arr[1].name}</a>: ${
                  arr[1].tickets
                } 🎫`
            )
            .join("\n");
          ctx.reply(
            "<blockquote expandable><b>🏆 ТОП</b>\n" + htop + "</blockquote>",
            {
              parse_mode: "HTML",
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            }
          );
          return;

        case "/stop_hludka":
        case "-хлудка":
        case "📛 Закончить hлудку":
        case "/stop_hludka@StarzHubBot":
          ctx.reply("❌ Игра успешно остановлена!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const htop1 = Object.entries(row.hludka.doneUsers)
            .filter((arr: any) => arr[1].tickets > 0)
            .sort((a: any, b: any) => b[1].tickets - a[1].tickets)
            .map(
              (arr: any, index: number) =>
                `${
                  index === 0
                    ? "🥇"
                    : index === 1
                    ? "🥈"
                    : index === 2
                    ? "🥉"
                    : `${index + 1}.`
                } <a href="tg://openmessage?user_id=${arr[0]}">${arr[1].name}</a>: ${
                  arr[1].tickets
                } 🎫`
            )
            .join("\n");
          let hfinalText = `🏆 Лудка по билетам закончена!\n<blockquote expandable>Победители:\n${htop1}`;
          hsendResults(hfinalText + "</blockquote>");
          row.hludka.isActive = false;
          row.hludka.doneUsers = {};
          await supabase
            .from("users")
            .update({
              hludka: row.hludka,
            })
            .eq("tgId", 1);
          return;

        case "/clava":
        case "/clava@StarzHubBot":
          ctx.reply("✅ Успешно добавлена!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
            reply_markup: getClava().reply_markup,
          });
          return;

        case "/lotery":
        case "/lotery@StarzHubBot":
        case "/лотерея":
        case "🎫 Начать лотерею":
        case ".лотерея":
          await ctx.reply("✅ Лотерея успешно активирована!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          row.lotery.isActive = true;
          const buttons = Array(row.lotery.tickets).fill({
            from: null,
            win: false,
          });
          const indices: number[] = [];
          for (let i = 0; i < row.lotery.winners; i++) {
            let idx: number;
            do {
              idx = Math.floor(Math.random() * buttons.length);
            } while (indices.includes(idx) || buttons[idx].win);
            indices.push(idx);
            buttons[idx] = { from: null, win: true };
          }
          row.lotery.doneTickets = buttons;
          await supabase
            .from("users")
            .update({ lotery: row.lotery })
            .eq("tgId", 1)
            .then(async () => {
              const msg1 = await bot.telegram.sendMessage(
                row.hludka.chatId,
                `🎫 Начало лотереи!\n<blockquote>${row.lotery.text}</blockquote>`,
                {
                  parse_mode: "HTML",
                  reply_markup: (await getLoteryButtons(row)).reply_markup,
                }
              );
              row.lotery.msgId = msg1.message_id;
              await supabase
                .from("users")
                .update({ lotery: row.lotery })
                .eq("tgId", 1);
              return;
            });
      }
      if (
        msg.startsWith("/game_text ") ||
        msg.startsWith("/game_text@StarzHubBot ")
      ) {
        row.game.text = msg.slice(11);
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/game_moves ") ||
        msg.startsWith("/game_moves@StarzHubBot ")
      ) {
        const newState = Number(msg.split(" ")[1]);
        row.game.moves = newState;
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/game_space ") ||
        msg.startsWith("/game_space@StarzHubBot")
      ) {
        const newState = Number(msg.split(" ")[1]);
        row.game.space = newState;
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/game_winners ") ||
        msg.startsWith("/game_winners@StarzHubBot")
      ) {
        const newState = Number(msg.split(" ")[1]);
        row.game.winners = newState;
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/points top") ||
        msg.startsWith("/points@StarzHubBot top")
      ) {
        const place = Number(msg.split("top")[1].split(" ")[0]);
        const top = Object.entries(row.game.doneUsers).sort(
          (a: any, b: any) => b[1].points - a[1].points
        )[place - 1];
        const value = Number(msg.split(" ")[2]);
        row.game.doneUsers[top[0]].points = value;
        await supabase
          .from("users")
          .update({
            game: row.game,
          })
          .eq("tgId", 1);
        await updateLeaderboard(row, Number(top[0]));
        ctx.reply("✅ Успешно");
        return;
      } else if (
        msg.toLowerCase().startsWith("/start profile_") ||
        msg.startsWith("/start@StarzHubBot profile_")
      ) {
        const id = Number(msg.split("_")[1]);
        const top = Object.entries(row?.game.doneUsers).sort(
          (a: any, b: any) => b[1].points - a[1].points
        );
        const place = top.map((a: any) => a[0]).indexOf(id.toString());
        const earlyData: {
          id: number;
          name: string;
          points: number;
          x: number;
        }[] = Object.values(row.game.doneUsers)
          .filter((us: any) => us !== undefined)
          .map((us: any, index: number) => ({
            id: Number(Object.keys(row.game.doneUsers)[index]),
            name: us.name ?? "Имя: ❌",
            points: us.points,
            x: 0,
          }));
        const similarProfiles = globalSearch(
          row.game.doneUsers[`${id}`]?.name ??
            (await bot.telegram.getChatMember(-1002506008123, id))?.user
              ?.first_name ??
            "Имя: ❌",
          earlyData
        )
          .filter((user: any) => user[1] !== undefined)
          .map(
            (user: any) =>
              `<a href="https://t.me/StarzHubBot?start=profile_${user[0]}">${user[1].name}</a>: ${user[1].x}x <a href="tg://openmessage?user_id=${user[0]}">(ТГ)</a>`
          )
          .join("\n");
        ctx.reply(
          `${
            row.game.doneUsers[`${id}`]?.name ??
            (await bot.telegram.getChatMember(-1002506008123, id))?.user
              ?.first_name ??
            "Имя: ❌"
          } | ${id} | Топ-${place + 1} | ${
            (await bot.telegram.getChatMember(-1002506008123, id))?.user
              ?.username
              ? `@${
                  (await bot.telegram.getChatMember(-1002506008123, id))?.user
                    ?.username
                }`
              : "Тег: ❌"
          }\n<b>✔ Ходы</b>: ${
            row.game.doneUsers[`${id}`]?.progress ?? 0
          } | <b>✔ Очки</b>: ${
            row.game.doneUsers[`${id}`]?.points ?? 0
          } | <b>🕹 Мод</b>: ${
            row.game.doneUsers[`${id}`]?.set === "gamer"
              ? '"Я сам ✍"'
              : row.game.doneUsers[`${id}`]?.set === "bot"
              ? '"Бот 🤖"'
              : "❌"
          }\n\n<b>Ссылка #1</b>: <a href="tg://user?id=${id}">ТЫК 📎</a> | <b>Ссылка #2</b>: <a href="tg://openmessage?user_id=${id}">ТЫК 📎</a>\n\n<blockquote expandable><b>👤 Схожие профили</b>:\n${similarProfiles}</blockquote>`,
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
            parse_mode: "HTML",
            link_preview_options: {
              is_disabled: true,
            },
          }
        );
        return;
      } else if (
        msg.toLowerCase().startsWith("/delete") ||
        msg.startsWith("/delete@StarzHubBot ")
      ) {
        const chatId = Number(msg.split(" ")[1]);
        const msgId = Number(msg.split(" ")[2]);
        bot.telegram.deleteMessage(chatId, msgId);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/reply ") ||
        msg.startsWith("/reply@StarzHubBot")
      ) {
        const chatId = Number(msg.split(" ")[1]);
        const msgId = Number(msg.split(" ")[2].split("_")[0]);
        const text = msg.split("_")[1];
        bot.telegram.sendMessage(chatId, text, {
          reply_parameters: {
            message_id: msgId,
          },
        });
      } else if (
        msg.toLowerCase().startsWith("/max_tickets ") ||
        msg.startsWith("/max_tickets@StarzHubBot ")
      ) {
        const tickets = Number(msg.split(" ")[1]);
        row.hludka.endIn[0] = "tickets";
        row.hludka.endIn[1] = tickets;
        await supabase
          .from("users")
          .update({ hludka: row.hludka })
          .eq("tgId", 1);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/time ") ||
        msg.startsWith("/time@StarzHubBot ")
      ) {
        const time = msg.split(" ")[1] + "+03:00";
        row.hludka.endIn[0] = "time";
        row.hludka.endIn[1] = new Date(time).getTime();
        await supabase
          .from("users")
          .update({ hludka: row.hludka })
          .eq("tgId", 1);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/lotery_text ") ||
        msg.startsWith("/lotery_text@StarzHubBot ")
      ) {
        row.lotery.text = msg.slice(13);
        await supabase
          .from("users")
          .update({ lotery: row.lotery })
          .eq("tgId", 1);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/lotery_tickets ") ||
        msg.startsWith("/lotery_tickets@StarzHubBot ")
      ) {
        const newState = Number(msg.split(" ")[1]);
        row.lotery.tickets = newState;
        await supabase
          .from("users")
          .update({ lotery: row.lotery })
          .eq("tgId", 1);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/lotery_winners ") ||
        msg.startsWith("/lotery_winners@StarzHubBot ")
      ) {
        const newState = Number(msg.split(" ")[1]);
        row.lotery.winners = newState;
        await supabase
          .from("users")
          .update({ lotery: row.lotery })
          .eq("tgId", 1);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/lotery_prizes ") ||
        msg.startsWith("/lotery_prizes@StarzHubBot ")
      ) {
        const newState: any = {};
        for (let i = 0; i < row.lotery.winners; i++) {
          if (
            newState[msg.split(" ")[i + 1]] === undefined ||
            newState[msg.split(" ")[i + 1]] === null
          ) {
            newState[msg.split(" ")[i + 1]] = 0;
          } else {
            newState[`${msg.split(" ")[i + 1]} ${i}`] = 0;
          }
        }
        row.lotery.prizes = newState;
        await supabase
          .from("users")
          .update({ lotery: row.lotery })
          .eq("tgId", 1);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message?.message_id,
          },
        });
        return;
      } else if (
        msg.toLowerCase().startsWith("/ban") ||
        msg.startsWith("/ban@StarzHubBot")
      ) {
        const chatId = Number(msg.split(" ")[1]);
        const usId = Number(msg.split(" ")[2]);
        bot.telegram.banChatMember(chatId, usId);
        ctx.reply("✅ Успешно", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      }
    }

    if (!row.ludka.doneUsers[`${senderId}`] && row.ludka.isActive) {
      row.ludka.doneUsers[`${senderId}`] = {
        lastWins: 0,
        times: 0,
        name: ctx.message.from?.first_name || "Player",
      };
    }
    if (!row.hludka.doneUsers[`${senderId}`] && row.hludka.isActive) {
      row.hludka.doneUsers[`${senderId}`] = {
        tickets: 0,
        name: ctx.message.from?.first_name || "Player",
      };
    }
    await supabase.from("users").update(row).eq("tgId", 1);
    let extraCheck = false;
    if (row.ludka.doneUsers[`${senderId}`]) {
      extraCheck =
        (await row.ludka.doneUsers[`${senderId}`].lastWins) + 1 >=
        row.ludka.requiredRow;
    }
    const neededValue =
      row.ludka.neededComb === "7️⃣"
        ? 64
        : row.ludka.neededComb === "🍋"
        ? 43
        : row.ludka.neededComb === "🍇"
        ? 22
        : 1;
    if (
      row.ludka.isActive &&
      senderId !== ctx.message.chat.id &&
      "reply_to_message" in ctx.message &&
      ctx.message.reply_to_message?.from?.id === 777000 &&
      "dice" in ctx.message &&
      (ctx.message.dice as any).value === neededValue &&
      row.ludka.winners === row.ludka.currentWinners.length + 1
    ) {
      try {
        row.ludka.doneUsers = row.ludka.doneUsers || {};

        if (!row.ludka.doneUsers[`${senderId}`]) {
          row.ludka.doneUsers[`${senderId}`] = { lastWins: 0, times: 0 };
        }

        const userData = row.ludka.doneUsers[`${senderId}`];

        if (
          (row.ludka.requiredTimes >= (await userData).times + 1 &&
            row.ludka.requiredRow == 1) ||
          (extraCheck && row.ludka.requiredRow > 1)
        ) {
          await ctx.reply("✅ У нас есть победитель!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });

          const currentWinners = [...row.ludka.currentWinners, senderId];
          let finalText = `🏆 Лудка закончена! Победители:\n`;

          await Promise.all(
            currentWinners.map(async (id) => {
              finalText += `<a href="tg://openmessage?user_id=${id}">${
                row.ludka.doneUsers[`${id}`].name
              }</a>\n`;
            })
          );

          await sendResults(finalText);
          row.ludka.isActive = false;
          row.ludka.doneUsers = {};
          row.ludka.currentWinners = [];

          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        } else if (
          row.ludka.requiredTimes < (await userData).times + 1 &&
          row.ludka.requiredRow === 1
        ) {
          const remainingAttempts =
            row.ludka.requiredTimes - (await userData).times - 1;

          await ctx.reply(
            `🎊 Поздравляем! Вы выбили нужную комбинацию, Но вам придётся выбить это же ещё ${remainingAttempts} раз!`,
            {
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            }
          );

          row.ludka.doneUsers[`${senderId}`] = {
            lastWins: row.ludka.doneUsers[`${senderId}`].lastWins + 1,
            times: row.ludka.doneUsers[`${senderId}`].times + 1,
          };

          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        } else if (!extraCheck && row.ludka.requiredRow > 1) {
          const remainingAttempts =
            row.ludka.requiredRow - (await userData).lastWins - 1;

          await ctx.reply(
            `🎊 Поздравляем! Вы выбили нужную комбинацию, но вам придётся выбить это же ещё ${remainingAttempts} раз следующей попыткой!`,
            {
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            }
          );

          row.ludka.doneUsers[`${senderId}`] = {
            lastWins: row.ludka.doneUsers[`${senderId}`].lastWins + 1,
            times: row.ludka.doneUsers[`${senderId}`].times + 1,
          };

          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        } else {
          await ctx.reply("Произошла ошибка!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
        }

        await ctx.react("🎉", true);

        const stickers = [
          "CAACAgIAAxkBAAEPBh9ohVdxJcsomD-tLwwG_1YlSUIktgAC6RkAAhZeKEimg5LObeZqozYE",
          "CAACAgIAAxkBAAEPBiBohVdxINYqfccrgJC_D8gtaQMCSAACqhgAAg9lCEoGzNzn0P2-0zYE",
          "CAACAgIAAxkBAAEO3bZoakWLtC2BLxtCz-44rPorOiyLTgACSgIAAladvQrJasZoYBh68DYE",
          "CAACAgIAAxkBAAEPBiJohVdxbYewkFW7Y_HBYinkcLV3FAAC_xoAAhaNgUkgU21P6dzWmzYE",
          "CAACAgEAAxkBAAEPBiNohVdxM1x7ygJxSV3JpOMZieJAZAACtAIAAs2j-UTxghF_qaLQVjYE",
          "CAACAgIAAxkBAAEPBbFohOwUueOz-QgyXd2t8EMHvvIR8AACyxsAAgPamEiwRqVGuLHqQzYE",
          "CAACAgIAAxkBAAEPB11ohqNJG_kaJr4LJbSyI6wm_P8AATgAAnwdAALlAzlLyEU_5iJrorg2BA",
        ];

        await ctx.replyWithSticker(
          stickers[Math.floor(Math.random() * stickers.length)],
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
      } catch (error: any) {
        console.error("Error in ludka handler:", error);
        try {
          await bot.telegram.sendMessage(
            7441988500,
            "Произошла ошибка: " + error
          );
        } catch (e) {
          console.error("Failed to send error message:", e);
        }
      }
    } else if (
      row.ludka.isActive &&
      senderId !== ctx.message.chat.id &&
      "reply_to_message" in ctx.message &&
      ctx.message.reply_to_message?.from?.id === 777000 &&
      "dice" in ctx.message &&
      (ctx.message.dice as any).value === neededValue &&
      row.ludka.winners !== row.ludka.currentWinners.length + 1
    ) {
      try {
        row.ludka.doneUsers = row.ludka.doneUsers || {};

        if (!row.ludka.doneUsers[`${senderId}`]) {
          row.ludka.doneUsers[`${senderId}`] = { lastWins: 0, times: 0 };
        }

        const userData = await row.ludka.doneUsers[`${senderId}`];

        if (
          row.ludka.requiredTimes >= (await userData).times + 1 &&
          extraCheck
        ) {
          const remainingWinners =
            row.ludka.winners === 1000
              ? "∞"
              : row.ludka.winners - row.ludka.currentWinners.length - 1;

          await ctx.reply(
            `✅ У нас есть победитель!\n🏆 Ещё победителей может быть: ${remainingWinners}`,
            {
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            }
          );

          row.ludka.currentWinners.push(senderId);
          row.ludka.doneUsers[`${senderId}`] = {
            lastWins: row.ludka.doneUsers[`${senderId}`].lastWins + 1,
            times: row.ludka.doneUsers[`${senderId}`].times + 1,
          };
          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        } else if (
          row.ludka.requiredTimes < (await userData).times + 1 &&
          row.ludka.requiredRow === 1
        ) {
          const remainingAttempts =
            row.ludka.requiredTimes - (await userData).times + 1;

          await ctx.reply(
            `🎊 Поздравляем! Вы выбили нужную комбинацию, Но вам придётся выбить это же ещё ${remainingAttempts} раз!`,
            {
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            }
          );

          row.ludka.doneUsers[`${senderId}`] = {
            lastWins: row.ludka.doneUsers[`${senderId}`].lastWins + 1,
            times: row.ludka.doneUsers[`${senderId}`].times + 1,
          };

          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        } else if (!extraCheck && row.ludka.requiredRow > 1) {
          const remainingAttempts =
            row.ludka.requiredRow - (await userData).lastWins - 1;

          await ctx.reply(
            `🎊 Поздравляем! Вы выбили нужную комбинацию, но вам придётся выбить это же ещё ${remainingAttempts} раз следующей попыткой!`,
            {
              reply_parameters: {
                message_id: ctx.message.message_id,
              },
            }
          );

          row.ludka.doneUsers[`${senderId}`] = {
            lastWins: row.ludka.doneUsers[`${senderId}`].lastWins + 1,
            times: row.ludka.doneUsers[`${senderId}`].times + 1,
          };

          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        }

        await ctx.react("🎉", true);

        const stickers = [
          "CAACAgIAAxkBAAEPBh9ohVdxJcsomD-tLwwG_1YlSUIktgAC6RkAAhZeKEimg5LObeZqozYE",
          "CAACAgIAAxkBAAEPBiBohVdxINYqfccrgJC_D8gtaQMCSAACqhgAAg9lCEoGzNzn0P2-0zYE",
          "CAACAgIAAxkBAAEO3bZoakWLtC2BLxtCz-44rPorOiyLTgACSgIAAladvQrJasZoYBh68DYE",
          "CAACAgIAAxkBAAEPBiJohVdxbYewkFW7Y_HBYinkcLV3FAAC_xoAAhaNgUkgU21P6dzWmzYE",
          "CAACAgEAAxkBAAEPBiNohVdxM1x7ygJxSV3JpOMZieJAZAACtAIAAs2j-UTxghF_qaLQVjYE",
          "CAACAgIAAxkBAAEPBbFohOwUueOz-QgyXd2t8EMHvvIR8AACyxsAAgPamEiwRqVGuLHqQzYE",
          "CAACAgIAAxkBAAEPB11ohqNJG_kaJr4LJbSyI6wm_P8AATgAAnwdAALlAzlLyEU_5iJrorg2BA",
        ];

        await ctx.replyWithSticker(
          stickers[Math.floor(Math.random() * stickers.length)],
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
      } catch (error: any) {
        console.error("Error in ludka handler (second block):", error);
        try {
          await bot.telegram.sendMessage(
            7441988500,
            "Произошла ошибка: " + error
          );
        } catch (e) {
          console.error("Failed to send error message:", e);
        }
      }
    } else if (
      row.ludka.isActive &&
      senderId !== ctx.message.chat.id &&
      "reply_to_message" in ctx.message &&
      ctx.message.reply_to_message?.from?.id === 777000 &&
      "dice" in ctx.message &&
      (ctx.message.dice as any).value !== neededValue &&
      row.ludka.doneUsers[`${senderId}`].lastWins > 0
    ) {
      if (row.ludka.requiredRow > 1) {
        ctx.reply("❌ Ваш стрик приостановился!", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
      }
      row.ludka.doneUsers[`${senderId}`] = {
        times: row.ludka.doneUsers[`${senderId}`].times,
        lastWins: 0,
      };
      await supabase
        .from("users")
        .update({
          ludka: row.ludka,
        })
        .eq("tgId", 1);
    } else if (
      row.game.isActive &&
      senderId === ctx.message.chat.id &&
      "dice" in ctx.message &&
      ctx.message.dice.emoji ===
        (row.game.type === "cubic"
          ? "🎲"
          : row.game.type === "darts"
          ? "🎯"
          : row.game.type === "bowling"
          ? "🎳"
          : row.game.type === "basketball"
          ? "🏀"
          : "⚽️") &&
      row.game.doneUsers[`${senderId}`] &&
      row.game.doneUsers[`${senderId}`].set === "gamer" &&
      row.game.doneUsers[`${senderId}`].progress < row.game.moves
    ) {
      const PlusDice = (() => {
        if (row.game.type === "cubic") {
          return ctx.message.dice.value;
        } else if (row.game.type === "darts") {
          return ctx.message.dice.value - 1;
        } else if (row.game.type === "basketball") {
          return ctx.message.dice.value >= 4 ? 1 : 0;
        } else if (row.game.type === "football") {
          return ctx.message.dice.value >= 3 ? 1 : 0;
        } else if (row.game.type === "bowling") {
          return ctx.message.dice.value === 2
            ? 1
            : ctx.message.dice.value === 1
            ? 0
            : ctx.message.dice.value;
        }
        return 0;
      })();
      let randomReacts = [];
      const rand = Math.floor(Math.random() * 3);
      if (
        row.game.type === "cubic" ||
        row.game.type === "darts" ||
        row.game.type === "bowling"
      ) {
        switch (PlusDice) {
          case 0:
          case 1:
          case 2:
            randomReacts = ["🤮", "💩", "👎"] as const;
            await ctx.react(randomReacts[rand] as TelegramEmoji, true);
            break;
          case 3:
          case 4:
            randomReacts = ["👍", "⚡", "✍"] as const;
            await ctx.react(randomReacts[rand] as TelegramEmoji, true);
            break;
          case 5:
          case 6:
            randomReacts = ["🎉", "🏆", "😎"] as const;
            await ctx.react(randomReacts[rand] as TelegramEmoji, true);
            break;
        }
      } else {
        switch (PlusDice) {
          case 0:
            randomReacts = ["🤮", "💩", "👎"] as const;
            await ctx.react(randomReacts[rand] as TelegramEmoji, true);
            break;
          case 1:
            randomReacts = ["🎉", "🏆", "😎"] as const;
            await ctx.react(randomReacts[rand] as TelegramEmoji, true);
            break;
        }
      }
      row.game.doneUsers[`${senderId}`].progress += 1;
      row.game.doneUsers[`${senderId}`].points += PlusDice;
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      await ctx.reply(
        `🐾 Вы получили +${PlusDice} очк${
          PlusDice === 1 ? "о" : [2, 3, 4].includes(PlusDice) ? "а" : "ов"
        }\nВаши очки: ${row.game.doneUsers[`${senderId}`].points} 🦾\n♟ Ход: ${
          row.game.doneUsers[`${senderId}`].progress
        }/${row.game.moves}`,
        {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        }
      );
      if (
        row.game.doneUsers[`${senderId}`].progress >= row.game.moves &&
        row.game.isActive
      ) {
        await ctx.reply(
          `🎉 Игра завершена! Ваш результат: ${
            row.game.doneUsers[`${senderId}`].points
          } очков 🏆`,
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
        await updateLeaderboard(ctx, senderId);
      }
      if (Object.entries(row?.game.doneUsers).length >= row?.game.space) {
        await endGlobalGame(ctx);
      }
    } else if (
      row.hludka.isActive &&
      senderId !== ctx.message.chat.id &&
      "reply_to_message" in ctx.message &&
      ctx.message.reply_to_message?.from?.id === 777000 &&
      "dice" in ctx.message &&
      [1, 22, 43, 64].includes(ctx.message.dice.value)
    ) {
      const comb =
        ctx.message.dice.value == 64
          ? "7️⃣"
          : ctx.message.dice.value === 43
          ? "🍋"
          : ctx.message.dice.value === 22
          ? "🍇"
          : "BAR";
      const tickets = row.hludka.tickets[comb];
      row.hludka.doneUsers[`${senderId}`].tickets += tickets;
      let allTickets = 0;
      Object.entries(row.hludka.doneUsers).forEach((arr: any) => {
        allTickets += arr[1].tickets;
      });
      await supabase.from("users").update({ hludka: row.hludka }).eq("tgId", 1);
      const htop = Object.entries(row.hludka.doneUsers)
        .filter((arr: any) => arr[1].tickets > 0)
        .sort((a: any, b: any) => b[1].tickets - a[1].tickets)
        .map(
          (arr: any, index: number) =>
            `${
              index === 0
                ? "🥇"
                : index === 1
                ? "🥈"
                : index === 2
                ? "🥉"
                : `${index + 1}.`
            } <a href="tg://openmessage?user_id=${arr[0]}">${arr[1].name}</a>: ${
              arr[1].tickets
            } 🎫`
        )
        .join("\n");
      const randomReacts = ["🏆", "🎉", "💪", "⚡", "✍", "😎", "👍"] as const;
      ctx.react(
        randomReacts[
          Math.floor(Math.random() * randomReacts.length)
        ] as TelegramEmoji,
        true
      );
      ctx.reply(
        `🎉 Ура! Вы выбили ${comb}${comb}${comb}!\n<b>Вам выдано билетов:</b> +${tickets} 🎫\n<b>🕹 Ваши билеты:</b> ${
          row.hludka.doneUsers[`${senderId}`].tickets
        }\n\n<b>⚡ Всего билетов:</b> ${allTickets}\n<blockquote expandable><b>🏆 ТОП</b>\n${htop}</blockquote>`,
        {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
          parse_mode: "HTML",
        }
      );
      if (
        row.hludka.endIn[0] === "tickets" &&
        allTickets >= row.hludka.endIn[1]
      ) {
        const sortedWinners = Object.entries(row.hludka.doneUsers).sort(
          (a: any, b: any) => b[1].tickets - a[1].tickets
        );
        const currentWinners = sortedWinners.slice(0, row.hludka.winners);
        let finalText = `🏆 Лудка по билетам закончена!\n<blockquote expandable>Победители:\n`;
        for (const id of currentWinners as any) {
          finalText += `<a href="tg://openmessage?user_id=${id[0]}">${id[1].name}</a>: ${id[1].tickets} 🎫\n`;
        }
        hsendResults(finalText + "</blockquote>");
        row.hludka.isActive = false;
        row.hludka.doneUsers = {};
        await supabase
          .from("users")
          .update({
            hludka: row.hludka,
          })
          .eq("tgId", 1);
      }
    }

    switch (msg) {
      case "/start":
        ctx.reply(
          `⭐ Добро пожаловать в игрового бота <b>StarsHub</b>!\n<a href='tg://openmessage?user_id=${senderId}'>${senderName}</a>, для начала игры, нажмите на кнопку ниже 👇`,
          {
            reply_markup: {
              inline_keyboard: [
                [{ text: "🎉 Начать игру", url: config.webAppUrl }],
              ],
            },
            parse_mode: "HTML",
          }
        );
        return;

      case "/start game":
        if (!row.game.isActive) {
          ctx.reply("❌ Игра не активна в данный момент!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
        } else if (row.game.isActive && !row.game.doneUsers[`${senderId}`]) {
          row.game.doneUsers[`${senderId}`] = {
            name: ctx.message.from.first_name,
            set: "",
            progress: 0,
            points: 0,
          };
          ctx.reply(await getStartGameMessage(row, senderId), {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
            reply_markup: (await getStartGameButtons(row, senderId))
              .reply_markup,
          });
        } else {
          ctx.reply("❌ Вы уже присоединились ранее!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
        }
        return;

      case "/ludka":
      case "-лудка":
      case ".лудка":
      case "/лудка":
      case "/game":
      case "/игра":
      case ".игра":
      case "/game@StarzHubBot":
      case "-игра":
      case "/stop_game":
      case "/stop_game@StarzHubBot":
      case "/set_game":
      case "/game_text":
      case "/ludka@StarzHubBot":
      case "/stop_ludka":
      case "/game_text":
      case "/game_moves":
      case "/game_winners":
      case "/game_space":
      case "/game_winners":
      case "/points":
      case "/max_tickets":
      case "/time":
      case "/lotery_text":
      case "/lotery_tickets":
      case "/lotery_winners":
      case "/lotery_prizes":
      case "/game_text@StarzHubBot":
      case "/game_moves@StarzHubBot":
      case "/game_winners@StarzHubBot":
      case "/game_space@StarzHubBot":
      case "/game_winners@StarzHubBot":
      case "/points@StarzHubBot":
      case "/max_tickets@StarzHubBot":
      case "/time@StarzHubBot":
      case "/lotery_text@StarzHubBot":
      case "/lotery_tickets@StarzHubBot":
      case "/lotery_winners@StarzHubBot":
      case "/lotery_prizes@StarzHubBot":
      case "🎮 Начать игру":
      case "🔄 Обновить данные":
      case "📛 Закончить игру":
      case "🎰 Начать лудку":
      case "📛 Закончить лудку":
      case "🎫 Начать hлудку":
      case "🏆 Топ":
      case "📛 Закончить hлудку":
      case "🎫 Начать лотерею":
      case "/stop_ludka@StarzHubBot":
        ctx.reply(
          "❌ Вы не можете использовать эту команду, так как не являетесь администратором бота!",
          {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
        return;
    }

    if (msg && msg.startsWith("/top_up ")) {
      try {
        const amount = parseInt(msg.slice("/top_up ".length));
        if (isNaN(amount)) {
          ctx.reply(
            "❌ Некорректное количество звёзд. Пожалуйста, введите число."
          );
          return;
        }
        ctx.sendInvoice({
          title: "Пополнение баланса 🌟",
          description: "⭐ Для пополнения звёзд, нажмите на кнопку ниже 👇",
          start_parameter: "top_up",
          currency: "XTR",
          prices: [{ label: "Пополнение", amount: amount }],
          payload: JSON.stringify({ data: `top_up+${Date.now()}` }),
          provider_token: "TEST_PROVIDER_TOCKEN",
        });
      } catch (error) {
        ctx.reply("❌ Ошибка при попытки пополнения баланса.");
      }
    } else if (msg && msg.startsWith("/rand ")) {
      const minNum = Number(msg.split(" ")[1].split("-")[0]);
      const maxNum = Number(msg.split(" ")[1].split("-")[1]);
      const rand = Math.floor(Math.random() * (maxNum - minNum + 1)) + minNum;
      ctx.reply(`Йоу, я выбрал: ${rand.toString()} 😏`);
    }

    await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
  } catch (error) {
    if (error instanceof Error) {
      bot.telegram.sendMessage(
        7441988500,
        `Error occurred while processing message:\n${
          error.stack || error.message
        }`
      );
    }
  }
});

bot.on("pre_checkout_query", async (ctx) => {
  try {
    const { from, invoice_payload } = ctx.update.pre_checkout_query;
    const userId = from.id;
    const data = JSON.parse(invoice_payload);
    bot.telegram.sendMessage(7441988500, `Пополнение баланса ${userId}`);
    bot.telegram.sendMessage(7441988500, JSON.stringify(data));

    const { data: user } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", userId)
      .single();
    
    bot.telegram.sendMessage(7441988500, JSON.stringify(user));
    bot.telegram.sendMessage(7441988500, JSON.stringify(ctx.update.pre_checkout_query));

    if (user) {
      const newStars = user.stars + data.amount;
      bot.telegram.sendMessage(7441988500, `Новый баланс: ${newStars}\n${data.amount} ${user.stars}`);
      await supabase
        .from("users")
        .update({ stars: newStars })
        .eq("tgId", userId);
      await bot.telegram.sendMessage(
        userId, 
        `✅ Пополнение баланса прошло успешно! Теперь ваш баланс: ${newStars}`
      );
    } else {
      await ctx.answerPreCheckoutQuery(false, "❌ Пополнение баланса не прошло. Пожалуйста, повторите попытку.");
      return
    }
    await ctx.answerPreCheckoutQuery(true);
  } catch (error: any) {
    console.error("Error in pre_checkout_query:", error);
    await ctx.answerPreCheckoutQuery(false, `${error.message}`);
  }
});

export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams;
  const action = searchParams.get('action');
  const userId = searchParams.get('userId');

  // Новый endpoint для получения аватара
  if (action === 'getAvatar' && userId) {
    try {
      // Используем уже инициализированного бота
      const userProfile = await bot.telegram.getUserProfilePhotos(parseInt(userId));
      
      if (!userProfile.photos || userProfile.photos.length === 0) {
        return NextResponse.json({ error: 'No profile photo found' }, { status: 404 });
      }

      const fileId = userProfile.photos[0][2].file_id;
      const file = await bot.telegram.getFile(fileId);
      const filePath = file.file_path;
      
      // Возвращаем filePath для безопасного проксирования
      return NextResponse.json({ 
        success: true, 
        filePath: filePath 
      });
      
    } catch (error: any) {
      console.error('Error fetching avatar:', error);
      return NextResponse.json({ 
        error: 'Failed to fetch avatar',
        details: error.message 
      }, { status: 500 });
    }
  }

  // Остальная логика вашего бота...
  return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
}

export async function POST(req: Request) {
  try {
    const body = await req.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error("Error:", error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}

export const dynamic = "force-dynamic";
