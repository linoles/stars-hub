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
  const [curUser, setCurUser] = useState<User>({ tgId: 0, tgUsername: "", tgNick: "", stars: 0, lvl: 1, friends: 0 });

  useEffect(() => {
    if (window.Telegram?.WebApp) {
      const tg = window.Telegram.WebApp;
      console.log(tg);
      tg.requestFullscreen();
      tg.SettingsButton.show();
      setTgData(tg.initDataUnsafe?.user);
    } else {
      console.log("Telegram WebApp is not loaded yet.");
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
      <div className={`w-screen h-screen flex flex-col items-center justify-center ${inter.className}`}>
        <div className="flex flex-col items-center justify-center">
          <h1 className="text-2xl font-bold mb-4">Профиль</h1>
          <div className="flex items-center mb-4">
            <img src="/userImg.png" alt="User Avatar" className="w-16 h-16 rounded-full mr-4" />
            <div>
              <p className="text-lg font-semibold">{curUser.tgNick}</p>
              <p className="text-sm text-gray-600">{curUser.tgUsername}</p>
            </div>
          </div>
          <p className="text-lg font-semibold">Звезды: {curUser.stars}</p>
          <p className="text-lg font-semibold">Уровень: {curUser.lvl}</p>
          <p className="text-lg font-semibold">Друзья: {curUser.friends}</p>
        </div>
      </div>
      <BottomMenu activeItem={3} />
    </div>
  )
}