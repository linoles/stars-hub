"use client";

import { useEffect } from "react";

declare global {
  interface Window {
    Telegram: any;
  }
}

export default function Home() {
  useEffect(() => {
    const tg = window.Telegram
    console.info(tg);
  })

  return (
    <div>StarsHub</div>
  );
}
