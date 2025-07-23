import { Telegraf } from 'telegraf';

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");
const webhookUrl = 'https://stars-hub.vercel.app/api/bot';

async function setWebhook() {
  try {
    // Удаляем старый вебхук перед установкой нового
    await bot.telegram.deleteWebhook({ drop_pending_updates: true });
    
    // Устанавливаем новый вебхук
    const result = await bot.telegram.setWebhook(webhookUrl, {
      allowed_updates: ['message', 'callback_query'],
      drop_pending_updates: true
    });
    
    console.log('Webhook успешно установлен:', result);
    console.log('URL:', webhookUrl);
    
    // Проверяем статус
    const info = await bot.telegram.getWebhookInfo();
    console.log('Webhook info:', info);
    
  } catch (error) {
    console.error('Ошибка установки вебхука:', error);
  } finally {
    process.exit();
  }
}

// setWebhook();