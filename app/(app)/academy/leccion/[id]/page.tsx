import { requirePermission } from "@/lib/session";
import { getLesson } from "@/lib/data";
import { markLessonComplete } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import SectionLabel from "@/components/SectionLabel";
import { fileSize } from "@/lib/format";

export default async function Leccion({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const user = await requirePermission("academy.access");
  const { lesson, instructor, myProgress } = await getLesson(id, user.id);
  const path = `/academy/leccion/${id}`;

  return (
    <>
      <DetailHeader title="Lección de Masterclass" right={<span className="material-symbols-outlined text-inverse-primary text-[20px] pr-1">more_vert</span>} />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe">
        <div className="relative w-full aspect-video bg-primary-container flex items-center justify-center overflow-hidden">
          {lesson.videoUrl ? (
            <video className="w-full h-full object-cover" controls poster="" src={lesson.videoUrl} />
          ) : (
            <>
              <span className="absolute top-3 left-3 px-2 py-0.5 rounded bg-black/40 text-white text-label-sm text-label-sm">MASTERCLASS</span>
              <span className="material-symbols-outlined text-[48px] text-white/80">play_circle</span>
              <span className="absolute bottom-3 right-3 px-2 py-0.5 rounded bg-black/40 text-white text-label-sm text-label-sm">{lesson.minutes}:00 min</span>
            </>
          )}
        </div>

        <div className="px-margin py-5 space-y-5">
          <div>
            <p className="text-label-sm text-label-sm uppercase tracking-wider text-secondary">Módulo {lesson.module.position} · {lesson.module.title.split(" ")[0]}</p>
            <h1 className="font-headline-md text-headline-md text-on-surface mt-1">{lesson.title}</h1>
            <p className="text-body-sm text-body-sm text-on-surface-variant mt-0.5">{lesson.minutes} min de video + lectura</p>
          </div>

          {instructor && (
            <div className="flex items-center gap-3"><Avatar name={instructor.user.name} size={44} /><div><p className="font-label-lg text-label-lg text-on-surface">{instructor.user.name}</p><div className="flex items-center gap-1.5"><TierBadge tier={instructor.tier} /><span className="text-body-sm text-body-sm text-on-surface-variant">{instructor.title}</span></div></div></div>
          )}

          {lesson.summary && (
            <section className="space-y-2">
              <SectionLabel>Síntesis Pedagógica</SectionLabel>
              <p className="text-body-md text-body-md text-on-surface leading-relaxed">{lesson.summary}</p>
            </section>
          )}

          {lesson.downloads.length > 0 && (
            <section className="space-y-2">
              <SectionLabel>Material de Cátedra · {lesson.downloads.length} descargables</SectionLabel>
              {lesson.downloads.map((d) => (
                <div key={d.id} className="flex items-center gap-3 bg-surface-container-lowest rounded-xl p-3.5 border border-border-subtle">
                  <span className="material-symbols-outlined text-[24px] text-secondary">description</span>
                  <div className="min-w-0 flex-1"><p className="font-label-md text-label-md text-on-surface truncate">{d.title}</p><p className="text-body-sm text-body-sm text-on-surface-variant">{d.kind} {d.sizeKb ? `(${fileSize(d.sizeKb * 1024)})` : ""}</p></div>
                  {d.url ? (
                    <a href={d.url} className="material-symbols-outlined text-[20px] text-outline" aria-label="Descargar">arrow_downward</a>
                  ) : (
                    <span className="material-symbols-outlined text-[20px] text-outline">arrow_downward</span>
                  )}
                </div>
              ))}
            </section>
          )}

          <form action={async () => { "use server"; await markLessonComplete(id, path); }}>
            <button className={`w-full h-12 rounded-lg font-label-lg text-label-lg flex items-center justify-center gap-2 ${myProgress?.completedAt ? "bg-surface-container text-on-surface" : "bg-secondary text-on-secondary"}`}>
              <span className="material-symbols-outlined text-[20px]">check_circle</span>{myProgress?.completedAt ? "Completada" : "Marcar como completada y siguiente"}
            </button>
          </form>

          <section className="space-y-2">
            <SectionLabel>Debate de la cohorte ({lesson.discussions.reduce((a, d) => a + d._count.replies, 0) + lesson.discussions.length} aportes)</SectionLabel>
            {lesson.discussions.map((d) => (
              <div key={d.id} className="flex items-start gap-2.5">
                <Avatar name={d.author.name} size={32} />
                <div className="min-w-0 flex-1 bg-surface-container-lowest rounded-xl p-3 border border-border-subtle">
                  <p className="font-label-md text-label-md text-on-surface">{d.author.name}</p>
                  <p className="text-body-sm text-body-sm text-on-surface-variant mt-0.5">{d.body}</p>
                  {d._count.replies > 0 && <p className="text-label-sm text-label-sm text-secondary mt-1.5">{d._count.replies} respuestas</p>}
                </div>
              </div>
            ))}
          </section>
        </div>
      </main>
    </>
  );
}
