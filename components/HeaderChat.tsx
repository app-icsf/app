import Link from "next/link";
import { getUnreadMessageCount } from "@/lib/data";

export default async function HeaderChat({ userId }: { userId: string }) {
  const count = await getUnreadMessageCount(userId);
  return (
    <Link href="/mensajes" aria-label="Mensajes" className="w-11 h-11 flex items-center justify-center rounded-full text-inverse-primary hover:text-on-primary relative transition-colors">
      <span className="material-symbols-outlined text-[22px]">chat_bubble</span>
      {count > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-stage-electric-blue" />}
    </Link>
  );
}
