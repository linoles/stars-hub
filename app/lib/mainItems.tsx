import { inter } from "../fonts";
import Counts from "./counts";

export default function MainItems({ curUser }: { curUser: any }) {
  return (
    <div className="px-4 pb-20 relative z-10 h-screen flex flex-col items-center justify-center">
      <div className="relative z-10 text-center space-y-6">
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
          <h1
            className={"text-5xl font-bold tracking-wide " + inter.className}
            style={{
              background: "linear-gradient(90deg, #fbbf24, #f59939, #fbbf24)",
              backgroundSize: "200% auto",
              backgroundClip: "text",
              WebkitBackgroundClip: "text",
              WebkitTextFillColor: "transparent",
              animation: "gradient 3s linear infinite",
              letterSpacing: "0.04em"
            }}
          >
            STARSHUB
          </h1>
          <div className="flex items-center justify-center mt-3">
            <div className="text-casino-gold animate-pulse mr-2" style={{ fontSize: "12px" }}>✦</div>
            <p className={"text-casino-lightGray text-lg font-light " + inter.className}>Азартные игры на звёзды</p>
            <div className="text-casino-gold animate-pulse delay-500 ml-2" style={{ fontSize: "12px" }}>✦</div>
          </div>
        </div>
      </div>
      <Counts curUser={curUser} />
    </div>
  )
}