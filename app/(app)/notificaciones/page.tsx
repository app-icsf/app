import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getNotifications } from "@/lib/data";
import { markNotificationsRead } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import EmptyState from "@/components/EmptyState";
import { timeAgo } from "@/lib/format";

const ICONS: Record<string, string> = { BIRTHDAY: "cake", NEW_MEMBER: "person_add", EVENT_REMINDER: "event", MESSAGE: "chat_bubble", ACHIEVEMENT: "military_tech", CREDENTIAL: "workspace_premium", COMMUNITY: "forum" };

export default async function Notificaciones() {
  const user = await requireUser();
  const notifications = await getNotifications(user.id);
  const hasUnread = notifications.some((n) => !n.readAt);

  return (
    <>
      <DetailHeader title="Notificaciones" right={hasUnread && (
        <form action={async () => { "use server"; await markNotificationsRead("/notificaciones"); }}><button className="text-inverse-primary text-label-sm text-label-sm pr-1">Marcar leídas</button></form>
      )} />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-3 space-y-2">
        {notifications.map((n) => (
          <Link key={n.id} href={n.link ?? "#"} className={`flex items-start gap-3 rounded-xl p-3.5 border ${n.readAt ? "bg-surface-container-lowest border-border-subtle" : "bg-secondary-container/10 border-secondary/30"}`}>
            <span className="material-symbols-outlined text-[20px] text-secondary shrink-0 mt-0.5">{ICONS[n.type] ?? "notifications"}</span>
            <div className="min-w-0 flex-1"><p className="font-label-lg text-label-lg text-on-surface">{n.title}</p>{n.body && <p className="text-body-sm text-body-sm text-on-surface-variant mt-0.5">{n.body}</p>}<p className="text-label-sm text-label-sm text-outline mt-1">{timeAgo(n.createdAt)}</p></div>
            {!n.readAt && <span className="w-2 h-2 rounded-full bg-secondary shrink-0 mt-1.5" />}
          </Link>
        ))}
        {notifications.length === 0 && <EmptyState>Sin notificaciones.</EmptyState>}
      </main>
    </>
  );
}
