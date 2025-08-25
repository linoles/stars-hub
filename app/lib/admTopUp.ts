import sendMessage from "./sendMessage";

export default async function admTopUp({
  sender,
  receiver,
  amount,
}: {
  sender: any;
  receiver: any;
  amount: any;
}) {
  try {
    receiver.stars += amount;

    const updatedUser = {
      ...receiver,
      tgId: receiver.tgId,
      stars: receiver.stars,
    };
    const response = await fetch("/api/save-user", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(updatedUser),
    });

    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.error || "Ошибка сервера");
    }

    const updateReceiver = await response.json();

    if (updateReceiver.error) throw updateReceiver.error;

    sendMessage(
      sender.tgId,
      `✅ Начисление ${amount}⭐ пользователю @${receiver.tgUsername} успешно выполнен!`
    );

    try {
      sendMessage(
        receiver.tgId,
        `🎉 Вы получили начисление в размере ${amount}⭐ от <a href="tg://openmessage?user_id=${
          sender.tgId
        }">${sender.tgNick}</a> (#id${
          sender.tgId
        })!\nТеперь ваш баланс составляет: ${Number(receiver.stars) + Number(amount)}⭐`
      );
    } catch (error) {
      console.log("Не удалось отправить сообщение получателю:", error);
    }

    sendMessage(
      -1002959501386,
      `🧙‍♂️ Совершено начисление звёзд (${amount}⭐) с <a href="tg://openmessage?user_id=${
        sender.tgId
      }">${sender.tgNick}</a> (#id${
        sender.tgId
      }) на <a href="tg://openmessage?user_id=${receiver.tgId}">${
        receiver.tgNick
      }</a> (#id${receiver.tgId})\nНовый баланс получателя: ${
        Number(receiver.stars) + Number(amount)
      }⭐ #начисление\n\n[${(new Date()).toLocaleString("ru-RU")}]`
    );
  } catch (error) {
    console.error("Ошибка при переводе:", error);
    sendMessage(sender.tgId, "❌ Произошла ошибка при выполнении начисления.");
  }
}
