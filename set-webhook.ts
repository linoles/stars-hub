const { Telegraf } = require('telegraf');

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");
const webhookUrl = 'https://your-vercel-app.vercel.app/api/bot';

async function setWebhook() {
  try {
    await bot.telegram.setWebhook(webhookUrl);
    console.log('Webhook set successfully');
  } catch (error) {
    console.error('Error setting webhook:', error);
  }
}