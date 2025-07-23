import { config } from '@/app/config';
import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");

bot.on('message', (ctx) => {
  /*ctx.sendInvoice({
    title: "Пополнение баланса 🌟",
    description: "Пополнение баланса в боте звёздами ⭐",
    start_parameter: "top_up",
    currency: "XTR",
    prices: [{ label: "Пополнение", amount: 10 }],
    payload: JSON.stringify({ data: "top_up" }),
    provider_token: "7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc",
  });*/
  if (!("text" in ctx.message)) return;
  const msg = ctx.message.text;
  const senderId = ctx.message.from.id;
  const senderName = `${ctx.message.from.first_name}${ctx.message.from.first_name ? " " : ""}${ctx.message.from.last_name}`;
  switch (msg) {
    case "/start":
      ctx.reply(`⭐ Добро пожаловать в игрового бота <b>StarsHub</b>!\n<a href='tg://openmessage?user_id=${senderId}'>${senderName}</a>, для начала игры, нажмите на кнопку ниже 👇`, {
        reply_markup: {
          inline_keyboard: [
            [{ text: "🎉 Начать игру", url: config.webAppUrl }],
          ],
        },
        parse_mode: "HTML",
      });
  }
});

export async function POST(req: Request) {
  try {
    console.log('Received update at:', new Date().toISOString());
    const body = await req.json();
    console.log('Update body:', JSON.stringify(body, null, 2));
    
    await bot.handleUpdate(body);
    return NextResponse.json({ ok: true });
    
  } catch (error) {
    console.error("Error handling update:", error);
    return NextResponse.json(
      { error: "Internal Server Error" },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Это важно для вебхуков