/*const { Telegraf } = require("telegraf");

const bot = new Telegraf("8270325718:AAFfL73Yy6cpOO-WEFwys-qnb7t5kA_qVmE");

bot.on("message", (ctx) => {
  ctx.sendInvoice({
    title: "Test",
    description: "Test",
    start_parameter: "test",
    currency: "XTR",
    prices: [{ label: "Test", amount: 1 }],
    payload: JSON.stringify({ data: "Test" }),
  })
});

bot.launch();

process.once("SIGINT", () => bot.stop("SIGINT"));
process.once("SIGTERM", () => bot.stop("SIGTERM"));*/