import Link from "next/link";
import { db } from "@/lib/db";

export default async function HeaderBell({ userId }: { userId: string }) {
  const count = await db.notification.count({ where: { userId, readAt: null } });
  return (
    <Link href="/notificaciones" aria-label="Notificaciones" className="w-11 h-11 flex items-center justify-center rounded-full text-inverse-primary hover:text-on-primary relative transition-colors">
      <span className="material-symbols-outlined text-[22px]">notifications</span>
      {count > 0 && <span className="absolute top-2.5 right-2.5 w-2 h-2 rounded-full bg-ambassador-gold" />}
    </Link>
  );
}
