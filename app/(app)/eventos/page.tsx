import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { getEvents } from "@/lib/data";
import { toggleRsvp } from "@/lib/actions";
import RootHeader from "@/components/RootHeader";
import Avatar from "@/components/Avatar";
import EmptyState from "@/components/EmptyState";
import { dayMonth } from "@/lib/format";

const TABS = [["proximos", "Próximos"], ["cerca", "Cerca de mí"], ["mios", "Mis eventos"]] as const;

export default async function Eventos({ searchParams }: { searchParams: Promise<{ tab?: string; cat?: string }> }) {
  const user = await requirePermission("events.read");
  const { tab = "proximos", cat } = await searchParams;
  const { upcoming, categories, rsvpMap, myChapterId } = await getEvents(user.id);

  let events = upcoming;
  if (tab === "cerca") events = events.filter((e) => e.chapterId && e.chapterId === myChapterId);
  if (tab === "mios") events = events.filter((e) => rsvpMap.has(e.id));
  if (cat) events = events.filter((e) => e.category?.key === cat);

  return (
    <>
      <RootHeader userId={user.id} label="Eventos" showSearch />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-6 gap-y-space-md">
          <div className="pt-space-sm flex items-center justify-between">
            <div><p className="text-label-md font-label-md uppercase tracking-wider text-secondary">Agenda Oficial</p><h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight mt-1">Eventos</h1></div>
            {events[0] && <a href={`/api/eventos/${events[0].id}/ics`} aria-label="Descargar calendario" className="w-10 h-10 rounded-full bg-surface-container-lowest border border-border-subtle flex items-center justify-center text-on-surface"><span className="material-symbols-outlined text-[20px]">calendar_month</span></a>}
          </div>

          <div className="flex items-center gap-space-xs p-1 bg-surface-container-low rounded-xl">
            {TABS.map(([key, label]) => (
              <Link key={key} href={`/eventos?tab=${key}`} className={`flex-1 text-center py-2 px-space-xs rounded-lg font-label-md text-label-md transition-all ${tab === key ? "bg-surface-container-lowest text-on-surface shadow-sm" : "text-text-muted"}`}>{label}</Link>
            ))}
          </div>

          <div className="flex items-center gap-2 overflow-x-auto scrollbar-none -mx-margin px-margin py-1">
            <Link href={`/eventos?tab=${tab}`} className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md ${!cat ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>Todos</Link>
            {categories.map((c) => (
              <Link key={c.id} href={`/eventos?tab=${tab}&cat=${c.key}`} className={`shrink-0 px-4 py-2 rounded-full font-label-md text-label-md ${cat === c.key ? "bg-primary-container text-on-primary" : "bg-surface-container text-on-surface-variant"}`}>{c.name}</Link>
            ))}
          </div>

          <div className="space-y-4">
            {events.map((e, i) => {
              const { day, month } = dayMonth(e.startsAt);
              const status = rsvpMap.get(e.id);
              const spotsLeft = e.capacity ? Math.max(0, e.capacity - e.rsvps.filter((r) => r.status === "GOING").length) : null;
              const featured = i === 0 && tab === "proximos" && !cat;
              if (featured) {
                return (
                  <article key={e.id} className="w-full bg-surface-card rounded-xl overflow-hidden card-float flex flex-col">
                    <div className="relative w-full h-40 bg-primary-container">
                      <div className="absolute inset-0 bg-gradient-to-t from-[#0B192C] via-[#0B192C]/50 to-transparent" />
                      <div className="absolute top-3 inset-x-3 flex items-center justify-between">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-[#0B192C]/85 text-white font-label-sm uppercase tracking-widest">
                          <span className="material-symbols-outlined text-ambassador-gold text-[15px]">workspace_premium</span>
                          {e.category?.name ?? "Evento ICSF"}
                        </span>
                        {status === "GOING" && (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-stage-electric-blue text-white font-label-sm">
                            <span className="material-symbols-outlined text-[14px]">check_circle</span> Confirmado
                          </span>
                        )}
                      </div>
                      <div className="absolute bottom-3 left-3 flex items-center gap-2">
                        <div className="flex flex-col items-center justify-center bg-white rounded-lg px-2.5 py-1">
                          <span className="font-label-sm text-stage-electric-blue uppercase font-extrabold">{month}</span>
                          <span className="font-headline-sm font-black leading-none">{day}</span>
                        </div>
                        <p className="font-headline-sm text-white font-bold drop-shadow-sm">{e.title}</p>
                      </div>
                    </div>
                    <div className="p-4 space-y-2">
                      <p className="text-body-sm text-on-surface-variant">{e.location}{e.kind === "HYBRID" ? " · Híbrido" : e.kind === "ONLINE" ? " · Online" : ""}</p>
                      {e.description && <p className="text-body-sm text-on-surface-variant line-clamp-2">{e.description}</p>}
                      <form action={async () => { "use server"; await toggleRsvp(e.id, "GOING", "/eventos"); }}>
                        <button className={`w-full h-11 rounded-lg font-label-md ${status === "GOING" ? "bg-surface-container text-on-surface-variant" : "bg-secondary text-on-secondary"}`}>
                          {status === "GOING" ? "Cancelar asistencia" : "Confirmar inscripción"}
                        </button>
                      </form>
                    </div>
                  </article>
                );
              }
              return (
                <div key={e.id} className="bg-surface-card rounded-xl p-space-md card-elevated flex gap-3.5">
                  <div className="shrink-0 w-14 h-14 rounded-lg bg-surface-container-high text-on-surface flex flex-col items-center justify-center">
                    <span className="font-label-sm text-label-sm uppercase font-bold text-secondary">{month}</span>
                    <span className="font-headline-sm text-headline-sm leading-none">{day}</span>
                  </div>
                  <div className="min-w-0 flex-1 space-y-1.5">
                    <div className="flex items-center gap-1.5 text-body-sm text-body-sm text-on-surface-variant flex-wrap"><span className="font-medium text-secondary">{e.category?.name ?? "Evento"}</span><span>·</span><span>{e.location}</span></div>
                    <p className="font-headline-sm text-headline-sm text-on-surface leading-snug">{e.title}</p>
                    {e.description && <p className="text-body-sm text-body-sm text-on-surface-variant leading-relaxed line-clamp-2">{e.description}</p>}
                    <div className="flex items-center gap-2 pt-1">
                      {e.rsvps.length > 0 && <div className="flex -space-x-2">{e.rsvps.slice(0, 3).map((r) => <Avatar key={r.userId} name={r.user.name} size={22} className="ring-2 ring-surface-container-lowest" />)}</div>}
                      <p className="text-body-sm text-body-sm text-on-surface-variant">{e.rsvps.length > 0 ? `+${e.rsvps.length} asistirán` : "Sé el primero en asistir"}{spotsLeft !== null && ` · ${spotsLeft} lugares`}{e.ceuCredits ? ` · ${e.ceuCredits} CCEUs` : ""}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-1.5">
                      <form action={async () => { "use server"; await toggleRsvp(e.id, "GOING", "/eventos"); }} className="flex-1">
                        <button className={`w-full h-10 rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5 ${status === "GOING" ? "bg-surface-container text-on-surface-variant" : "bg-primary-container text-on-primary"}`}>
                          {status === "GOING" && <span className="material-symbols-outlined text-[16px]">check_circle</span>}
                          {status === "GOING" ? "Cancelar asistencia" : "Asistiré"}
                        </button>
                      </form>
                      <form action={async () => { "use server"; await toggleRsvp(e.id, "INTERESTED", "/eventos"); }}>
                        <button aria-label="Guardar evento" className={`w-10 h-10 rounded-lg border border-border-subtle flex items-center justify-center ${status === "INTERESTED" ? "text-secondary" : "text-on-surface-variant"}`}><span className="material-symbols-outlined text-[18px]">{status === "INTERESTED" ? "bookmark" : "bookmark_border"}</span></button>
                      </form>
                      <a href={`/api/eventos/${e.id}/ics`} aria-label="Añadir al calendario" className="w-10 h-10 rounded-lg border border-border-subtle flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined text-[18px]">download</span></a>
                    </div>
                  </div>
                </div>
              );
            })}
            {events.length === 0 && <EmptyState>No hay eventos en esta vista.</EmptyState>}
          </div>

          <div className="bg-primary-container rounded-xl p-space-md text-inverse-on-surface space-y-2">
            <p className="font-label-lg text-label-lg">¿Deseas postular tu conferencia?</p>
            <p className="text-body-sm text-body-sm text-on-primary-container">Los miembros Fellows y Master Coaches pueden avalar y hospedar eventos oficiales con créditos de la Federación.</p>
            <Link href="/eventos/proponer" className="inline-block px-4 h-10 rounded-lg bg-secondary text-on-secondary text-label-md font-label-md flex items-center w-fit">Iniciar propuesta de evento</Link>
          </div>
        </div>
      </main>
    </>
  );
}
