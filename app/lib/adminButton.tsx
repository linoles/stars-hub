import { config } from "../config";
import { inter } from "../fonts";
import "../globals.css";

export default function AdminButton({ curUser }: { curUser: any }) {
  const admins = config.botAdmins;
  if (!admins || !admins.includes(curUser.tgId)) {
    return null;
  }
  return (
    <div className={"h-[60px] w-screen max-w-[320px] bg-casino-darkGray/95 font-extrabold text-3xl flex items-center justify-center mx-3 rounded-3xl mt-1 hover:bg-casino-darkGray/50 text-white " + inter.className} onClick={() => window.location.href = "/admin8632"}>AdminPanel</div>
  )
}