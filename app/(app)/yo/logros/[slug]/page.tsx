import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getAchievementFamily } from "@/lib/data";
import { submitTravelLog } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import SectionLabel from "@/components/SectionLabel";
import ProgressBar from "@/components/ProgressBar";
import Pill from "@/components/Pill";
import { pct, longDate } from "@/lib/format";

export default async function FamiliaLogro({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requireUser();
  const { family, activityTypes, travelLogs } = await getAchievementFamily(slug, user.id);
  const unlocked = family.achievements.filter((a) => a.unlocks.length);
  const locked = family.achievements.filter((a) => !a.unlocks.length);
  const nextGoal = locked[0];
  const verifiedCount = travelLogs.filter((t) => t.status === "VERIFIED").length;
  const remaining = nextGoal ? Math.max(1, nextGoal.goal - verifiedCount) : 0;
  const percent = pct(unlocked.length, family.achievements.length);
  const isExplorador = slug === "explorador";
  const path = `/yo/logros/${slug}`;

  return (
    <>
      <DetailHeader title="Detalle de familia" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-6">
        <section className="space-y-2">
          <p className="text-label-sm text-label-sm uppercase tracking-wider text-secondary">Ruta Oficial ICSF</p>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{family.name}</h1>
          <p className="text-body-md text-body-md text-on-surface-variant">{family.description}</p>
          <div className="flex items-center justify-between pt-1"><p className="font-label-lg text-label-lg text-on-surface">Progreso de la familia</p><p className="font-label-lg text-label-lg text-secondary">{unlocked.length} de {family.achievements.length} hitos ({percent}%)</p></div>
          <ProgressBar percent={percent} height="h-2" />
        </section>

        {nextGoal && (
          <section className="bg-surface-container-lowest rounded-xl p-space-md border border-secondary/30 space-y-2">
            <p className="text-label-sm text-label-sm uppercase tracking-wider text-ambassador-gold">Próximo hito en camino · Nivel Activo</p>
            <p className="font-headline-sm text-headline-sm text-on-surface">{nextGoal.name}</p>
            <p className="text-body-sm text-body-sm text-on-surface-variant leading-relaxed">Te {remaining === 1 ? "falta 1 registro verificado más" : `faltan ${remaining} registros verificados más`} de actividad profesional para certificar este hito de la federación.</p>
          </section>
        )}

        <section className="space-y-2">
          <SectionLabel>Logros Obtenidos · {unlocked.length} validados</SectionLabel>
          {unlocked.map((a) => (
            <Link key={a.id} href={`/yo/logros/desbloqueado/${a.unlocks[0].achievementId}`} className="flex items-start gap-3 bg-surface-container-lowest rounded-xl p-3.5 border border-border-subtle">
              <span className="material-symbols-outlined text-[22px] text-secondary shrink-0 mt-0.5">military_tech</span>
              <div className="min-w-0"><p className="font-label-lg text-label-lg text-on-surface">{a.name}</p>{a.description && <p className="text-body-sm text-body-sm text-on-surface-variant">{a.description}</p>}<p className="text-label-sm text-label-sm text-outline mt-0.5">Certificado {longDate(a.unlocks[0].unlockedAt)}</p></div>
            </Link>
          ))}
        </section>

        {locked.length > 0 && (
          <section className="space-y-2">
            <SectionLabel>Logros por descubrir</SectionLabel>
            {locked.map((a) => (
              <div key={a.id} className="flex items-start gap-3 bg-surface-container-low rounded-xl p-3.5 opacity-80">
                <span className="material-symbols-outlined text-[22px] text-outline shrink-0 mt-0.5">lock</span>
                <div className="min-w-0"><p className="font-label-lg text-label-lg text-on-surface">{a.name}</p>{a.description && <p className="text-body-sm text-body-sm text-on-surface-variant">{a.description}</p>}</div>
              </div>
            ))}
          </section>
        )}

        {isExplorador && (
          <section className="space-y-3 border-t border-border-subtle pt-5">
            <h2 className="font-headline-sm text-headline-sm text-on-surface">Nuevo Registro de Viaje</h2>
            <p className="text-body-sm text-body-sm text-on-surface-variant">Adjunta los datos de tu participación para sumar a tu próximo hito.</p>
            <form action={async (fd: FormData) => { "use server"; await submitTravelLog(fd, path); }} className="space-y-3">
              <div className="grid grid-cols-2 gap-2.5">
                <input name="city" required placeholder="Ciudad (ej. Lima)" className="h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
                <input name="country" required placeholder="País" className="h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
              </div>
              <select name="activityTypeId" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md">
                {activityTypes.map((t) => <option key={t.id} value={t.id}>{t.name}</option>)}
              </select>
              <input name="happenedAt" type="date" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
              <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg">Enviar a Verificación</button>
            </form>
            {travelLogs.length > 0 && (
              <div className="space-y-1.5 pt-2">
                {travelLogs.map((t) => (
                  <div key={t.id} className="flex items-center justify-between text-body-sm text-body-sm bg-surface-container-low rounded-lg px-3 py-2">
                    <span className="text-on-surface">{t.city}, {t.country} · {t.activityType?.name}</span>
                    <Pill tone={t.status === "VERIFIED" ? "secondary" : t.status === "REJECTED" ? "error" : "amber"}>{t.status === "VERIFIED" ? "Verificado" : t.status === "REJECTED" ? "Rechazado" : "En revisión"}</Pill>
                  </div>
                ))}
              </div>
            )}
          </section>
        )}
        <p className="text-center text-body-sm text-body-sm text-outline">Validación institucional ICSF · Todas las constancias son refrendadas por el comité de certificación global.</p>
      </main>
    </>
  );
}
