import { config } from "@/app/config";
import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";
import { Markup, Telegraf } from "telegraf";

const bot = new Telegraf("8270325718:AAFfL73Yy6cpOO-WEFwys-qnb7t5kA_qVmE");

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);

const getLudkaButtons = async () => {
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();

  return Markup.inlineKeyboard([
    [
      Markup.button.callback("7️⃣", "/ludka 7️⃣"),
      Markup.button.callback("🍋", "/ludka 🍋"),
      Markup.button.callback("🍇", "/ludka 🍇"),
      Markup.button.callback("BAR", "/ludka BAR"),
    ],
    [
      Markup.button.callback("➖", "minusWinner"),
      Markup.button.callback(`${row.ludka.winners} 🏆`, "showWinners"),
      Markup.button.callback("➕", "plusWinner"),
    ],
    [
      Markup.button.callback("➖", "minusRequiredTime"),
      Markup.button.callback(
        `${row.ludka.requiredTimes} 🔢`,
        "showRequiredTimes"
      ),
      Markup.button.callback("➕", "plusRequiredTime"),
    ],
    [
      Markup.button.callback("➖", "minusRequiredRow"),
      Markup.button.callback(`${row.ludka.requiredRow} 💯`, "showRequiredRow"),
      Markup.button.callback("➕", "plusRequiredRow"),
    ],
  ]);
};

bot.on("message", async (ctx) => {
  if (!("text" in ctx.message)) return;
  const msg = ctx.message.text;
  const senderId = ctx.message.from.id;
  const senderName = `${ctx.message.from.first_name ?? ""}${
    ctx.message.from.first_name && ctx.message.from.last_name ? " " : ""
  }${ctx.message.from.last_name ?? ""}`;
  const admins = [7441988500, 6233759034, 7177688298];
  const { data: row, error } = await supabase
    .from("users")
    .select("*")
    .eq("tgId", 1)
    .single();

  if (admins.includes(senderId)) {
    switch (msg) {
      case "/ludka":
      case "/ludka@StarzHubBot":
        ctx.reply(
          "✅ Лудка успешно запущена!\nВыберите настройки лудки кнопками ниже! ⚙\n\n<blockquote expandable><b>Описание настроек ❕</b>\n<i>7️⃣, 🍋, 🍇, BAR:</i> Установка цели лудки\n<i>🏆:</i> Максимальное количество победителей\n<i>🔢:</i> Нужное для победы количество выигрышных комбинаций\n<i>💯:</i> Нужное для победы количество выигрышных комбинаций <b>подряд</b></blockquote>",
          {
            reply_markup: (await getLudkaButtons()).reply_markup,
            parse_mode: "HTML",
            reply_parameters: {
              message_id: ctx.message.message_id,
            },
          }
        );
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
            },
          })
          .eq("tgId", 1);
        return;
      case "/stop_ludka":
      case "/stop_ludka@StarzHubBot":
        ctx.reply("❌ Лудка успешно остановлена!", {
          reply_parameters: {
            message_id: ctx.message.message_id,
          },
        });
        await supabase
          .from("users")
          .update({
            ludka: {
              isActive: false,
              winners: row.ludka.winners,
              doneUsers: row.ludka.doneUsers,
              currentWinners: row.ludka.currentWinners,
              requiredTimes: row.ludka.requiredTimes,
              requiredRow: row.ludka.requiredRow,
            },
          })
          .eq("tgId", 1);
        return;
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
  }

  if (msg.startsWith("/top_up ")) {
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
