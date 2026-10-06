import Link from "next/link";
import { notFound } from "next/navigation";
import { requireUser } from "@/lib/session";
import { getQuestion } from "@/lib/data";
import { ASSISTANT_EMAIL } from "@/lib/openai";
import DetailHeader from "@/components/DetailHeader";
import { timeAgo } from "@/lib/format";

export default async function PreguntaDetalle({ params }: { params: Promise<{ id: string }> }) {
  await requireUser();
  const { id } = await params;
  const question = await getQuestion(id);
  if (!question) notFound();

  return (
    <>
      <DetailHeader title="Tu pregunta" />
      <main className="flex-1 w-full bg-surface pt-16 pb-28 px-margin py-5 space-y-4">
        <article className="bg-surface-card rounded-2xl p-5 card-elevated space-y-2">
          <p className="font-label-sm text-label-sm text-on-surface-variant">{question.author.name} · {timeAgo(question.createdAt)}</p>
          <p className="font-body-lg text-on-surface leading-relaxed">{question.body}</p>
          {question.topics.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {question.topics.map((t) => (
                <span key={t.topicId} className="px-2.5 py-1 rounded-full bg-surface-container text-label-sm text-on-surface-variant">{t.topic.name}</span>
              ))}
            </div>
          )}
        </article>

        {question.replies.map((r) => {
          const assistant = r.author.email === ASSISTANT_EMAIL;
          return (
            <article key={r.id} className={`rounded-2xl p-5 space-y-2 ${assistant ? "bg-primary-container text-on-primary" : "bg-surface-card card-elevated"}`}>
              <p className={`font-label-sm text-label-sm ${assistant ? "text-inverse-primary" : "text-on-surface-variant"}`}>
                {assistant ? "Asistente ICSF" : r.author.name} · {timeAgo(r.createdAt)}
              </p>
              <p className="text-body-md leading-relaxed">{r.body}</p>
            </article>
          );
        })}

        {question.replies.length === 0 && (
          <p className="text-body-sm text-on-surface-variant">La pregunta ya está en la comunidad. Aún no hay respuesta del asistente.</p>
        )}

        <Link href="/comunidad" className="h-12 w-full rounded-xl bg-surface-container text-on-surface font-label-md flex items-center justify-center">Volver a comunidad</Link>
      </main>
    </>
  );
}
