import { inter } from "../fonts";

export default function BottomMenu({ activeItem }: { activeItem: number }) {
  return (
    <div className="fixed bottom-0 left-0 right-0 bg-casino-darkGray/95 backdrop-blur-sm border-t border-casino-gold/20 z-20">
      <div className="max-w-md mx-auto px-4 py-2">
        <div className="flex justify-around">
          <button className={`nav-item ${activeItem === 0 ? "active" : ""}`} onClick={() => window.location.href = "/"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-house">
              <path d="M15 21v-8a1 1 0 0 0-1-1h-4a1 1 0 0 0-1 1v8"></path>
              <path d="M3 10a2 2 0 0 1 .709-1.528l7-5.999a2 2 0 0 1 2.582 0l7 5.999A2 2 0 0 1 21 10v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"></path>
            </svg>
            <span className={"text-xs mt-1 " + inter.className}>Главная</span>
          </button>
          <button className={`nav-item ${activeItem === 1 ? "active" : ""}`} onClick={() => window.location.href = "/games"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-gamepad2">
              <line x1="6" x2="10" y1="11" y2="11"></line>
              <line x1="8" x2="8" y1="9" y2="13"></line>
              <line x1="15" x2="15.01" y1="12" y2="12"></line>
              <line x1="18" x2="18.01" y1="10" y2="10"></line>
              <path d="M17.32 5H6.68a4 4 0 0 0-3.978 3.59c-.006.052-.01.101-.017.152C2.604 9.416 2 14.456 2 16a3 3 0 0 0 3 3c1 0 1.5-.5 2-1l1.414-1.414A2 2 0 0 1 9.828 16h4.344a2 2 0 0 1 1.414.586L17 18c.5.5 1 1 2 1a3 3 0 0 0 3-3c0-1.545-.604-6.584-.685-7.258-.007-.05-.011-.1-.017-.151A4 4 0 0 0 17.32 5z"></path>
            </svg>
            <span className={"text-xs mt-1 " + inter.className}>Игры</span>
          </button>
          <button className={`nav-item ${activeItem === 2 ? "active" : ""}`} onClick={() => window.location.href = "/quests"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-trophy">
              <path d="M6 9H4.5a2.5 2.5 0 0 1 0-5H6"></path>
              <path d="M18 9h1.5a2.5 2.5 0 0 0 0-5H18"></path>
              <path d="M4 22h16"></path>
              <path d="M10 14.66V17c0 .55-.47.98-.97 1.21C7.85 18.75 7 20.24 7 22"></path>
              <path d="M14 14.66V17c0 .55.47.98.97 1.21C16.15 18.75 17 20.24 17 22"></path>
              <path d="M18 2H6v7a6 6 0 0 0 12 0V2Z"></path>
            </svg>
            <span className={"text-xs mt-1 " + inter.className}>Задания</span>
          </button>
          <button className={`nav-item ${activeItem === 3 ? "active" : ""}`} onClick={() => window.location.href = "/profile"}>
            <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="lucide lucide-user">
              <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"></path>
              <circle cx="12" cy="7" r="4"></circle>
            </svg>
            <span className={"text-xs mt-1 " + inter.className}>Профиль</span>
          </button>
        </div>
      </div>
    </div>
  )
}