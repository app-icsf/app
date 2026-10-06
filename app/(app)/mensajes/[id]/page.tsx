import { requireUser } from "@/lib/session";
import { getConversation } from "@/lib/data";
import { sendChatMessage, markConversationRead } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import ScrollToBottom from "@/components/ScrollToBottom";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import MessageComposer from "@/components/MessageComposer";
import RefreshPoll from "@/components/RefreshPoll";
import { clockTime, fileSize } from "@/lib/format";

export default async function Chat({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const { conversation, other } = await getConversation(id, user.id);
  await markConversationRead(id);
  const title = conversation.title ?? other?.name ?? "Conversación";
  const path = `/mensajes/${id}`;

  return (
    <>
      <RefreshPoll ms={4000} />
      <DetailHeader title={title} right={
        <div className="flex items-center gap-1 shrink-0">
          {conversation.kind === "DIRECT" && <button aria-label="Iniciar llamada de audio" className="w-10 h-10 flex items-center justify-center text-inverse-primary"><span className="material-symbols-outlined text-[20px]">call</span></button>}
          <button aria-label="Opciones del chat" className="w-10 h-10 flex items-center justify-center text-inverse-primary"><span className="material-symbols-outlined text-[20px]">more_vert</span></button>
        </div>
      } />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe flex flex-col">
        {other && (
          <div className="px-margin py-2 bg-surface-container-low border-b border-border-subtle flex items-center gap-2.5">
            <Avatar name={other.name} size={32} />
            <p className="text-body-sm text-body-sm text-on-surface-variant">{other.profile?.title ?? "Miembro ICSF"} · {other.profile?.city ?? "En línea"}</p>
          </div>
        )}
        <div className="flex-1 overflow-y-auto px-margin py-4 space-y-3">
          {conversation.messages.map((m) => {
            const mine = m.senderId === user.id;
            return (
              <div key={m.id} className={`flex flex-col ${mine ? "items-end" : "items-start"}`}>
                <div className={`max-w-[78%] rounded-2xl px-4 py-2.5 ${mine ? "bg-secondary text-on-secondary rounded-br-sm" : "bg-surface-container-lowest border border-border-subtle text-on-surface rounded-bl-sm"}`}>
                  {m.kind === "VOICE" && <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[20px]">play_arrow</span><span className="text-body-sm text-body-sm">Nota de voz · 0:{String(m.durationSec ?? 0).padStart(2, "0")}</span></div>}
                  {m.kind === "FILE" && (
                    <div className="flex items-center gap-2"><span className="material-symbols-outlined text-[22px]">picture_as_pdf</span><div className="min-w-0"><p className="text-body-sm text-body-sm font-medium truncate">{m.attachmentName}</p><p className="text-[11px] opacity-80">{fileSize(m.attachmentSize)}</p></div><span className="material-symbols-outlined text-[18px]">download</span></div>
                  )}
                  {m.body && <p className="text-body-md text-body-md leading-relaxed whitespace-pre-wrap">{m.body}</p>}
                </div>
                <div className="flex items-center gap-1 mt-1">
                  <span className="text-label-sm text-label-sm text-outline">{clockTime(m.createdAt)}</span>
                  {mine && m.readAt && <span className="material-symbols-outlined text-[13px] text-secondary">done_all</span>}
                  {m.reactions.length > 0 && <span className="text-body-sm text-body-sm">{[...new Set(m.reactions.map((r) => r.emoji))].join(" ")}</span>}
                </div>
              </div>
            );
          })}
          {conversation.messages.length === 0 && <EmptyState>Inicia la conversación.</EmptyState>}
          <ScrollToBottom dep={conversation.messages.length} />
        </div>
        <MessageComposer placeholder="Escribe un mensaje..." showMic
          action={async (fd: FormData) => { "use server"; await sendChatMessage(id, String(fd.get("body") ?? ""), path); }} />
      </main>
    </>
  );
}
