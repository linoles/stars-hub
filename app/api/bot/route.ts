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

export default async function handler(req: any, res: any) {
  if (req.method === 'POST') {
    try {
      await bot.handleUpdate(req.body, res);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: 'Internal server error' });
    }
  } else {
    res.status(405).json({ error: 'Method not allowed' });
  }
}

export const config = {
  api: {
    bodyParser: false,
  },
};