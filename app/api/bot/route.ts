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

const sendResults = async (finalText: string) => {
  try {
    bot.telegram.sendMessage(7441988500, finalText, {
      parse_mode: "HTML",
    }); /* !! */
    /*bot.telegram.sendMessage(6233759034, finalText, {
      parse_mode: "HTML",
    });*/
    const { data: row, error } = await supabase
      .from("users")
      .select("*")
      .eq("tgId", 1)
      .single();
    await bot.telegram.sendMessage(
      row.ludka.chatId,
      finalText,
      {
        parse_mode: "HTML",
        reply_parameters: {
          message_id: row.ludka.msgId,
        }
      }
    );
  } catch (error: any) {
    bot.telegram.sendMessage(7441988500, `Error occurred while processing message:\n${error.stack || error.message}`);
  }
};

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

    if (admins.includes(senderId)) {
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
          row.ludka.requiredTimes != (await userData).times + 1 &&
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
          await ctx.reply(`Произошла ошибка: ${error.message}`, {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
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

        if (row.ludka.requiredTimes == (await userData).times + 1 && extraCheck) {
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
          }
          await supabase
            .from("users")
            .update({
              ludka: row.ludka,
            })
            .eq("tgId", 1);
        } else if (
          row.ludka.requiredTimes != (await userData).times + 1 &&
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
          await ctx.reply(`Произошла ошибка: ${error.message}`, {
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          });
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
