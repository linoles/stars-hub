import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

// Инициализация бота
const botToken = process.env.BOT_TOKEN || "";
const bot = new Telegraf(botToken);

export async function POST(req: NextRequest) {
  try {
    const { userId, message } = await req.json();

    // Валидация входных данных
    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 }
      );
    }

    // Отправка сообщения через Telegram API
    await bot.telegram.sendMessage(userId, message);

    return NextResponse.json({ 
      success: true, 
      message: "Message sent successfully" 
    });

  } catch (error: any) {
    console.error("Error sending message:", error);
    
    return NextResponse.json(
      { 
        error: "Failed to send message",
        details: error.message 
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";