// eslint-disable-next-line import/no-unresolved
const { Telegraf } = require('telegraf');
const webhookUrl = 'https://stars-hub.vercel.app/api/bot';

async function setWebhook() {
  try {
    // Удаляем старый вебхук перед установкой нового
    const bot = new Telegraf("8270325718:AAFfL73Yy6cpOO-WEFwys-qnb7t5kA_qVmE");
    await bot.telegram.deleteWebhook({ drop_pending_updates: true });
    
    // Устанавливаем новый вебхук
    const result = await bot.telegram.setWebhook(webhookUrl, {
      allowed_updates: ["message", "inline_query", "callback_query", "chosen_inline_result"],
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

setWebhook();
