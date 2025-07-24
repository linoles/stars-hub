import { config } from "@/app/config";
import { NextResponse } from "next/server";
import { Telegraf } from "telegraf";

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");

bot.on("message", (ctx) => {
  if (!("text" in ctx.message)) return;
  const msg = ctx.message.text;
  const senderId = ctx.message.from.id;
  const senderName = `${ctx.message.from.first_name ?? ""}${
    ctx.message.from.first_name && ctx.message.from.last_name ? " " : ""
  }${ctx.message.from.last_name ?? ""}`;
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
        provider_token: "7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc",
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
