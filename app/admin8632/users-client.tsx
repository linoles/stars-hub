"use client";

import { useEffect, useState } from "react";
import { inter } from "./../fonts";
import BottomMenu from "../lib/bottomMenu";
import Stars from "../lib/stars";
import { config } from "../config";
import AdmInterface from "../lib/admInterface";

declare global {
  interface Window {
    Telegram: any;
  }
}

export interface User {
  tgId: number;
  tgUsername: string | null;
  tgNick: string;
  stars: number;
  bet: number;
  lvl: number;
  friends: number;
}


export default function ClientComponent({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tgData, setTgData] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [curUser, setCurUser] = useState<User>({ tgId: 0, tgUsername: "", tgNick: "", stars: 0, bet: 10, lvl: 1, friends: 0 });
  const [curMode, setCurMode] = useState<string>("");

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
      } else {
        setCurUser(users.find(u => u.tgId === tgData.id) || { tgId: 0, tgUsername: "", tgNick: "", stars: 0, bet: 10, lvl: 1, friends: 0 });
      }
    }

    checkAndAddUser();
  }, [tgData]);

  setTimeout(() => {
    if (!config.botAdmins.includes(curUser.tgId)) {
      window.location.href = "/";
      return null;
    }
  }, 1000);

  return (
    <div id="root">
      <div role="region" aria-label="Notifications (F8)" tabIndex={-1} style={{ pointerEvents: "none" }}>
        <ol tabIndex={-1} className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"></ol>
      </div>
      <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section>
      <div className="min-h-screen bg-background star-pattern relative overflow-auto">
        <div className="flex flex-col items-center justify-center w-[calc(100vw-16px)] mx-2 mt-3">
          <div className="flex flex-row items-center justify-center w-full h-[60px]">
            <button className={"text-white font-bold text-2xl bg-casino-darkGray/95 rounded-3xl w-1/2 h-full flex flex-row justify-center items-center mr-2 " + inter.className} onClick={() => setCurMode("game")}>
              <img src="/game.png" alt="g" className="w-8 h-8 mr-2" />
              ИГРА
            </button>
            <button className={"text-white font-bold text-xl bg-casino-darkGray/95 rounded-3xl w-1/2 h-full flex flex-row justify-center items-center " + inter.className} onClick={() => setCurMode("lotery")}>
              <img src="/lotery.png" alt="l" className="w-8 h-8 mr-2" />
              ЛОТЕРЕЯ
            </button>
          </div>
          <div className="flex flex-row items-center justify-center w-full h-[60px] mx-2 mt-3">
            <button className={"text-white font-bold text-md bg-casino-darkGray/95 rounded-3xl w-1/2 h-full flex flex-row justify-center items-center mr-2 " + inter.className} onClick={() => setCurMode("top_up")}>
              <img src="/adm_top_up.png" alt="t" className="w-8 h-8 mr-2" />
              НАКРУТИТЬ
            </button>
            <button className={"text-white font-bold text-xl bg-casino-darkGray/95 rounded-3xl w-1/2 h-full flex flex-row justify-center items-center " + inter.className} onClick={() => setCurMode("bottom_up")}>
              <img src="/adm_bottom_up.png" alt="t" className="w-8 h-8 mr-2" />
              СПИСАТЬ
            </button>
          </div>
        </div>
        <AdmInterface curMode={curMode} curUser={curUser} />
        <BottomMenu activeItem={-1} />
        <Stars />
      </div>
    </div>
  );
}
