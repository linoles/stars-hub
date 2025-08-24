import { NextRequest, NextResponse } from 'next/server';
import { Telegraf } from 'telegraf';

const botToken = process.env.TELEGRAM_BOT_TOKEN;

if (!botToken) {
  console.error('TELEGRAM_BOT_TOKEN is not defined in environment variables');
}

const bot = new Telegraf(botToken!);

export async function POST(req: NextRequest) {
  try {
    if (!botToken) {
      return NextResponse.json(
        { error: "Bot token is not configured" },
        { status: 500 }
      );
    }

    const { userId, message } = await req.json();

    if (!userId || !message) {
      return NextResponse.json(
        { error: "userId and message are required" },
        { status: 400 }
      );
    }

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
        details: error.response?.description || error.message 
      },
      { status: 500 }
    );
  }
}

export const dynamic = "force-dynamic";