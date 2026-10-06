import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getHomeFeed } from "@/lib/data";
import { celebrate, toggleRsvp } from "@/lib/actions";
import RootHeader from "@/components/RootHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import FeedCard from "@/components/FeedCard";
import ProgressBar from "@/components/ProgressBar";
import { timeAgo, dayMonth, clockTime } from "@/lib/format";

export default async function Inicio({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const user = await requireUser();
  const { error } = await searchParams;
  const {
    me, birthdayToday, newMember, publication, threads, event, myRsvp, suggestion,
    academy, agenda, memberCount, credential, unlockCount, goingCount,
  } = await getHomeFeed(user.id);
  const first = (user.name ?? "").split(" ")[0] || "colega";
  const hour = new Date().getHours();
  const greeting = hour < 12 ? "Buenos días" : hour < 19 ? "Buenas tardes" : "Buenas noches";
  const hoyCards = [birthdayToday, newMember, publication].filter(Boolean);
  const { enrollment, progressPct, nextModule } = academy;
  const liveEvent = event;

  return (
    <>
      <RootHeader userId={user.id} label="Inicio" />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full pb-6">
          {error === "forbidden" && <p role="alert" className="mx-margin mt-3 rounded-lg bg-error-container text-on-error-container text-body-sm p-3">No tienes permiso para esa acción.</p>}

          <section className="px-margin pt-space-md pb-space-xs flex flex-col gap-space-sm">
            <div className="flex items-center justify-between">
              <div className="flex flex-col min-w-0">
                <span className="text-on-surface-variant font-label-md text-label-md uppercase tracking-wider">Membresía Oficial</span>
                <h1 className="text-on-surface font-headline-lg text-headline-lg tracking-tight font-bold truncate">{greeting}, {first}</h1>
              </div>
              <div className="shrink-0 w-11 h-11 rounded-full bg-honor-amber-soft flex items-center justify-center shadow-sm">
                <span className="material-symbols-outlined filled text-ambassador-gold text-[22px]">verified</span>
              </div>
            </div>
            <div className="flex items-center gap-space-xs flex-wrap">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-honor-amber-soft text-on-tertiary-container font-label-sm text-label-sm shadow-sm">
                <span className="material-symbols-outlined filled text-[15px] text-ambassador-gold">military_tech</span>
                {me.title ?? me.tier?.name ?? "Miembro ICSF"} • Miembro Acreditado
              </span>
              {credential && (
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-surface-container text-on-surface-variant font-label-sm text-label-sm">
                  <span className="material-symbols-outlined text-[13px]">fingerprint</span>
                  {credential.number}
                </span>
              )}
            </div>
          </section>

          <section className="px-margin py-space-sm">
            <div className="grid grid-cols-3 gap-2.5">
              <div className="bg-surface-card rounded-xl p-3 card-elevated flex flex-col items-start justify-between min-h-[92px]">
                <div className="w-7 h-7 rounded-lg bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[16px]">mic</span>
                </div>
                <div>
                  <span className="text-on-surface font-headline-md text-headline-md font-bold block leading-none">{goingCount}</span>
                  <span className="text-text-muted font-label-sm text-label-sm mt-1 block">Sesiones</span>
                </div>
              </div>
              <div className="bg-surface-card rounded-xl p-3 card-elevated flex flex-col items-start justify-between min-h-[92px]">
                <div className="w-7 h-7 rounded-lg bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-stage-electric-blue text-[16px]">public</span>
                </div>
                <div>
                  <span className="text-on-surface font-headline-md text-headline-md font-bold block leading-none">{memberCount}</span>
                  <span className="text-text-muted font-label-sm text-label-sm mt-1 block">Red activa</span>
                </div>
              </div>
              <div className="bg-surface-card rounded-xl p-3 card-elevated flex flex-col items-start justify-between min-h-[92px]">
                <div className="w-7 h-7 rounded-lg bg-honor-amber-soft flex items-center justify-center">
                  <span className="material-symbols-outlined text-ambassador-gold text-[16px]">stars</span>
                </div>
                <div>
                  <span className="text-on-surface font-headline-md text-headline-md font-bold block leading-none">{unlockCount}</span>
                  <span className="text-text-muted font-label-sm text-label-sm mt-1 block">Score ICSF</span>
                </div>
              </div>
            </div>
          </section>

          {liveEvent && (
            <section className="px-margin py-space-xs">
              <div className="relative overflow-hidden bg-primary-container text-on-primary rounded-xl p-space-md shadow-[0_12px_28px_-6px_rgba(0,102,255,0.22)]">
                <div className="absolute -top-12 -right-12 w-40 h-40 rounded-full bg-stage-electric-blue/25 blur-2xl pointer-events-none" />
                <div className="flex items-center justify-between mb-space-sm relative z-10">
                  <div className="flex items-center gap-2">
                    <span className="flex h-2.5 w-2.5 relative">
                      <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-error opacity-75" />
                      <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-error" />
                    </span>
                    <span className="bg-error/20 text-error-container font-label-sm text-label-sm px-2 py-0.5 rounded-full uppercase tracking-wider font-bold">Próximo</span>
                  </div>
                  <span className="text-inverse-primary font-label-sm text-label-sm flex items-center gap-1">
                    <span className="material-symbols-outlined text-[14px]">group</span> {liveEvent.rsvps.length} confirmados
                  </span>
                </div>
                <div className="relative z-10 flex flex-col gap-1">
                  <h2 className="font-headline-sm text-headline-sm text-on-primary font-bold">{liveEvent.title}</h2>
                  <p className="font-body-sm text-body-sm text-inverse-primary line-clamp-2">{liveEvent.description ?? liveEvent.location}</p>
                </div>
                <div className="mt-space-sm pt-space-xs flex items-center justify-between relative z-10 gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    {liveEvent.rsvps[0] && <Avatar name={liveEvent.rsvps[0].user.name} size={32} />}
                    <div className="flex flex-col min-w-0">
                      <span className="text-on-primary font-label-md text-label-md leading-tight truncate">{dayMonth(liveEvent.startsAt).day} {dayMonth(liveEvent.startsAt).month} · {clockTime(liveEvent.startsAt)}</span>
                      <span className="text-inverse-primary font-label-sm text-label-sm leading-tight truncate">{liveEvent.category?.name ?? "Agenda ICSF"}</span>
                    </div>
                  </div>
                  <form action={async () => { "use server"; await toggleRsvp(liveEvent.id, "INTERESTED", "/"); }}>
                    <button className="bg-stage-electric-blue hover:bg-secondary-container active:scale-95 transition-all text-on-secondary px-4 py-2 rounded-lg font-label-md text-label-md flex items-center gap-1.5 shadow-md">
                      <span className="material-symbols-outlined text-[18px]">{myRsvp ? "check_circle" : "play_circle"}</span>
                      <span>{myRsvp ? "Anotado" : "Ingresar"}</span>
                    </button>
                  </form>
                </div>
              </div>
            </section>
          )}

          <section className="px-margin pt-space-sm pb-space-xs">
            <div className="grid grid-cols-3 gap-2.5">
              <Link href="/yo/credencial" className="bg-surface-card hover:bg-surface-container-low transition-colors rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-[0_2px_6px_rgba(11,25,44,0.04)] active:scale-95">
                <div className="w-10 h-10 rounded-full bg-honor-amber-soft flex items-center justify-center">
                  <span className="material-symbols-outlined text-ambassador-gold text-[22px]">badge</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">Credencial Verificada</span>
              </Link>
              <Link href="/academy" className="bg-surface-card hover:bg-surface-container-low transition-colors rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-[0_2px_6px_rgba(11,25,44,0.04)] active:scale-95">
                <div className="w-10 h-10 rounded-full bg-surface-container-high flex items-center justify-center">
                  <span className="material-symbols-outlined text-secondary text-[22px]">school</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">ICSF Academy</span>
              </Link>
              <Link href="/eventos" className="bg-surface-card hover:bg-surface-container-low transition-colors rounded-xl p-3 flex flex-col items-center text-center gap-2 shadow-[0_2px_6px_rgba(11,25,44,0.04)] active:scale-95">
                <div className="w-10 h-10 rounded-full bg-surface-container-highest flex items-center justify-center">
                  <span className="material-symbols-outlined text-stage-electric-blue text-[22px]">event_available</span>
                </div>
                <span className="font-label-sm text-label-sm text-on-surface font-semibold leading-tight">Próxima Sesión</span>
              </Link>
            </div>
          </section>

          {enrollment && (
            <section className="px-margin py-space-sm">
              <div className="bg-surface-card rounded-xl p-space-md card-elevated flex flex-col gap-space-sm">
                <div className="flex items-center justify-between gap-3">
                  <div className="flex items-center gap-2 min-w-0">
                    <div className="w-8 h-8 rounded-lg bg-surface-container-high flex items-center justify-center shrink-0">
                      <span className="material-symbols-outlined text-secondary text-[18px]">workspace_premium</span>
                    </div>
                    <div className="min-w-0">
                      <span className="font-label-sm text-label-sm text-text-muted block leading-none">Ruta de Especialización</span>
                      <span className="font-headline-sm text-headline-sm text-on-surface font-bold leading-tight line-clamp-2">{enrollment.program.title}</span>
                    </div>
                  </div>
                  <span className="font-label-md text-label-md text-stage-electric-blue font-bold shrink-0">{progressPct}%</span>
                </div>
                <ProgressBar percent={progressPct} height="h-2" />
                <div className="flex items-center justify-between pt-1">
                  <div className="flex items-center gap-1.5 text-on-surface-variant font-label-sm text-label-sm min-w-0">
                    <span className="material-symbols-outlined text-[16px] text-text-muted">task_alt</span>
                    <span className="truncate">{nextModule ? `Próximo: ${nextModule.title}` : "Programa en curso"}</span>
                  </div>
                  <Link href="/academy/ruta" className="text-stage-electric-blue font-label-sm text-label-sm font-bold flex items-center gap-0.5 shrink-0">
                    Continuar<span className="material-symbols-outlined text-[16px]">chevron_right</span>
                  </Link>
                </div>
              </div>
            </section>
          )}

          {hoyCards.length > 0 && (
            <section className="space-y-space-sm py-space-sm">
              <div className="px-margin flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Hoy en ICSF</h2>
                <span className="text-label-sm font-label-sm text-outline">{hoyCards.length} novedades</span>
              </div>
              <div className="flex gap-3 overflow-x-auto px-margin scrollbar-none snap-x snap-mandatory py-1">
                {birthdayToday && (
                  <FeedCard name={birthdayToday.user.name} badge="🎂" title={birthdayToday.user.name} subtitle="Cumple años hoy"
                    action={{ label: "🎉 Felicitar", formAction: async () => { "use server"; await celebrate(birthdayToday.userId, "/"); } }} />
                )}
                {newMember && (
                  <FeedCard name={newMember.name} badge="👋" title={newMember.name} subtitle={`Se unió ${newMember.profile?.city ? `desde ${newMember.profile.city}` : "a la federación"}`}
                    action={{ label: "Dar bienvenida", href: newMember.profile ? `/miembros/${newMember.profile.slug}` : "/descubrir" }} />
                )}
                {publication && (
                  <FeedCard name={publication.author.name} title={publication.author.name} subtitle={`Publicó "${publication.title}"`}
                    action={{ label: "Ver publicación", href: "/comunidad" }} />
                )}
              </div>
            </section>
          )}

          {agenda.length > 0 && (
            <section className="px-margin pt-space-xs pb-space-md flex flex-col gap-space-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Agenda &amp; Conferencias</h2>
                <Link href="/eventos" className="font-label-sm text-label-sm text-stage-electric-blue font-semibold">Ver Calendario</Link>
              </div>
              <div className="flex flex-col gap-2.5">
                {agenda.map((e, i) => {
                  const { day, month } = dayMonth(e.startsAt);
                  return (
                    <Link key={e.id} href="/eventos" className="bg-surface-card rounded-xl p-3.5 card-elevated flex items-center gap-3">
                      <div className={`w-12 h-14 rounded-lg flex flex-col items-center justify-center shrink-0 ${i === 1 ? "bg-honor-amber-soft" : "bg-surface-container-high"}`}>
                        <span className={`font-label-sm text-label-sm uppercase font-bold ${i === 1 ? "text-ambassador-gold" : "text-secondary"}`}>{month}</span>
                        <span className="font-headline-md text-headline-md font-bold text-on-surface leading-none">{day}</span>
                      </div>
                      <div className="flex flex-col min-w-0 flex-grow">
                        <span className="font-label-sm text-label-sm text-text-muted">{clockTime(e.startsAt)} · {e.category?.name ?? "Evento"}</span>
                        <h3 className="font-label-lg text-label-lg text-on-surface font-bold truncate">{e.title}</h3>
                        <span className="font-body-sm text-body-sm text-on-surface-variant truncate">{e.location}</span>
                      </div>
                      <span className="shrink-0 w-8 h-8 rounded-full bg-surface-container flex items-center justify-center text-on-surface">
                        <span className="material-symbols-outlined text-[18px]">calendar_today</span>
                      </span>
                    </Link>
                  );
                })}
              </div>
            </section>
          )}

          {threads.length > 0 && (
            <section className="px-margin space-y-space-sm pb-space-sm">
              <div className="flex items-center justify-between">
                <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Conversaciones</h2>
                <Link href="/comunidad" className="font-label-sm text-label-sm text-stage-electric-blue font-semibold">Ver foro</Link>
              </div>
              <div className="space-y-3">
                {threads.map((t) => (
                  <Link key={t.id} className="block bg-surface-card p-space-md rounded-xl card-elevated" href="/comunidad">
                    <p className="text-body-lg font-body-lg font-semibold text-on-surface leading-snug">“{t.body}”</p>
                    <div className="mt-2.5 flex items-center gap-2 text-body-sm font-body-sm text-outline">
                      <span className="inline-flex items-center gap-1 text-on-surface-variant"><span className="material-symbols-outlined text-[15px]">chat_bubble_outline</span>{t._count.replies} respuestas</span>
                      <span>•</span><span className="truncate">{timeAgo(t.createdAt)}</span>
                    </div>
                  </Link>
                ))}
              </div>
            </section>
          )}

          {suggestion && (
            <section className="px-margin space-y-space-sm pb-2">
              <h2 className="font-headline-sm text-headline-sm text-on-surface font-bold">Alguien que quizá deberías conocer</h2>
              <div className="bg-surface-card rounded-xl p-space-md card-elevated space-y-4">
                <div className="flex items-center gap-3.5">
                  <Avatar name={suggestion.user.name} size={64} />
                  <div className="min-w-0">
                    <div className="flex items-center gap-1.5 flex-wrap"><h3 className="text-headline-sm font-headline-sm font-bold text-on-surface">{suggestion.user.name}</h3><TierBadge tier={suggestion.tier} /></div>
                    <p className="text-body-sm font-body-sm text-on-surface-variant flex items-center gap-1 mt-0.5"><span className="material-symbols-outlined text-[14px]">location_on</span>{[suggestion.city, suggestion.country].filter(Boolean).join(", ")}</p>
                    <p className="text-label-md font-label-md text-on-surface mt-1">{suggestion.topics.map((t) => t.topic.name).join(" · ")}</p>
                    <p className="text-body-sm text-on-surface-variant mt-2">{(() => {
                      const shared = suggestion.topics.filter((t) => me.topics.some((m) => m.topicId === t.topicId)).map((t) => t.topic.name);
                      const bits = [
                        shared.length ? `Comparten ${shared.slice(0, 2).join(" y ")}` : null,
                        me.chapter ? `capítulo ${me.chapter.name}` : null,
                      ].filter(Boolean);
                      return bits.length ? `${bits.join(", ")}.` : "Coinciden en la red ICSF.";
                    })()}</p>
                  </div>
                </div>
                <Link href={`/miembros/${suggestion.slug}`} className="w-full h-11 rounded-lg bg-surface-container-lowest hover:bg-surface-container-low text-on-surface text-label-md font-label-md transition-all active:scale-[0.99] flex items-center justify-center card-elevated border border-border-subtle">Conocer perfil</Link>
              </div>
            </section>
          )}
        </div>
      </main>
    </>
  );
}
