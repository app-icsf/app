import { requireUser } from "@/lib/session";
import { getChapterWall } from "@/lib/data";
import { joinCommunity, postToChapterWall, reactToPost } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import IconCircle from "@/components/IconCircle";
import EmptyState from "@/components/EmptyState";
import MessageComposer from "@/components/MessageComposer";
import { timeAgo } from "@/lib/format";

const QUICK_REACTIONS = ["👏", "💡", "🔥", "🎯", "🙌"];

export default async function ComunidadDetalle({ params, searchParams }: { params: Promise<{ slug: string }>; searchParams: Promise<{ aviso?: string }> }) {
  const { slug } = await params;
  const { aviso } = await searchParams;
  const user = await requireUser();
  const { community, chapter, posts, isMember } = await getChapterWall(slug, user.id);
  const path = `/comunidad/${slug}`;

  function Reactions({ post }: { post: (typeof posts)[number] | (typeof posts)[number]["replies"][number] }) {
    const byEmoji = new Map<string, { userId: string; name: string }[]>();
    for (const r of post.reactions) {
      const list = byEmoji.get(r.emoji) ?? [];
      list.push({ userId: r.userId, name: r.user.name });
      byEmoji.set(r.emoji, list);
    }
    return (
      <div className="flex items-center gap-1.5 flex-wrap mt-2">
        {[...byEmoji.entries()].map(([emoji, people]) => {
          const firsts = people.map((p) => p.name.split(" ")[0]);
          const who = firsts.length <= 2 ? firsts.join(", ") : `${firsts.slice(0, 2).join(", ")} +${firsts.length - 2}`;
          const mine = people.some((p) => p.userId === user.id);
          return (
            <form key={emoji} action={async () => { "use server"; await reactToPost(post.id, emoji, path); }}>
              <button
                title={people.map((p) => p.name).join(", ")}
                aria-label={`${emoji}, ${people.map((p) => p.name).join(", ")}`}
                className={`px-2 py-0.5 rounded-full text-body-sm flex items-center gap-1 border ${mine ? "bg-secondary-container/15 border-secondary text-secondary" : "bg-surface-container-low border-border-subtle text-on-surface"}`}
              >
                {emoji} <span className="font-label-sm text-label-sm">{who}</span>
              </button>
            </form>
          );
        })}
        <details className="relative">
          <summary className="list-none w-6 h-6 rounded-full bg-surface-container-low flex items-center justify-center cursor-pointer text-outline"><span className="material-symbols-outlined text-[14px]">add_reaction</span></summary>
          <div className="absolute z-10 top-7 left-0 bg-surface-container-lowest border border-border-subtle rounded-lg shadow-lg p-1.5 flex gap-1">
            {QUICK_REACTIONS.map((e) => (
              <form key={e} action={async () => { "use server"; await reactToPost(post.id, e, path); }}>
                <button className="w-7 h-7 rounded hover:bg-surface-container-low">{e}</button>
              </form>
            ))}
          </div>
        </details>
      </div>
    );
  }

  return (
    <>
      <DetailHeader title={community.name} right={<span className="material-symbols-outlined text-inverse-primary text-[20px] pr-1">more_vert</span>} />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe flex flex-col">
        <div className="px-margin py-3 bg-surface-container-low border-b border-border-subtle flex items-center gap-2.5">
          <IconCircle icon="flag" tone="primary" size={40} />
          <div className="min-w-0 flex-1">
            <p className="font-label-lg text-label-lg text-on-surface truncate">{community.name} {chapter && <span className="text-body-sm text-body-sm text-secondary font-normal">Activo</span>}</p>
            <p className="text-body-sm text-body-sm text-on-surface-variant">{chapter?.description ?? `${community._count.members} miembros en este espacio`}</p>
          </div>
          {!isMember && (
            <form action={async () => { "use server"; await joinCommunity(community.id, path); }}>
              <button className="shrink-0 px-3 h-9 rounded-full bg-primary-container text-on-primary text-label-md font-label-md">Unirse</button>
            </form>
          )}
        </div>

        <div className="flex-1 overflow-y-auto px-margin py-4 space-y-4">
          {posts.length === 0 && <EmptyState>Aún no hay publicaciones. Sé la primera persona en escribir.</EmptyState>}
          {posts.map((p) => (
            <article key={p.id} className="bg-surface-card rounded-xl p-space-md card-elevated space-y-space-sm">
              <div className="flex items-start gap-3">
                <Avatar name={p.author.name} size={48} />
                <div className="min-w-0 flex-1">
                  <div className="flex items-center gap-1.5 flex-wrap">
                    <span className="font-headline-sm text-headline-sm text-on-surface font-bold truncate">{p.author.name}</span>
                    {p.author.profile?.chapterRole && <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-label-sm bg-honor-amber-soft text-ambassador-gold">{p.author.profile.chapterRole}</span>}
                    <span className="text-body-sm text-outline">{timeAgo(p.createdAt)}</span>
                  </div>
                  {p.title && (
                    <div className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-surface-container font-label-sm text-secondary font-semibold">
                      <span className="material-symbols-outlined text-[14px]">campaign</span>{p.title}
                    </div>
                  )}
                  <p className="text-body-md text-on-surface mt-1.5 leading-relaxed">{p.body}</p>
                  <Reactions post={p} />
                  {p.replies.length > 0 && (
                    <div className="mt-3 pl-4 border-l-2 border-border-subtle space-y-3">
                      {p.replies.map((r) => (
                        <div key={r.id} className="flex items-start gap-2.5">
                          <Avatar name={r.author.name} size={32} />
                          <div className="min-w-0 flex-1">
                            <div className="flex items-center gap-1.5 flex-wrap"><span className="font-label-md text-label-md text-on-surface">{r.author.name}</span><TierBadge tier={r.author.profile?.tier} /><span className="text-body-sm text-outline">{timeAgo(r.createdAt)}</span></div>
                            <p className="text-body-sm text-on-surface mt-0.5 leading-relaxed">{r.body}</p>
                            <Reactions post={r} />
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </article>
          ))}
        </div>

        {aviso && <p role="alert" className="mx-margin mb-3 rounded-lg bg-honor-amber-soft text-on-tertiary-container text-body-sm p-3">{aviso}</p>}
        <MessageComposer placeholder={`Escribe un mensaje en ${community.name}...`}
          action={async (fd: FormData) => { "use server"; await postToChapterWall(community.id, String(fd.get("body") ?? ""), path); }} />
      </main>
    </>
  );
}
