import { inter } from "../fonts";

export default function Counts({ curUser }: { curUser: any }) {
  return (
    <div className="flex justify-center py-6">
      <div className="text-center pr-8 border-r border-casino-gold/20">
        <div className={"text-2xl font-bold text-casino-gold " + inter.className}>{curUser.lvl}</div>
        <div className={"text-casino-lightGray text-sm " + inter.className}>Уровень</div>
      </div>
      <div className="text-center mx-8">
        <div className="flex flex-row justify-center items-center">
          <div className={"text-2xl font-bold text-casino-gold mr-2 " + inter.className}>{curUser.stars}</div>
          <img src="/SCoin_yellow.png" alt="S" className="inline-block" style={{ width: "20px", height: "20px" }} />
        </div>
        <div className={"text-casino-lightGray text-sm " + inter.className}>SCoins</div>
      </div>
      <div className="text-center pl-8 border-l border-casino-gold/20">
        <div className={"text-2xl font-bold text-casino-gold " + inter.className}>{curUser.friends}</div>
        <div className={"text-casino-lightGray text-sm " + inter.className}>Друзья</div>
      </div>
    </div>
  )
}