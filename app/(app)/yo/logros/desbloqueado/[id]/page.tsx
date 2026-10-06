import Link from "next/link";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";
import DetailHeader from "@/components/DetailHeader";
import { longDate } from "@/lib/format";

export default async function LogroDesbloqueado({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requireUser();
  const unlock = await db.userAchievement.findUniqueOrThrow({ where: { userId_achievementId: { userId: user.id, achievementId: id } }, include: { achievement: { include: { family: true } } } });

  return (
    <>
      <DetailHeader title="Bitácora de Certificación" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-10 flex flex-col items-center text-center gap-4">
        <div className="w-24 h-24 rounded-full bg-honor-amber-soft flex items-center justify-center"><span className="material-symbols-outlined text-[48px] text-ambassador-gold">workspace_premium</span></div>
        <p className="text-label-sm text-label-sm uppercase tracking-wider text-secondary">Reconocimiento Profesional</p>
        <h1 className="font-headline-lg text-headline-lg text-on-surface">¡Logro Obtenido!</h1>
        <div><p className="font-headline-md text-headline-md text-on-surface">{unlock.achievement.name}</p><p className="text-body-sm text-body-sm text-on-surface-variant">Familia {unlock.achievement.family.name} · Nivel {unlock.achievement.tier}</p></div>
        {unlock.achievement.description && <p className="text-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">{unlock.achievement.description}</p>}
        <p className="italic text-body-md text-body-md text-on-surface max-w-xs">"Tu voz y experiencia continúan expandiendo el impacto del coaching ético en la federación."</p>
        <p className="text-label-sm text-label-sm text-outline">Certificado el {longDate(unlock.unlockedAt)}</p>
        <div className="grid grid-cols-1 gap-2.5 w-full max-w-xs pt-4">
          <Link href={`/yo/logros/${unlock.achievement.family.slug}`} className="h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center">Ver en mi trayectoria</Link>
          <button className="h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md">Compartir con colegas</button>
          <Link href="/yo" className="h-11 rounded-lg text-secondary font-label-md text-label-md flex items-center justify-center">Volver a la app</Link>
        </div>
      </main>
    </>
  );
}
