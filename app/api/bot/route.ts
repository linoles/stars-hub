import { config } from "@/app/config";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Markup, Telegraf } from "telegraf";

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

// Глобальное состояние игры
let globalGameState: {
  row: any;
  isActive: boolean;
} | null = null;

// Состояния игроков
const playerStates = new Map<
  number,
  {
    emoji: string;
    points: number;
    currentMove: number;
    startMessageId?: number;
    set: string
  }
>();

const saveGameState = async (gameData: any) => {
  try {
    // Сначала получаем текущее состояние
    const { data: currentData, error: fetchError } = await supabase
      .from("users")
      .select("game")
      .eq("tgId", 1)
      .single();

    if (fetchError) throw fetchError;

    // Объединяем изменения
    const updatedGame = {
      ...currentData.game,
      ...gameData,
      doneUsers: {
        ...currentData.game?.doneUsers,
        ...gameData.doneUsers,
      },
    };

    globalGameState = { row: { game: updatedGame }, isActive: true };

    // Атомарное обновление
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

  // Инициализация глобального состояния
  if (!globalGameState) {
    globalGameState = { row, isActive: true };
  }

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

  playerStates.set(from, {
    emoji,
    points: 0,
    currentMove: 0,
    startMessageId: startMessage.message_id,
    set: "bot"
  });
};

bot.action(/start_game_(\d+)/, async (ctx) => {
  const from = Number(ctx.match[1]);
  const playerState = playerStates.get(from);
  const { data: row, error } = await supabase
    .from("users")
    .select("game")
    .eq("tgId", from)
    .single();
  if (!playerState || !globalGameState || !globalGameState.row.game.moves || row?.game.doneUsers[`${from}`].set !== "bot" || error)
    return;

  try {
    // Удаление сообщения и бросок кубика
    if (playerState.startMessageId) await ctx.deleteMessage();
    const dice = await ctx.sendDice({ emoji: playerState.emoji });

    // Обновление состояния
    const PlusDice = (() => {
      if (globalGameState.row.game.type === "cubic") {
        return dice.dice.value;
      } else if (globalGameState.row.game.type === "darts") {
        return dice.dice.value - 1;
      } else if (globalGameState.row.game.type === "basketball") {
        return dice.dice.value >= 4 ? 1 : 0;
      } else if (globalGameState.row.game.type === "football") {
        return dice.dice.value >= 3 ? 1 : 0;
      } else if (globalGameState.row.game.type === "bowling") {
        return dice.dice.value === 2
          ? 1
          : dice.dice.value === 1
          ? 0
          : dice.dice.value;
      }
      return 0;
    })();
    playerState.points += PlusDice;
    playerState.currentMove++;

    // Атомарное сохранение
    const success = await saveGameState({
      doneUsers: {
        [`${from}`]: {
          name: ctx.from?.first_name || "Игрок",
          progress: playerState.currentMove,
          points: playerState.points,
        },
      },
    });

    if (!success) throw new Error("Save failed");

    const pointsEarned = PlusDice;
    await ctx.reply(
      `🐾 Вы получили +${pointsEarned} очк${
        pointsEarned === 1 ? "о" : [2, 3, 4].includes(pointsEarned) ? "а" : "ов"
      }\nВаши очки: ${playerState.points} 🦾\n♟ Ход: ${
        playerState.currentMove
      }/${globalGameState.row.game.moves}`
    );

    // Проверка завершения
    if (playerState.currentMove >= globalGameState.row.game.moves) {
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
      playerState.startMessageId = msg.message_id;
    }
  } catch (error) {
    console.error("Ошибка:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
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

    // Формируем топ игроков
    const sortedUsers = Object.entries(currentData.game.doneUsers)
      .filter(
        ([_, data]: any) => data?.progress >= currentData.game.moves
      )
      .sort((a: any, b: any) => b[1].points - a[1].points)
      .slice(0, 10)
      .map(
        ([user, data]: any, index) =>
          `${index + 1}. <b><a href="tg://user?id=${user}">${
            data.name
          }</a></b>: ${data.points}`
      )
      .join("\n");

    // Обновляем сообщение с таблицей лидеров
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
                  Object.entries(currentData.game.doneUsers).filter(
                    ([_, data]: any) =>
                      data?.progress >= currentData.game.moves
                  ).length
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
  if (!globalGameState) return;

  try {
    // Получаем актуальные данные
    const { data } = await supabase
      .from("users")
      .select("game")
      .eq("tgId", 1)
      .single();

    if (!data?.game) throw new Error("Данные игры не найдены");

    // Определяем победителей
    const winners = Object.entries(data.game.doneUsers)
      .sort((a: any, b: any) => b[1].points - a[1].points)
      .slice(0, data.game.winners)
      .map(
        ([user, data]: any, index) =>
          `<a href="tg://user?id=${user}">${data.name}</a> (Очки: ${data.points})`
      )
      .join(", ");
    const sortedUsers = Object.entries(data.game.doneUsers)
      .filter(
        ([_, data]: any) => data?.progress >= globalGameState?.row.game.moves
      )
      .sort((a: any, b: any) => b[1].points - a[1].points)
      .slice(0, 10)
      .map(
        ([user, data]: any, index) =>
          `${index + 1}. <b><a href="tg://user?id=${user}">${
            data.name
          }</a></b>: ${data.points}`
      )
      .join("\n");

    // Отправляем сообщение о победителях
    await bot.telegram.sendMessage(
      globalGameState.row.game.chatId,
      `🏆 Игра завершена!\nПобедители: ${winners}`,
      {
        reply_parameters: { message_id: globalGameState.row.game.msgId },
        parse_mode: "HTML",
      }
    );

    await bot.telegram.editMessageText(
      globalGameState.row.game.chatId,
      globalGameState.row.game.msgId,
      undefined,
      `${await getPostGameMessage(
        globalGameState.row
      )}\n\n<blockquote expandable><b>Топ 🏅</b>\n${sortedUsers}</blockquote>\n\n🏆 Игра завершена!\nПобедители: ${winners}`,
      {
        parse_mode: "HTML",
        reply_markup: {
          inline_keyboard: [
            [Markup.button.callback(`🏁 Игра завершена!`, "return")],
          ],
        },
      }
    );

    // Деактивируем игру
    await supabase
      .from("users")
      .update({
        game: {
          ...data.game,
          isActive: false,
          doneUsers: {},
          setupStage: 0,
        },
      })
      .eq("tgId", 1);

    // Очищаем глобальное состояние
    globalGameState = null;
  } catch (error) {
    console.error("Ошибка при завершении игры:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
  }
};

const finishGame = async (ctx: any, from: number) => {
  const playerState = playerStates.get(from);
  if (!playerState || !globalGameState) return;

  try {
    const success = await saveGameState({
      doneUsers: {
        [`${from}`]: {
          name: ctx.from?.first_name || "Игрок",
          progress: globalGameState.row.game.moves,
          points: playerState.points,
        },
      },
    });

    if (!success) throw new Error("Final save failed");

    await ctx.reply(
      `🎉 Игра завершена! Ваш результат: ${playerState.points} очков! 🏆`
    );

    await updateLeaderboard(ctx, from);

    if (
      Object.entries(globalGameState.row.game.doneUsers).filter(
        ([_, data]: any) => data?.progress >= globalGameState?.row.game.moves
      ).length >= globalGameState.row.game.space
    ) {
      await endGlobalGame(ctx);
    }
  } catch (error) {
    console.error("Ошибка завершения:", error);
    await bot.telegram.sendMessage(7441988500, "Произошла ошибка: " + error);
  } finally {
    playerStates.delete(from);
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
      finalText += `<a href="tg://openmessage?user_id=${id}">${id}</a>\n`;
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

bot.action("startGame", async (ctx) => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();
  row.game.isActive = true;
  row.game.setupStage = 0;
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

bot.on("message", async (ctx) => {
  try {
    const chats = [-1002608961312, -1002560347854, -1002674341448];
    if (
      !chats.includes(ctx.message.chat.id) &&
      ctx.message.chat.id !== ctx.message.from.id
    ) {
      await bot.telegram.leaveChat(ctx.message.chat.id);
      return;
    }
    const { data: row, error } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", 1)
      .single();
    if (
      "dice" in ctx.message &&
      !("forward_origin" in ctx.message) &&
      row.ludka.isActive &&
      ctx.message.reply_to_message?.from?.id !== 777000
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
    const msg = (ctx as Context).message.text;
    const senderId = ctx.message.from.id;
    const senderName = `${ctx.message.from.first_name ?? ""}${
      ctx.message.from.first_name && ctx.message.from.last_name ? " " : ""
    }${ctx.message.from.last_name ?? ""}`;
    const admins = [7441988500, 6233759034, 7177688298];

    if (admins.includes(senderId) && msg) {
      switch (msg) {
        case "/ludka":
        case "/лудка":
        case ".лудка":
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
              finalText += `<a href="tg://openmessage?user_id=${id}">${id}</a>\n`;
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

        case "/game":
        case "/игра":
        case ".игра":
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
        case "/stop_game@StarzHubBot":
          ctx.reply("❌ Игра успешно остановлена!", {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
          const winners = Object.entries(row.game.doneUsers)
            .filter(([_, data]: any) =>
              row.game.moves ? data?.progress >= row.game.moves : false
            )
            .sort((a: any, b: any) => b[1].points - a[1].points)
            .slice(0, row.game.winners)
            .map(
              ([user, data]: any, index) =>
                `<a href="tg://user?id=${user}">${data.name}</a> (Очки: ${data.points})`
            )
            .join(", ");
          bot.telegram.sendMessage(
            row.game.chatId,
            `❌ Игра остановлена!\n🏆 Победители: ${winners}`,
            {
              reply_parameters: {
                message_id: row.game.msgId,
              },
              parse_mode: "HTML",
            }
          );
          bot.telegram.editMessageText(
            row.game.chatId,
            row.game.msgId,
            undefined,
            `${await getPostGameMessage(
              row
            )}\n\n❌ Игра остановлена!\n🏆 Победители: ${winners}`,
            {
              parse_mode: "HTML",
            }
          );
          row.game.isActive = false;
          row.game.doneUsers = {};
          row.game.setupStage = 0;
          row.game.msgId = 0;
          await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
          return;

        case "upd":
          for(let i = 0; i < Object.keys(row.game.doneUsers).length; i++) {
            row.game.doneUsers[Object.keys(row.game.doneUsers)[i]].set = "bot";
          }

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
      }
      if (msg.startsWith("/game_text ")) {
        row.game.text = msg.slice(11);
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (msg.toLowerCase().startsWith("ходы ")) {
        const newState = Number(msg.split(" ")[1]);
        row.game.moves = newState;
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (msg.toLowerCase().startsWith("места ")) {
        const newState = Number(msg.split(" ")[1]);
        row.game.space = newState;
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      } else if (msg.toLowerCase().startsWith("победители ")) {
        const newState = Number(msg.split(" ")[1]);
        row.game.winners = newState;
        await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
        ctx.reply("Успешно ✅", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        return;
      }
    }

    if (!row.ludka.doneUsers[`${senderId}`]) {
      row.ludka.doneUsers[`${senderId}`] = { lastWins: 0, times: 0 };
    }
    await supabase.from("users").update(row).eq("tgId", 1);
    let extraCheck =
      (await row.ludka.doneUsers[`${senderId}`].lastWins) + 1 >=
      row.ludka.requiredRow;
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
              finalText += `<a href="tg://openmessage?user_id=${id}">${id}</a>\n`;
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
      row.game.doneUsers[`${senderId}`].progress += 1;
      row.game.doneUsers[`${senderId}`].points += PlusDice;
      await supabase
        .from("users")
        .update({
          game: row.game,
        })
        .eq("tgId", 1);
      await ctx.reply(`🐾 Вы получили +${PlusDice} очк${
        PlusDice === 1 ? "о" : [2, 3, 4].includes(PlusDice) ? "а" : "ов"
      }\nВаши очки: ${row.game.doneUsers[`${senderId}`].points} 🦾\n♟ Ход: ${
        row.game.doneUsers[`${senderId}`].progress
      }/${row.game.moves}`, {
        reply_parameters: {
          message_id: ctx.message.message_id,
        },
      });
      await supabase.from("users").update({ game: row.game }).eq("tgId", 1);
      if (row.game.doneUsers[`${senderId}`].progress >= row.game.moves) {
        await ctx.reply(`🎉 Игра завершена! Ваш результат: ${row.game.doneUsers[`${senderId}`].points} очков 🏆`, {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        await updateLeaderboard(ctx, senderId);
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
        // Доделать отправку ботом и сделать обработку получения
        return;

      case "/ludka":
      case "-лудка":
      case ".лудка":
      case "/лудка":
      case "/ludka@StarzHubBot":
      case "/stop_ludka":
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
          payload: JSON.stringify({ data: "top_up" }),
          provider_token: "8270325718:AAFfL73Yy6cpOO-WEFwys-qnb7t5kA_qVmE",
        });
      } catch (error) {
        ctx.reply("❌ Ошибка при попытки пополнения баланса.");
      }
    }
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
    const payload = ctx.update.pre_checkout_query.invoice_payload;
    const userId = ctx.update.pre_checkout_query.from.id;

    try {
      const data = JSON.parse(payload);
      const user = await supabase
        .from("users")
        .select("tgId, stars")
        .eq("tgId", userId)
        .single();

      if (user.data) {
        const newStars = user.data.stars + data.amount;
        await supabase
          .from("users")
          .update({ stars: newStars })
          .eq("tgId", userId);
        await ctx.reply(
          `✅ Пополнение баланса прошло успешно! Теперь ваш баланс: ${newStars}`
        );
      }
      await ctx.answerPreCheckoutQuery(true);
    } catch (e) {
      await ctx.answerPreCheckoutQuery(false, "Ошибка обработки платежа");
    }
  } catch (error) {
    console.error("Error in pre_checkout_query:", error);
    await ctx.answerPreCheckoutQuery(false, "Произошла ошибка");
  }
});

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
