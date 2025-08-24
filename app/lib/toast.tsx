'use client';

import { useEffect, useState } from 'react';
import { inter } from '../fonts';

interface ToastNotificationProps {
  message: string;
  type?: 'success' | 'error' | 'warning' | 'info' | 'error2';
  duration?: number;
  isVisible: boolean;
  onClose: () => void;
}

export default function ToastNotification({
  message,
  type = 'info',
  duration = 3000,
  isVisible,
  onClose
}: ToastNotificationProps) {
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (isVisible) {
      setShow(true);
      
      const timer = setTimeout(() => {
        setShow(false);
        setTimeout(onClose, 300);
      }, duration);

      return () => clearTimeout(timer);
    }
  }, [isVisible, duration, onClose]);

  if (!isVisible && !show) return null;

  return (
    <div className={`
      fixed top-6 transform z-50
      transition-all duration-300 ease-in-out w-[calc(100vw-24px)] mx-3
      ${show ? 'opacity-100' : 'opacity-0'}
    `}>
      <div className={`
        px-6 py-3 rounded-xl shadow-lg bg-gray-900/50 
        flex flex-row justify-center space-x-3 items-center
      `}>
        <img src={type === 'success' ? "/confetti.png" : type === "info" ? "/info.png" : type === "error" ? "/lose.png" : "/skull.png"} alt="confetti" className="w-12 h-12" />
        <p className={"text-white font-semibold text-start " + inter.className}>{message}</p>
      </div>
    </div>
  );
}