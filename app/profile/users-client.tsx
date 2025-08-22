"use client";

import { useEffect, useState } from "react";
import { inter } from "../fonts";
import BottomMenu from "../lib/bottomMenu";
import { User } from "../users-client";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function ClientComponent({ initialUsers }: { initialUsers: User[] }) {
  const [users, setUsers] = useState<User[]>(initialUsers);
  const [tgData, setTgData] = useState<any>(null);
  const [isAdding, setIsAdding] = useState(false);
  const [curUser, setCurUser] = useState<User>({ tgId: 7441988500, tgUsername: "Test", tgNick: "Test", stars: 0, lvl: 1, friends: 0 });

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
          <div className="relative z-10 text-center space-y-6 border-2 rounded-full border-b-red-400">
            <svg version="1.0" xmlns="http://www.w3.org/2000/svg"
              width="200" height="200" viewBox="0 0 512.000000 512.000000"
              preserveAspectRatio="xMidYMid meet">

              <g transform="translate(0.000000,512.000000) scale(0.100000,-0.100000)"
                fill="#2B2B2B" stroke="none">
                <path
                  d="M2390 4253 c-269 -43 -478 -150 -671 -342 -185 -186 -286 -378 -335 -636 -22 -120 -15 -371 15 -495 56 -241 154 -447 306 -646 85 -111 95 -177 40 -261 -8 -12 -80 -55 -163 -97 -286 -145 -506 -316 -700 -541 -101 -117 -122 -154 -122 -210 0 -131 147 -213 258 -144 13 8 59 58 104 112 169 204 366 356 643 495 158 79 211 120 267 206 98 153 109 357 26 521 -12 22 -53 83 -92 135 -169 225 -259 477 -258 725 0 151 23 242 93 384 116 231 344 402 599 451 93 18 258 14 354 -9 326 -78 574 -337 642 -671 13 -65 15 -112 11 -205 -9 -174 -47 -309 -138 -486 -66 -128 -146 -236 -245 -328 -136 -127 -270 -190 -442 -209 -74 -8 -98 -14 -125 -35 -67 -51 -86 -145 -45 -219 46 -81 119 -100 280 -73 104 17 178 41 282 90 32 15 59 25 60 24 2 -2 16 -29 31 -58 15 -30 52 -81 82 -112 46 -48 79 -70 199 -130 253 -126 420 -248 589 -434 175 -192 176 -192 226 -200 128 -19 235 110 189 230 -29 77 -272 331 -436 456 -131 100 -209 149 -384 239 -135 70 -147 78 -168 120 -31 60 -25 128 17 185 203 273 311 506 356 769 32 188 14 420 -45 598 -136 407 -499 720 -918 793 -78 14 -317 19 -382 8z" />
              </g>
            </svg>
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
          <div className="w-screen flex flex-row justify-around items-center">
            <div className={"text-2xl font-bold text-casino-gold " + inter.className}>{curUser.tgNick.toUpperCase()}</div>
            <div className={"text-2xl font-bold text-casino-gold/20 " + inter.className}>{curUser.tgUsername.toUpperCase()}</div>
            <div className={"text-2xl font-bold text-casino-gold/20 " + inter.className}>{curUser.tgId}</div>
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