import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { getAcademyHome } from "@/lib/data";
import { enrollInProgram } from "@/lib/actions";
import { db } from "@/lib/db";
import RootHeader from "@/components/RootHeader";
import Avatar from "@/components/Avatar";
import ProgressBar from "@/components/ProgressBar";
import EmptyState from "@/components/EmptyState";

export default async function AcademyHome() {
  const user = await requirePermission("academy.access");
  const { enrollment, progressPct, nextModule, openPrograms } = await getAcademyHome(user.id);
  const instructor = await db.profile.findFirst({ where: { chapterRole: { not: null } }, include: { user: true } });

  return (
    <>
      <RootHeader userId={user.id} label="Academy" />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-10 gap-y-space-lg">
          <div className="pt-4 flex flex-col">
            <div className="flex items-center justify-between">
              <span className="font-label-sm text-label-sm text-ambassador-gold tracking-widest uppercase font-semibold">Federación Global</span>
              <span className="flex items-center gap-1 font-label-sm text-label-sm text-on-surface-variant bg-surface-container px-2.5 py-1 rounded-full">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                Campus Activo
              </span>
            </div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight mt-1 font-bold">ICSF Academy</h1>
            <p className="font-body-md text-body-md text-on-surface-variant mt-0.5">Continúa creciendo dentro de ICSF.</p>
          </div>

          {enrollment ? (
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Continuar aprendiendo</span>
                <span className="font-label-sm text-label-sm text-ambassador-gold font-semibold">1 certificación activa</span>
              </div>
              <div className="bg-surface-card rounded-xl p-space-md card-float border border-surface-variant flex flex-col space-y-space-md">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex flex-col min-w-0">
                    <div className="inline-flex items-center gap-1.5 bg-secondary/10 text-secondary px-2.5 py-0.5 rounded-full w-fit">
                      <span className="material-symbols-outlined text-[14px]">school</span>
                      <span className="font-label-sm text-label-sm font-semibold">En curso{enrollment.cohort?.name ? ` · ${enrollment.cohort.name}` : ""}</span>
                    </div>
                    <h2 className="font-headline-md text-headline-md text-on-surface mt-2 font-bold tracking-tight">{enrollment.program.title}</h2>
                    <span className="font-body-sm text-body-sm text-on-surface-variant">{enrollment.program.description}</span>
                  </div>
                  <div className="w-11 h-11 rounded-xl bg-secondary/10 flex items-center justify-center text-secondary shrink-0 border border-secondary/20">
                    <span className="material-symbols-outlined filled text-[24px]">verified</span>
                  </div>
                </div>
                <div className="bg-surface-container-low rounded-lg p-3.5 space-y-2 border border-surface-variant">
                  <div className="flex justify-between items-center">
                    <span className="font-label-sm text-label-sm uppercase tracking-wider text-secondary font-semibold">Progreso del programa</span>
                    <span className="font-label-md text-label-md font-bold text-secondary">{progressPct}% completado</span>
                  </div>
                  <ProgressBar percent={progressPct} height="h-2" trackClassName="bg-surface-container-highest" />
                  {nextModule && (
                    <div className="pt-1 flex items-center gap-2">
                      <span className="material-symbols-outlined text-secondary text-[16px]">play_circle</span>
                      <p className="font-body-sm text-body-sm text-on-surface truncate"><span className="font-semibold text-secondary">Próximo:</span> {nextModule.title}</p>
                    </div>
                  )}
                </div>
                <Link href="/academy/ruta" className="w-full h-12 bg-secondary text-on-secondary rounded-xl font-label-lg text-label-lg flex items-center justify-center gap-2 shadow-md shadow-primary/20">
                  Continuar aprendiendo<span className="material-symbols-outlined text-[18px]">arrow_forward</span>
                </Link>
              </div>
            </section>
          ) : (
            <EmptyState>Aún no tienes un programa activo.</EmptyState>
          )}

          {instructor && (
            <section>
              <div className="flex items-center justify-between mb-3 px-1">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Próxima actividad</span>
              </div>
              <div className="bg-surface-card rounded-xl p-space-md card-elevated border border-surface-variant space-y-4">
                <span className="font-label-sm text-label-sm font-semibold tracking-wider uppercase px-2.5 py-1 rounded-full bg-error-container text-on-error-container inline-flex items-center gap-1.5">
                  <span className="w-1.5 h-1.5 rounded-full bg-error animate-ping" />Sesión en Vivo
                </span>
                <div>
                  <h3 className="font-headline-sm text-headline-sm text-on-surface font-bold leading-snug">Sesión con {instructor.user.name}</h3>
                  <p className="font-body-sm text-body-sm text-on-surface-variant mt-1">{instructor.title}</p>
                </div>
                <div className="flex items-center gap-3 bg-surface-container-low p-2.5 rounded-lg border border-surface-variant">
                  <Avatar name={instructor.user.name} size={44} />
                  <div className="flex flex-col min-w-0">
                    <span className="font-label-md text-label-md text-on-surface font-semibold truncate">{instructor.user.name}</span>
                    <span className="font-body-sm text-body-sm text-ambassador-gold font-medium truncate">{instructor.chapterRole ?? "Claustro ICSF"}</span>
                  </div>
                </div>
                <Link href="/academy/ruta" className="h-11 bg-secondary text-on-secondary rounded-lg font-label-md text-label-md flex items-center justify-center gap-1.5">
                  <span className="material-symbols-outlined text-[18px]">event_available</span> Ver detalles
                </Link>
              </div>
            </section>
          )}

          {openPrograms.length > 0 && (
            <section className="space-y-3">
              <div className="flex items-center justify-between px-1">
                <span className="font-label-md text-label-md text-on-surface-variant uppercase tracking-wider">Descubrir certificaciones</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant">Convocatoria abierta</span>
              </div>
              {openPrograms.map((p) => (
                <div key={p.id} className="bg-surface-card rounded-xl p-space-md card-elevated border border-surface-container-high/60 space-y-3">
                  <div className="inline-flex items-center gap-1 bg-surface-container px-2.5 py-0.5 rounded-full font-label-sm text-label-sm text-on-surface-variant">
                    <span className="material-symbols-outlined text-[13px] text-secondary">tune</span>
                    <span>{p.weeks ? `${p.weeks} semanas` : "Programa"} · {p.modality ?? "Híbrida"}</span>
                  </div>
                  <p className="font-headline-sm text-headline-sm text-on-surface font-bold">{p.title}</p>
                  <p className="text-body-sm text-on-surface-variant leading-relaxed">{p.description}</p>
                  {p.validity && <p className="text-label-sm text-secondary uppercase tracking-wide">{p.validity}</p>}
                  <form action={async () => { "use server"; await enrollInProgram(p.id, "/academy"); }}>
                    <button className="w-full h-11 rounded-xl bg-primary-container text-on-primary font-label-md">Inscribirme</button>
                  </form>
                </div>
              ))}
            </section>
          )}
        </div>
      </main>
    </>
  );
}
