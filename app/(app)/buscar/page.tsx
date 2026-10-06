import Link from "next/link";
import { requireUser } from "@/lib/session";
import { globalSearch } from "@/lib/data";
import DetailHeader from "@/components/DetailHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import SectionLabel from "@/components/SectionLabel";
import EmptyState from "@/components/EmptyState";

export default async function Buscar({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const user = await requireUser();
  const { q = "" } = await searchParams;
  const { people, events, posts } = await globalSearch(q, user.id);

  return (
    <>
      <DetailHeader title="Buscar" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-3 space-y-5">
        <form className="relative w-full rounded-xl bg-surface-container-lowest border border-border-subtle">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-outline text-[20px]">search</span>
          <input name="q" defaultValue={q} autoFocus placeholder="Personas, eventos, publicaciones..." className="w-full h-12 pl-11 pr-4 bg-transparent outline-none text-body-md" />
        </form>

        {q && (
          <div className="space-y-5">
            {people.length > 0 && (
              <section className="space-y-2"><SectionLabel>Personas</SectionLabel>
                {people.map((p) => <Link key={p.id} href={`/miembros/${p.slug}`} className="flex items-center gap-3 py-2"><Avatar name={p.user.name} size={40} /><div className="min-w-0 flex-1"><p className="font-label-lg text-label-lg text-on-surface truncate">{p.user.name}</p><p className="text-body-sm text-body-sm text-on-surface-variant truncate">{p.title}</p></div><TierBadge tier={p.tier} /></Link>)}
              </section>
            )}
            {events.length > 0 && (
              <section className="space-y-2"><SectionLabel>Eventos</SectionLabel>
                {events.map((e) => <Link key={e.id} href="/eventos" className="flex items-center gap-2 py-2"><span className="material-symbols-outlined text-secondary text-[20px]">event</span><p className="font-label-lg text-label-lg text-on-surface">{e.title}</p></Link>)}
              </section>
            )}
            {posts.length > 0 && (
              <section className="space-y-2"><SectionLabel>Publicaciones</SectionLabel>
                {posts.map((p) => <Link key={p.id} href="/comunidad" className="block py-2"><p className="text-body-md text-body-md text-on-surface line-clamp-2">{p.body}</p><p className="text-label-sm text-label-sm text-outline">{p.author.name}</p></Link>)}
              </section>
            )}
            {!people.length && !events.length && !posts.length && <EmptyState>Sin resultados para "{q}".</EmptyState>}
          </div>
        )}
      </main>
    </>
  );
}
