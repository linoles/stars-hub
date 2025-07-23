import { NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");

bot.on('message', (ctx) => {
  ctx.sendInvoice({
    title: "Test",
    description: "Test",
    start_parameter: "test",
    currency: "XTR",
    prices: [{ label: "Test", amount: 1 }],
    payload: JSON.stringify({ data: "Test" }),
    provider_token: "test",
  });
});

export async function POST(request: Request) {
  try {
    const body = await request.json();
    await bot.handleUpdate(body);
    return NextResponse.json({ status: 'ok' });
  } catch (err) {
    console.error(err);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}

export const dynamic = 'force-dynamic'; // Это важно для вебхуков