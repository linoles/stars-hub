import { inter } from "../fonts";
import admTopUp from "./admTopUp";

const procAdmTopUp = async (curUser: any) => {
  const form = document.getElementById("admTopUpForm") as HTMLFormElement;

  if (form) {
    const usernameInput = form.querySelector<HTMLInputElement>('[name="username"]');
    const username = usernameInput?.value;
    const amountInput = form.querySelector<HTMLInputElement>('[name="amount"]');
    const amount = amountInput?.value;

    if (!username || !amount) {
      alert("❌ Введите данные!");
      return;
    }

    if (isNaN(+amount) || !Number.isInteger(+amount)) {
      alert("❌ Введите число!");
      return;
    }

    
    const receiverResponse = await fetch("/api/get-user-by-tag", {
      method: "POST",
      body: JSON.stringify({ tgTag: username.toLowerCase() }),
    });

    if (!receiverResponse.ok) {
      const errorData = await receiverResponse.json();
      alert(errorData.error || "Ошибка сервера");
      throw new Error(errorData.error || "Ошибка сервера");
    }

    const receiver = await receiverResponse.json();
   
    if (!receiver) {
      alert("❌ Пользователь не найден!");
      return;
    }
    
    alert("✅ Начисление успешно выполнено!");

    usernameInput.value = "";
    amountInput.value = "";

    admTopUp({ sender: curUser, receiver: (await receiver), amount: amount });
  } else {
    alert("❌ Произошла ошибка!");
  }
  return;
}

export default function AdmInterface({ curMode, curUser }: { curMode: string, curUser: any }) {
  switch (curMode) {
    case "":
      return null;
    case "top_up":
      return (
        <div className="flex flex-col justify-center items-center mt-4">
          <p className={"text-white font-extrabold text-2xl w-full h-fit text-center " + inter.className}>НАЧИСЛЕНИЕ ИГРОКУ</p>
          <form action="none" id="admTopUpForm" onSubmit={(e) => e.preventDefault()}>
            <div className="w-[calc(100%-20px)] h-fit flex flex-row items-center justify-start mt-2 border-b ml-[10px] mr-[10px] border-b-gray-800">
              <p className={"text-casino-gold/40 font-extrabold text-lg w-full h-fit text-start " + inter.className}>✍ @USERNAME</p>
              <input name="username" type="text" className={"bg-transparent text-gray-700 border-0 outline-0 font-semibold text-sm w-full h-fit text-start " + inter.className} placeholder="Получатель @user 👤" />
            </div>
            <div className="w-[calc(100%-20px)] h-fit flex flex-row items-center justify-start mt-2 border-b ml-[10px] mr-[10px] border-b-gray-800">
              <p className={"text-casino-gold/40 font-extrabold text-lg w-6/12 h-fit text-start " + inter.className}>✍ СУММА</p>
              <input name="amount" type="number" className={"bg-transparent text-gray-700 border-0 outline-0 font-semibold text-sm w-full h-fit text-start " + inter.className} placeholder="Число SCoins 🪙" />
            </div>
          </form>
          <div className="w-[calc(100%-20px)] h-fit flex flex-row items-center justify-start mt-2 ml-[10px] mr-[10px]" onClick={() => procAdmTopUp(curUser)}>
            <div className={"font-extrabold text-3xl text-white w-full h-fit text-center bg-casino-gold/80 hover:bg-casino-gold/40 cursor-pointer py-4 rounded-4xl " + inter.className}>НАЧИСЛИТЬ</div>
          </div>
        </div>
      );
    default:
      return null;
  }
}