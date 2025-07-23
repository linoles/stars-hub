const { Telegraf } = require("telegraf");

const bot = new Telegraf("7665933078:AAEk1IIIAafXQGki6i9tejLv4BBQ8MqWLuc");

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
process.once("SIGTERM", () => bot.stop("SIGTERM"));