"use client";

import { useEffect, useState } from "react";
import { inter } from "./fonts";
import BottomMenu from "./lib/bottomMenu";

declare global {
  interface Window {
    Telegram: any;
  }
}

export interface User {
  tgId: number;
  tgUsername: string;
  tgNick: string;
  stars: number;
  lvl: number;
  friends: number;
}

export default function ClientComponent({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tgData, setTgData] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [curUser, setCurUser] = useState<User>({ tgId: 0, tgUsername: "", tgNick: "", stars: 0, lvl: 0, friends: 0 });

  useEffect(() => {
    try {
      if (window.Telegram?.WebApp) {
        const tg = window.Telegram.WebApp;
        console.log(tg);
        tg.requestFullscreen();
        tg.SettingsButton.show();
        setTgData(tg.initDataUnsafe?.user);
        document.querySelector(".elemForChange")?.classList.add("mt-[calc(var(--tg-content-safe-area-inset-top)*2)]");
      } else {
        console.log("Telegram WebApp is not loaded yet.");
      }
    } catch (error) {
      console.error(error);
    }
  }, []);

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
      }
    }

    checkAndAddUser();
  }, [tgData]);

  return (
    <div id="root" className="overflow-hidden">
      <div role="region" aria-label="Notifications (F8)" tabIndex={-1} style={{ pointerEvents: "none" }}>
        <ol tabIndex={-1} className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"></ol>
      </div>
      <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section>
      <div className={`min-h-screen bg-casino-black relative overflow-hidden`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-casino-black via-casino-darkGray/20 to-casino-black"></div>
          <div className="absolute top-20 left-10 text-casino-gold/30 animate-pulse" style={{ fontSize: "12px" }}>✦</div>
          <div className="absolute top-40 right-16 text-casino-gold/20 animate-pulse delay-1000" style={{ fontSize: "8px" }}>✦</div>
          <div className="absolute top-60 left-1/4 text-casino-gold/40 animate-pulse delay-500" style={{ fontSize: "10px" }}>✦</div>
          <div className="absolute top-80 right-1/3 text-casino-gold/25 animate-pulse delay-700" style={{ fontSize: "14px" }}>✦</div>
          <div className="absolute bottom-40 left-12 text-casino-gold/35 animate-pulse delay-300" style={{ fontSize: "16px" }}>✦</div>
          <div className="absolute bottom-60 right-8 text-casino-gold/20 animate-pulse delay-1200" style={{ fontSize: "12px" }}>✦</div>
        </div>
        <div className="px-4 pb-20 mt-10 relative z-10 h-max">
          <div className="max-w-md mx-auto">
            <div className="space-y-8 py-8">
              <div className="text-center space-y-6 relative">
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <div className="absolute top-4 left-8 text-casino-gold animate-pulse" style={{ fontSize: "20px" }}>✦</div>
                  <div className="absolute top-12 right-12 text-casino-gold/60 animate-pulse delay-500" style={{ fontSize: "16px" }}>✦</div>
                  <div className="absolute top-20 left-16 text-casino-gold/40 animate-pulse delay-1000" style={{ fontSize: "12px" }}>✦</div>
                  <div className="absolute top-6 right-6 text-casino-gold/80 animate-pulse delay-300" style={{ fontSize: "14px" }}>✦</div>
                  <div className="absolute top-16 left-1/3 text-casino-gold/50 animate-pulse delay-700" style={{ fontSize: "18px" }}>✦</div>
                </div>
                <div className="relative z-10">
                  <div className="w-24 h-24 mx-auto mb-6 relative">
                    <div className="w-full h-full bg-gradient-to-br from-casino-gold to-orange-500 rounded-full flex items-center justify-center relative overflow-hidden">
                      <video autoPlay loop muted playsInline onClick={e => e.stopPropagation()} className="w-60 h-60">
                        <source src="/frog.gif.mp4" type="video/mp4" />
                      </video>
                      <div className="absolute inset-0 bg-gradient-to-br from-transparent via-casino-gold/20 to-transparent animate-pulse"></div>
                    </div>
                    <div className="absolute -inset-2 border-2 border-casino-gold/30 rounded-full"></div>
                  </div>
                  <h1 className={"text-5xl font-bold bg-gradient-to-r from-casino-gold via-orange-400 to-casino-gold bg-clip-text text-transparent tracking-wide " + inter.className}>STARSHUB</h1>
                  <div className="flex items-center justify-center space-x-2 mt-3">
                    <div className="text-casino-gold animate-pulse" style={{ fontSize: "12px" }}>✦</div>
                    <p className={"text-casino-lightGray text-lg font-light " + inter.className}>Azart Gaming Experience</p>
                    <div className="text-casino-gold animate-pulse delay-500" style={{ fontSize: "12px" }}>✦</div>
                  </div>
                </div>
              </div>
              <div className="flex justify-center py-6">
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
          </div>
        </div>
        <BottomMenu activeItem={0} />
      </div>
    </div>
  );
}
