import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getConversations } from "@/lib/data";
import { db } from "@/lib/db";
import RootHeader from "@/components/RootHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import SectionLabel from "@/components/SectionLabel";
import EmptyState from "@/components/EmptyState";
import IconCircle from "@/components/IconCircle";
import { timeAgo } from "@/lib/format";

export default async function Mensajes() {
  const user = await requireUser();
  const [conversations, mentors] = await Promise.all([
    getConversations(user.id),
    db.profile.findMany({ where: { isMentor: true, userId: { not: user.id } }, take: 4, include: { user: true } }),
  ]);
  const totalUnread = conversations.reduce((a, c) => a + c.unread, 0);
  const pinned = conversations.filter((c) => c.pinned);

  return (
    <>
      <RootHeader userId={user.id} label="Mensajes" showSearch />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-6 gap-y-space-md">
          <div className="pt-space-sm">
            <p className="text-label-md font-label-md uppercase tracking-wider text-secondary">Comunicaciones directas</p>
            <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight mt-1">Mensajes</h1>
            <p className="text-body-md font-body-md text-on-surface-variant mt-1">{conversations.length} conversaciones{totalUnread > 0 ? ` · ${totalUnread} sin leer` : ""}</p>
          </div>

          {pinned.length > 0 && (
            <section className="space-y-space-sm -mx-margin">
              <div className="px-margin"><SectionLabel>Conexiones destacadas</SectionLabel></div>
              <div className="flex gap-4 overflow-x-auto px-margin scrollbar-none">
                {pinned.map((c) => {
                  const other = c.conversation.members[0]?.user;
                  if (!other) return null;
                  return (
                    <Link key={c.conversationId} href={`/mensajes/${c.conversationId}`} className="flex flex-col items-center gap-1 shrink-0 w-16">
                      <Avatar name={other.name} size={56} /><span className="font-label-sm text-label-sm text-on-surface truncate w-full text-center">{other.name.split(" ")[0]}</span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          <section className="space-y-1">
            {conversations.map((c) => {
              const other = c.conversation.members[0]?.user;
              const last = c.conversation.messages[0];
              const title = c.conversation.title ?? other?.name ?? "Conversación";
              return (
                <Link key={c.conversationId} href={`/mensajes/${c.conversationId}`} className="flex items-center gap-3 py-3 border-b border-border-subtle">
                  {other ? <Avatar name={other.name} size={48} /> : <IconCircle icon="support_agent" tone="primary" size={48} />}
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5"><p className="font-label-lg text-label-lg text-on-surface truncate">{title}</p>{other?.profile?.tier && <TierBadge tier={other.profile.tier} />}</div>
                    <p className={`text-body-sm text-body-sm truncate ${c.unread > 0 ? "text-on-surface font-medium" : "text-on-surface-variant"}`}>{last?.kind === "VOICE" ? "🎙️ Nota de voz" : last?.kind === "FILE" ? `📎 ${last.attachmentName}` : last?.body ?? "Sin mensajes"}</p>
                  </div>
                  <div className="flex flex-col items-end gap-1 shrink-0">
                    {last && <span className="text-label-sm text-label-sm text-outline">{timeAgo(last.createdAt)}</span>}
                    {c.unread > 0 && <span className="w-5 h-5 rounded-full bg-secondary text-on-secondary text-[10px] flex items-center justify-center font-bold">{c.unread}</span>}
                  </div>
                </Link>
              );
            })}
            {conversations.length === 0 && <EmptyState>Sin conversaciones todavía.</EmptyState>}
          </section>

          {mentors.length > 0 && (
            <Link href="/descubrir" className="bg-surface-container-lowest rounded-xl p-space-md border border-border-subtle flex items-center gap-3">
              <span className="material-symbols-outlined text-secondary text-[24px]">diversity_3</span>
              <div className="flex-1"><p className="font-label-lg text-label-lg text-on-surface">Salón de Mentores</p><p className="text-body-sm text-body-sm text-on-surface-variant">Conecta con un colega acreditado</p></div>
              <span className="text-label-md text-label-md text-secondary">Explorar</span>
            </Link>
          )}
        </div>
      </main>
    </>
  );
}
