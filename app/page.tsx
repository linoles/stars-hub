"use client";

import { useEffect } from "react";
import { Telegraf } from 'telegraf';

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");
const webhookUrl = 'https://stars-hub.vercel.app/api/bot';

bot.telegram.setWebhook(webhookUrl).then(() => {
  console.log('Webhook set successfully');
  process.exit();
});

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function Page() {
  useEffect(() => {
    const tg = window.Telegram
    console.info(tg);
  }, []);

  return (
    <div>StarsHub</div>
  );
}
