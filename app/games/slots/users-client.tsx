"use client";

import { useEffect, useState } from "react";
import { User } from "../../users-client";
import "@/app/games/games.css";
import GameMenu from "../../lib/gameMenu";
import { inter } from "@/app/fonts";
import { useConfetti } from "@/app/lib/useConfetti";
import Confetti from "@/app/lib/confetti";
import { useToast } from "@/app/lib/useToast";
import ToastNotification from "@/app/lib/toast";
import { createClient } from "@supabase/supabase-js";

const SLOT_ICONS = ['/BAR.png', '/🍇.png', '/🍋.png', '/7_1.png'];

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
);
declare global {
  interface Window {
    Telegram: any;
  }
}

const sendMessage = async (userId: number, text: string) => {
  try {
    const response = await fetch('/api/send-message', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        userId: userId,
        message: text
      }),
    });

    const result = await response.json();

    if (response.ok) {
      console.log('Message sent successfully');
    } else {
      console.error('Failed to send message:', result.error);
    }
  } catch (error) {
    console.error('Error:', error);
  }
};

export default function ClientComponent({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tgData, setTgData] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [curUser, setCurUser] = useState<User>({ tgId: 0, tgUsername: "", tgNick: "", stars: 100, bet: 10, lvl: 1, friends: 0 });
  const [slots, setSlots] = useState(['/7_1.png', '/7_1.png', '/7_1.png']);
  const [isSpinning, setIsSpinning] = useState(false);
  const [retBetEl, setRetBetEl] = useState(-1);
  const { isConfettiActive, triggerConfetti } = useConfetti();
  const { toast, showToast, hideToast } = useToast();

  const spinSlots = async () => {
    if (isSpinning) return;
    if (curUser.stars < curUser.bet) {
      alert("❌ Недостаточно звезд! ⭐");
      return;
    }

    setIsSpinning(true);

    const spinDuration = 3000;
    const spinInterval = 200;
    const startTime = Date.now();

    const getRandomIcon = () => {
      return SLOT_ICONS[Math.floor(Math.random() * SLOT_ICONS.length)];
    };

    const spinAnimation = setInterval(() => {
      setSlots([getRandomIcon(), getRandomIcon(), getRandomIcon()]);
    }, spinInterval);

    setTimeout(() => {
      clearInterval(spinAnimation);

      const finalSlots = [
        getRandomIcon(),
        getRandomIcon(),
        getRandomIcon()
      ];

      setSlots(finalSlots);
      setIsSpinning(false);
      curUser.stars -= curUser.bet;

      checkWin(finalSlots);
    }, spinDuration);
  };

  const checkWin = async (finalSlots: string[]) => {
    let retBet = 0;
    let multiplier = 0;

    if (finalSlots[0] === finalSlots[1] && finalSlots[1] === finalSlots[2]) {
      switch (finalSlots[0]) {
        case "/7_1.png":
          retBet = curUser.bet * 4;
          multiplier = 4;
          triggerConfetti();
          showToast({
            message: `Вы выбили тройную комбинацию и получаете ${retBet - curUser.bet}⭐ (X${multiplier})!`,
            type: 'success',
            duration: 2500
          });
          break;
        case "/🍋.png":
          retBet = curUser.bet * 3;
          multiplier = 3;
          triggerConfetti();
          showToast({
            message: `Вы выбили тройную комбинацию и получаете ${retBet - curUser.bet}⭐ (X${multiplier})!`,
            type: 'success',
            duration: 2500
          });
          break;
        case "/🍇.png":
          retBet = curUser.bet * 2.5;
          multiplier = 2.5;
          triggerConfetti();
          showToast({
            message: `Вы выбили тройную комбинацию и получаете ${retBet - curUser.bet}⭐ (X${multiplier})!`,
            type: 'success',
            duration: 2500
          });
          break;
        case "/BAR.png":
          retBet = curUser.bet * 2;
          multiplier = 2;
          triggerConfetti();
          showToast({
            message: `Вы выбили тройную комбинацию и получаете ${retBet - curUser.bet}⭐ (X${multiplier})!`,
            type: 'success',
            duration: 2500
          });
          break;
      }
    } else {
      const checkTwoOfKind = (icon: string, mult: number) => {
        if (
          (finalSlots[0] === finalSlots[1] && finalSlots[0] === icon) ||
          (finalSlots[1] === finalSlots[2] && finalSlots[1] === icon) ||
          (finalSlots[0] === finalSlots[2] && finalSlots[0] === icon)
        ) {
          retBet = curUser.bet * mult;
          multiplier = mult;
          if (mult < 1) {
            showToast({
              message: `Вы выбили проигрышную комбинацию и вам возвращается ${retBet - curUser.bet}⭐ (X${mult})!`,
              type: 'error',
              duration: 2500
            });
          } else if (mult === 1) {
            showToast({
              message: `Вы оставляете вашу ставку у себя - X1!`,
              type: 'info',
              duration: 2500
            });
          } else {
            showToast({
              message: `Вы выбили выигрышную комбинацию и получаете ${retBet - curUser.bet}⭐ (X${mult})!`,
              type: 'success',
              duration: 2500
            });
          }
          return true;
        }
        return false;
      };

      if (!checkTwoOfKind("/7_1.png", 1.2)) {
        if (!checkTwoOfKind("/🍋.png", 1)) {
          if (!checkTwoOfKind("/🍇.png", 0.8)) {
            checkTwoOfKind("/BAR.png", 0.6);
          }
        }
      }
    }

    setRetBetEl(multiplier);

    setCurUser(prevUser => {
      const newCurUser = {
        ...prevUser,
        stars: prevUser.stars + retBet
      };
      setUsers(prevUsers => {
        return prevUsers.map(user => {
          if (user.tgId === newCurUser.tgId) {
            return newCurUser;
          }
          return user;
        });
      });
      return newCurUser;
    });
    const response = await fetch('/api/save-user', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(curUser),
    })

    if (!response.ok) {
      const errorData = await response.json()
      throw new Error(errorData.error || "Ошибка сервера")
    }
    const result = await response.json()

    sendMessage(
      -1002959501386,
      `Игрок <a href="tg://openmessage?user_id=${curUser.tgId}">${curUser.tgNick}</a> (#id${curUser.tgId}) получил Х${multiplier} в слотах и вернул ${retBet}⭐ со ставки ${curUser.bet}⭐! #слоты`
    );
    if (multiplier === 0) {
      showToast({
        message: `Вы выбили проигрышную комбинацию - X0!`,
        type: 'error2',
        duration: 2500
      });
    }
  };

  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log(tg);
        tg.requestFullscreen();
        tg.SettingsButton.show();
        setTgData(tg.initDataUnsafe?.user);
      } else {
        console.log("Telegram WebApp is not loaded yet.");
      }
    } catch (error) {
      console.error(error);
    }
  }, [window.Telegram?.WebApp]);

  useEffect(() => {
    if (!tgData?.id || isAdding) return;

    const checkAndAddUser = async () => {
      const exists = users.some(u => u.tgId === tgData.id);
      if (!exists) {
        setIsAdding(true);
        try {
          const response = await fetch('/api/add-user', {
            method: 'POST',
            headers: {
              'Content-Type': 'application/json',
            },
            body: JSON.stringify({
              tgId: tgData.id,
              tgNick: `${tgData.first_name || ""}${tgData.first_name && tgData.last_name ? " " : ""}${tgData.last_name || ""}` || "user",
              tgUsername: tgData.username || null,
              stars: 0,
              lvl: 1,
              friends: 0,
            })
          });

          if (!response.ok) {
            throw new Error('Failed to add user');
          }

          const newUser = await response.json();
          setUsers(prev => [...prev, newUser]);
          setCurUser(newUser);
        } catch (error) {
          console.error('Error adding user:', error);
        } finally {
          setIsAdding(false);
        }
      } else {
        setCurUser(users.find(u => u.tgId === tgData.id) || { tgId: 0, tgUsername: "", tgNick: "", stars: 0, bet: 10, lvl: 1, friends: 0 });
      }
    }

    checkAndAddUser();
  }, [tgData]);

  return (
    <div id="root">
      <div role="region" aria-label="Notifications (F8)" tabIndex={-1} style={{ pointerEvents: "none" }}>
        <ol tabIndex={-1} className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"></ol>
      </div>
      <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section>
      <Confetti isActive={isConfettiActive} />
      <div className="min-h-screen bg-background star-pattern relative overflow-auto">
        <div className="px-4 pb-20 relative z-10 h-screen flex flex-col items-center justify-center">
          <div className="slots flex flex-row justify-center items-center mt-auto">
            {slots.map((slot, index) => (
              <div key={index} className={`slot-container relative w-[6.25rem] h-[6.25rem] md:w-32 md:h-32 bg-stone-800/75 rounded-xl overflow-hidden mr-${index == 2 ? 0 : 2}`}>
                <div className={`absolute inset-0 ${isSpinning ? 'animate-slot-spin' : ''}`}>
                  <img src={slot} alt="slot" className="w-full h-full object-cover" />
                </div>
              </div>
            ))}
          </div>
          <div className="w-full h-fit flex flex-col justify-center items-center">
            <button
              className="w-full mt-4 h-[60px] flex flex-row justify-center items-center"
              onClick={spinSlots}
              disabled={isSpinning}
            >
              <p className={
                "text-4xl font-bold w-[320px] py-3 px-6 duration-500 rounded-3xl bg-stone-800/75 text-white " +
                inter.className +
                (isSpinning ? " opacity-50 cursor-not-allowed" : " hover:bg-stone-800/35")
              }>
                {isSpinning ? 'КРУТИМ...' : `ИГРАТЬ`}
              </p>
            </button>
          </div>
          <div className="mt-auto w-full flex flex-row justify-around items-center">
            <div className="flex flex-row items-center justify-center h-fit w-fit">
              <p className={"text-[1.45rem] font-bold text-casino-gold/50 overflow-hidden text-ellipsis whitespace-nowrap mr-2 " + inter.className}>ЗВЁЗДЫ</p>
              <p className={"text-[1.45rem] font-bold text-casino-gold/80 overflow-hidden text-ellipsis whitespace-nowrap " + inter.className}>{`${curUser.stars}`}</p>
            </div>
            <div className="flex flex-row items-center justify-center h-fit w-fit">
              <p className={"text-[1.45rem] font-bold text-casino-gold/80 overflow-hidden text-ellipsis whitespace-nowrap mr-2 " + inter.className}>{`${curUser.bet}`}</p>
              <p className={"text-[1.45rem] font-bold text-casino-gold/50 overflow-hidden text-ellipsis whitespace-nowrap " + inter.className}>СТАВКА</p>
            </div>
          </div>
        </div>
        <GameMenu activeItem={2} />

        <ToastNotification
          message={toast.message}
          type={toast.type}
          duration={toast.duration}
          isVisible={toast.isVisible}
          onClose={hideToast}
        />
        <div className="absolute inset-0 pointer-events-none overflow-hidden">
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "38.7565%", top: "56.0304%", animationDelay: "1.32899s", fontSize: " 9.80749px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "47.5803%", top: "18.9982%", animationDelay: "1.25741s", fontSize: "9.70331px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "53.0188%", top: "89.78%", animationDelay: "0.586266s", fontSize: "12.2947px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "79.7041%", top: "13.3367%", animationDelay: "1.74073s", fontSize: "13.2311px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "23.518%", top: "84.2616%", animationDelay: "2.12519s", fontSize: "11.8656px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "15.2164%", top: "66.9954%", animationDelay: "1.52031s", fontSize: "15.5654px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "12.9064%", top: "16.3438%", animationDelay: "0.159508s", fontSize: "15.6116px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "46.8969%", top: "14.6909%", animationDelay: "0.479396s", fontSize: "8.22172px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "16.0076%", top: "0.78161%", animationDelay: "0.398253s", fontSize: "14.6898px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "95.5268%", top: "87.3953%", animationDelay: "1.28216s", fontSize: "15.6566px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "42.2717%", top: "49.0051%", animationDelay: "1.05661s", fontSize: "9.62768px" }}>✦</div>
          <div className="absolute text-primary/30 animate-pulse" style={{ left: "92.6545%", top: "49.7537%", animationDelay: "2.027s", fontSize: "9.19608px" }}>✦</div>
        </div>
      </div>
    </div>
  )
}