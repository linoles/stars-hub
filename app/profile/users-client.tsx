"use client";

import { useEffect, useState } from "react";
import { inter } from "../fonts";
import BottomMenu from "../lib/bottomMenu";
import { User } from "../users-client";
import UserAvatar from "../lib/userAvatar";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function ClientComponent({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tgData, setTgData] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [curUser, setCurUser] = useState<User>({ tgId: 0, tgUsername: null, tgNick: "Player", stars: 0, lvl: 1, friends: 0 });

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
        setCurUser(users.find(u => u.tgId === tgData.id) || { tgId: 0, tgUsername: "", tgNick: "", stars: 0, lvl: 1, friends: 0 });
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
      <div className="min-h-screen bg-background star-pattern relative overflow-auto"> {/* Добавлен класс star-pattern */}
        <div className="px-4 pb-20 relative z-10 h-screen flex flex-col items-center justify-center">
          <div className="w-[287px] flex flex-col justify-around items-center mb-2">
            <div className={"text-3xl font-bold text-casino-gold/80 overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px] " + inter.className}>{curUser.tgNick}</div>
            <div className={"text-3xl font-bold text-casino-gold/50 overflow-hidden text-ellipsis whitespace-nowrap max-w-[300px] " + inter.className}>{curUser.tgUsername !== null && curUser.tgUsername !== "" ? `@${curUser.tgUsername}` : `id${curUser.tgId}`}</div>
          </div>
          <div className="relative z-10 text-center space-y-6 border-2 rounded-full border-b-red-400">
            <UserAvatar userId={curUser.tgId} size={200} className="border-2 border-white" />
          </div>
          <div className="flex justify-center pt-6 pb-3">
            <div className="text-center pr-8 border-r border-casino-gold/20">
              <div className={"text-2xl font-bold text-casino-gold " + inter.className}>{curUser.lvl}</div>
              <div className={"text-casino-lightGray text-sm " + inter.className}>Уровень</div>
            </div>
            <div className="text-center mx-8">
              <div className={"text-2xl font-bold text-casino-gold " + inter.className}>{curUser.stars}</div>
              <div className={"text-casino-lightGray text-sm " + inter.className}>Звёзды</div>
            </div>
            <div className="text-center pl-8 border-l border-casino-gold/20">
              <div className={"text-2xl font-bold text-casino-gold " + inter.className}>{curUser.friends}</div>
              <div className={"text-casino-lightGray text-sm " + inter.className}>Друзья</div>
            </div>
          </div>
        </div>
        <BottomMenu activeItem={3} />
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
  );
}