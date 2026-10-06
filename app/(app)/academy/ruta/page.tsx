import Link from "next/link";
import { redirect } from "next/navigation";
import { requirePermission } from "@/lib/session";
import { getProgramRoute } from "@/lib/data";
import DetailHeader from "@/components/DetailHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import SectionLabel from "@/components/SectionLabel";
import { pct, longDate } from "@/lib/format";

const STATUS_LABEL: Record<string, string> = { DONE: "Finalizado", IN_PROGRESS: "En Curso", LOCKED: "Próximo" };

export default async function RutaCertificacion() {
  const user = await requirePermission("academy.access");
  const enrollment = await getProgramRoute(user.id);
  if (!enrollment) redirect("/academy");
  const modules = enrollment.program.modules;
  const progressByModule = new Map(enrollment.moduleProgress.map((p) => [p.moduleId, p]));
  const done = enrollment.moduleProgress.filter((p) => p.status === "DONE").length;
  const percent = pct(done, modules.length);
  const pendingSubmission = enrollment.submissions.find((s) => s.status === "PENDING");

  return (
    <>
      <DetailHeader title="Programa Académico" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-6">
        <section className="space-y-2">
          <div className="flex items-center gap-2 text-label-sm text-label-sm uppercase tracking-wider text-secondary"><span>Acreditación Oficial</span><span>·</span><span>{enrollment.cohort?.name}</span></div>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">{enrollment.program.title}</h1>
          <p className="text-body-md text-body-md text-on-surface-variant">{enrollment.program.description}</p>
          <div className="flex items-center gap-3 pt-1">
            <div className="relative w-14 h-14 shrink-0"><svg viewBox="0 0 36 36" className="w-14 h-14 -rotate-90"><circle cx="18" cy="18" r="16" fill="none" stroke="#e2e8f0" strokeWidth="3" /><circle cx="18" cy="18" r="16" fill="none" stroke="#0066ff" strokeWidth="3" strokeDasharray={`${percent} 100`} strokeLinecap="round" /></svg><span className="absolute inset-0 flex items-center justify-center font-label-sm text-label-sm text-on-surface">{percent}%</span></div>
            <div><p className="font-label-lg text-label-lg text-on-surface">{done} de {modules.length} módulos completados</p>{pendingSubmission && <p className="text-body-sm text-body-sm text-on-surface-variant">1 evidencia audiovisual pendiente de rúbrica.</p>}</div>
          </div>
        </section>

        <section className="space-y-3">
          <SectionLabel>Trayectoria Pedagógica</SectionLabel>
          {modules.map((m, i) => {
            const progress = progressByModule.get(m.id);
            const status = progress?.status ?? "LOCKED";
            const firstLesson = m.lessons[0];
            return (
              <div key={m.id} className={`rounded-xl p-space-md border ${status === "IN_PROGRESS" ? "bg-surface-container-lowest border-secondary" : "bg-surface-container-lowest border-border-subtle"}`}>
                <div className="flex items-center justify-between">
                  <span className={`text-label-sm text-label-sm font-semibold uppercase tracking-wide ${status === "DONE" ? "text-secondary" : status === "IN_PROGRESS" ? "text-ambassador-gold" : "text-outline"}`}>{STATUS_LABEL[status]}</span>
                  <span className="text-label-sm text-label-sm text-outline">Módulo {String(i + 1).padStart(2, "0")}</span>
                </div>
                <p className="font-headline-sm text-headline-sm text-on-surface mt-1">{m.title}</p>
                {m.summary && <p className="text-body-sm text-body-sm text-on-surface-variant mt-0.5">{m.summary}</p>}
                {status === "IN_PROGRESS" && firstLesson && (
                  <Link href={`/academy/leccion/${firstLesson.id}`} className="inline-flex items-center gap-1 mt-3 px-4 h-9 rounded-lg bg-secondary text-on-secondary text-label-md font-label-md">Continuar <span className="material-symbols-outlined text-[16px]">chevron_right</span></Link>
                )}
                {status === "DONE" && <p className="text-label-sm text-label-sm text-secondary mt-2 flex items-center gap-1"><span className="material-symbols-outlined text-[14px]">check_circle</span>Certificado preliminar acreditado</p>}
              </div>
            );
          })}
          <div className="rounded-xl p-space-md border border-border-subtle bg-surface-container-low opacity-80">
            <span className="text-label-sm text-label-sm font-semibold uppercase tracking-wide text-outline">Módulo Final</span>
            <p className="font-headline-sm text-headline-sm text-on-surface mt-1">Evaluación y Dictamen del Comité Académico</p>
            <p className="text-body-sm text-body-sm text-on-surface-variant mt-0.5">Deliberación del jurado y emisión de credencial oficial ICSF.</p>
          </div>
        </section>

        {enrollment.tutor && (
          <section className="bg-surface-container-lowest rounded-xl p-space-md border border-border-subtle space-y-2">
            <SectionLabel><span className="text-secondary">Acompañamiento Académico · Activo</span></SectionLabel>
            <div className="flex items-center gap-3"><Avatar name={enrollment.tutor.name} size={44} /><div><p className="font-label-lg text-label-lg text-on-surface">{enrollment.tutor.name}</p><div className="flex items-center gap-1.5"><TierBadge tier={enrollment.tutor.profile?.tier} /><span className="text-body-sm text-body-sm text-on-surface-variant">Tutor Designado</span></div></div></div>
            <p className="text-body-sm text-body-sm text-on-surface-variant leading-relaxed">Tu tutor revisa activamente tus evidencias y borradores del módulo en curso.</p>
            <Link href={`/mensajes/nuevo?a=${enrollment.tutorId}`} className="block text-center h-10 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center">Consultar dudas con tutor</Link>
          </section>
        )}
        <p className="text-center text-body-sm text-body-sm text-outline">ID: #{enrollment.id.slice(-8).toUpperCase()}</p>
      </main>
    </>
  );
}
