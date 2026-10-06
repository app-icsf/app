import Link from "next/link";
import { requireUser, requirePermission } from "@/lib/session";
import { getDiscoverProfiles, getMyProfile } from "@/lib/data";
import { sendConnectionRequest } from "@/lib/actions";
import { db } from "@/lib/db";
import RootHeader from "@/components/RootHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import EmptyState from "@/components/EmptyState";

export default async function Descubrir({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requirePermission("directory.read");
  const { q } = await searchParams;
  const [profiles, activeThisWeek] = await Promise.all([
    getDiscoverProfiles(me.id, q),
    db.user.count({ where: { lastLoginAt: { gte: new Date(Date.now() - 7 * 86400000) } } }),
  ]);

  return (
    <>
      <RootHeader userId={me.id} label="Descubrir" showSearch />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-6 gap-y-space-md">
          <header className="flex flex-col gap-1.5 pt-2">
            <div className="inline-flex items-center gap-1.5 text-secondary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span><span className="font-label-sm text-label-sm uppercase tracking-widest font-semibold">Red Global ICSF</span></div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">Descubrir personas</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">Conecta con speakers, coaches y facilitadores de la federación.</p>
          </header>

          <form className="relative w-full shadow-sm rounded-xl bg-surface-container-lowest border border-border-subtle">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">search</span></div>
            <input name="q" defaultValue={q} placeholder="Nombre, ciudad, especialidad, tema..." className="w-full h-12 pl-11 pr-4 bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline-variant focus:outline-none rounded-xl" />
          </form>

          <div className="flex flex-col gap-y-space-md mt-1">
            {profiles.map((p) => (
              <article key={p.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_2px_8px_-2px_rgba(11,25,44,0.06)] border border-border-subtle flex flex-col gap-4">
                <div className="flex items-start gap-3.5">
                  <div className="relative flex-shrink-0">
                    <Avatar name={p.user.name} size={64} />
                    <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-ambassador-gold text-white rounded-full flex items-center justify-center shadow-xs"><span className="material-symbols-outlined text-[12px]">verified</span></span>
                  </div>
                  <div className="flex flex-col min-w-0 flex-1">
                    <div className="flex items-center justify-between gap-1"><h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{p.user.name}</h2><TierBadge tier={p.tier} /></div>
                    <div className="flex items-center gap-1 text-on-surface-variant mt-0.5"><span className="material-symbols-outlined text-[14px]">location_on</span><span className="font-body-sm text-body-sm truncate">{[p.city, p.country].filter(Boolean).join(", ")}</span></div>
                    <p className="font-label-md text-label-md text-on-surface-variant mt-1.5 font-medium leading-snug">{p.title}</p>
                  </div>
                </div>
                {p.topics.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">{p.topics.map((t) => <span key={t.topicId} className="bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full font-label-sm text-label-sm">#{t.topic.name.replace(/\s+/g, "")}</span>)}</div>
                )}
                <div className="grid grid-cols-2 gap-2.5">
                  <form action={async () => { "use server"; await sendConnectionRequest(p.id, "/descubrir"); }}>
                    <button className="w-full h-11 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md">Conectar</button>
                  </form>
                  <Link href={`/miembros/${p.slug}`} className="h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center">Ver perfil</Link>
                </div>
              </article>
            ))}
            {profiles.length === 0 && <EmptyState>Sin resultados para "{q}".</EmptyState>}
          </div>
          <p className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider">Más de {activeThisWeek} miembros activos esta semana</p>
        </div>
      </main>
    </>
  );
}
