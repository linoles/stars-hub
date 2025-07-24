"use client";

import { useEffect, useState } from "react";
import { inter } from "./fonts";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function Page() {

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      console.log(tg);
      tg.requestFullscreen();
      document.querySelector(".elemForChange")?.classList.add("pt-[var(--tg-content-safe-area-inset-top)]");
    } else {
      console.log("Telegram WebApp is not loaded yet.");
    }
  }, [window.Telegram?.WebApp]);

  return (
    <div id="root">
      <div role="region" aria-label="Notifications (F8)" tabIndex={-1} style={{ pointerEvents: "none" }}>
        <ol tabIndex={-1} className="fixed top-0 z-[100] flex max-h-screen w-full flex-col-reverse p-4 sm:bottom-0 sm:right-0 sm:top-auto sm:flex-col md:max-w-[420px]"></ol>
      </div>
      <section aria-label="Notifications alt+T" tabIndex={-1} aria-live="polite" aria-relevant="additions text" aria-atomic="false"></section>
      <div className={`min-h-screen bg-casino-black relative overflow-hidden elemForChange`}>
        <div className="absolute inset-0 pointer-events-none">
          <div className="absolute inset-0 bg-gradient-to-br from-casino-black via-casino-darkGray/20 to-casino-black"></div>
          <div className="absolute top-20 left-10 text-casino-gold/30 animate-pulse" style={{ fontSize: "12px" }}>✦</div>
          <div className="absolute top-40 right-16 text-casino-gold/20 animate-pulse delay-1000" style={{ fontSize: "8px" }}>✦</div>
          <div className="absolute top-60 left-1/4 text-casino-gold/40 animate-pulse delay-500" style={{ fontSize: "10px" }}>✦</div>
          <div className="absolute top-80 right-1/3 text-casino-gold/25 animate-pulse delay-700" style={{ fontSize: "14px" }}>✦</div>
          <div className="absolute bottom-40 left-12 text-casino-gold/35 animate-pulse delay-300" style={{ fontSize: "16px" }}>✦</div>
          <div className="absolute bottom-60 right-8 text-casino-gold/20 animate-pulse delay-1200" style={{ fontSize: "12px" }}>✦</div>
        </div>
        <div className={`flex items-center justify-between p-4 relative z-10`}>
          <div className="flex items-center space-x-2">
            <div className="text-casino-gold animate-spin-slow" style={{ fontSize: "20px" }}>✦</div>
            <span className={"text-sm text-casino-lightGray font-bold " + inter.className}>StarsHub</span>
          </div> {/* лого */}
          <button className="inline-flex items-center justify-center gap-2 whitespace-nowrap text-sm font-medium ring-offset-background transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 [&amp;_svg]:pointer-events-none [&amp;_svg]:size-4 [&amp;_svg]:shrink-0 hover:text-accent-foreground h-9 rounded-md" type="button" id="radix-:r0:" aria-haspopup="menu" aria-expanded="false" data-state="closed">
            <span className="relative flex shrink-0 overflow-hidden rounded-full w-8 h-8 border border-casino-gold">
              <span className="flex h-full w-full items-center justify-center rounded-full bg-casino-gold text-casino-black text-sm font-bold">
                <img src="/profile.png" alt="avatar" />
              </span>
            </span>
          </button> {/* профиль */}
        </div>
        <div className="px-4 pb-20 mt-10 relative z-10">
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
                      <div className="text-2xl">
                        <img src="/frog.png" alt="frog" width={60} height={60} />
                      </div>
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
                  <div className={"text-2xl font-bold text-casino-gold " + inter.className}>15</div>
                  <div className={"text-casino-lightGray text-sm " + inter.className}>Уровень</div>
                </div>
                <div className="text-center mx-8">
                  <div className={"text-2xl font-bold text-casino-gold " + inter.className}>2.5K</div>
                  <div className={"text-casino-lightGray text-sm " + inter.className}>Звёзды</div>
                </div>
                <div className="text-center pl-8 border-l border-casino-gold/20">
                  <div className={"text-2xl font-bold text-casino-gold " + inter.className}>7</div>
                  <div className={"text-casino-lightGray text-sm " + inter.className}>Друзья</div>
                </div>
              </div>
            </div>
          </div>
        </div>
        <div className="fixed bottom-0 left-0 right-0 bg-casino-darkGray/95 backdrop-blur-sm border-t border-casino-gold/20 z-20">
          <div className="max-w-md mx-auto px-4 py-2">
            <div className="flex justify-around">
              <button className="nav-item active">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house">
                  <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
                  <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
                </svg>
                <span className={"text-xs mt-1 " + inter.className}>Главная</span>
              </button>
              <button className="nav-item ">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad2">
                  <line x1="6" x2="10" y1="11" y2="11"></line>
                  <line x1="8" x2="8" y1="9" y2="13"></line>
                  <line x1="15" x2="15.01" y1="12" y2="12"></line>
                  <line x1="18" x2="18.01" y1="10" y2="10"></line>
                  <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
                </svg><span className={"text-xs mt-1 " + inter.className}>Игры</span></button>
              <button className="nav-item ">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy">
                  <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
                  <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
                  <path d="M4 22h16"></path>
                  <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
                  <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
                  <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
                </svg><span className={"text-xs mt-1 " + inter.className}>Задания</span></button>
              <button className="nav-item ">
                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
                  <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
                  <circle cx="12" cy="7" r="4"></circle>
                </svg><span className={"text-xs mt-1 " + inter.className}>Профиль</span></button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
