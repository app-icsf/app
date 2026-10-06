import { requireUser } from "@/lib/session";
import { getQuestionCatalog } from "@/lib/data";
import { postQuestion } from "@/lib/actions";
import { openaiConfigured } from "@/lib/openai";
import { redirect } from "next/navigation";
import DetailHeader from "@/components/DetailHeader";
import Pill from "@/components/Pill";

export const maxDuration = 60;

export default async function Preguntar({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  await requireUser();
  const { aviso } = await searchParams;
  const { topics, scopes, certifiedCount, avgMinutes } = await getQuestionCatalog();

  async function submit(formData: FormData) {
    "use server";
    const result = await postQuestion(formData, "/preguntar");
    if (result?.error) redirect(`/preguntar?aviso=${encodeURIComponent(result.error)}`);
    if (result?.id) redirect(`/preguntar/${result.id}`);
  }

  return (
    <>
      <DetailHeader title="Pregunta a la comunidad" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-5">
        <Pill tone="secondary"><span className="w-1.5 h-1.5 rounded-full bg-secondary" />Red Global Activa</Pill>
        <div>
          <h1 className="font-headline-md text-headline-md text-on-surface">Pregunta a la comunidad</h1>
          <p className="text-body-md text-body-md text-on-surface-variant mt-1">El asistente ICSF responde al momento. La comunidad sigue viendo la pregunta.</p>
        </div>

        {aviso && <p role="alert" className="rounded-lg bg-honor-amber-soft text-on-tertiary-container text-body-sm p-3">{aviso}</p>}

        <form action={submit} className="space-y-4">
          <textarea name="body" required maxLength={280} rows={4} placeholder="¿Qué quieres preguntarle a ICSF? (ej. recomendaciones técnicas, oratoria, dinámicas de equipo...)"
            className="w-full rounded-xl bg-surface-container-lowest border border-border-subtle p-4 text-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container" />

          <div className="space-y-1.5">
            <p className="font-label-md text-label-md text-on-surface-variant">Añadir tema sugerido:</p>
            <div className="flex flex-wrap gap-2">{topics.map((t) => (
              <label key={t.id} className="has-[:checked]:bg-primary-container has-[:checked]:text-on-primary px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md cursor-pointer">
                <input type="checkbox" name="topicId" value={t.id} className="sr-only" />{t.name}
              </label>
            ))}</div>
          </div>

          <div className="space-y-1.5">
            <p className="font-label-md text-label-md text-on-surface-variant">Alcance territorial (opcional)</p>
            <select name="scopeId" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md">
              <option value="">Sin especificar</option>
              {scopes.map((s) => <option key={s.id} value={s.id}>{s.name}</option>)}
            </select>
          </div>

          <div className="rounded-xl bg-surface-container-low p-4 flex items-center justify-between text-body-sm text-body-sm text-on-surface-variant">
            <span>{certifiedCount} ponentes certificados conectados</span><span>Respuesta media estimada: {avgMinutes} min</span>
          </div>

          <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg">Publicar pregunta</button>
          <p className="text-center text-body-sm text-body-sm text-outline">
            {openaiConfigured() ? "Respuesta inmediata del asistente, revisada por la comunidad." : "Configura OPENAI_API_KEY para la respuesta inmediata."} Visible según el código ético ICSF.
          </p>
        </form>
      </main>
    </>
  );
}
