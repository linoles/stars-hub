import sendMessage from "./sendMessage";

export default async function admBottomUp({
  sender,
  receiver,
  amount,
}: {
  sender: any;
  receiver: any;
  amount: any;
}) {
  try {
    receiver.stars -= Number(amount);

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
      `✅ Списание ${amount}⭐ у пользователя @${receiver.tgUsername} успешно выполнено!`
    );

    try {
      sendMessage(
        receiver.tgId,
        `😭 Вы получили списание в размере ${amount}⭐ от <a href="tg://openmessage?user_id=${
          sender.tgId
        }">${sender.tgNick}</a> (#id${
          sender.tgId
        })!\nТеперь ваш баланс составляет: ${receiver.stars}⭐`
      );
    } catch (error) {
      console.log("Не удалось отправить сообщение получателю:", error);
    }

    sendMessage(
      -1002959501386,
      `🧙‍♂️ Совершено списание звёзд (${amount}⭐) с <a href="tg://openmessage?user_id=${
        sender.tgId
      }">${sender.tgNick}</a> (#id${
        sender.tgId
      }) у <a href="tg://openmessage?user_id=${receiver.tgId}">${
        receiver.tgNick
      }</a> (#id${receiver.tgId})\nНовый баланс пострадавшего: ${
        receiver.stars
      }⭐ #списание\n\n[${(new Date()).toLocaleString("ru-RU")}]`
    );
  } catch (error) {
    console.error("Ошибка при переводе:", error);
    sendMessage(sender.tgId, "❌ Произошла ошибка при выполнении списания.");
  }
}
