import { db } from "./db";

export const ASSISTANT_EMAIL = "asistente@icsf.local";

type ChatResult = Record<string, unknown> | null;

function model() {
  return process.env.OPENAI_MODEL?.trim() || "gpt-4o-mini";
}

export function openaiConfigured() {
  return !!process.env.OPENAI_API_KEY?.trim();
}

async function chatJson(system: string, user: string): Promise<ChatResult> {
  const key = process.env.OPENAI_API_KEY?.trim();
  if (!key) return null;
  try {
    const res = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: { Authorization: `Bearer ${key}`, "Content-Type": "application/json" },
      body: JSON.stringify({
        model: model(),
        temperature: 0.3,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: system },
          { role: "user", content: user },
        ],
      }),
      signal: AbortSignal.timeout(25000),
    });
    if (!res.ok) return null;
    const data = (await res.json()) as { choices?: { message?: { content?: string } }[] };
    const text = data.choices?.[0]?.message?.content;
    if (!text) return null;
    return JSON.parse(text) as Record<string, unknown>;
  } catch {
    return null;
  }
}

function asDecision(value: unknown): "allow" | "review" | "clarify" {
  const v = String(value ?? "").toLowerCase();
  if (v === "clarify" || v === "block") return "clarify";
  if (v === "review" || v === "revision") return "review";
  return "allow";
}

export const REVIEW_NOTICE =
  "Tu texto es válido, pero toca un tema delicado. Quedó con un administrador para revisión y todavía no es visible para la comunidad.";

/** allow = se publica. review = tema delicado legítimo, lo ve un administrador. clarify = acoso, odio, spam o estafa. */
export async function moderateText(text: string): Promise<{ decision: "allow" | "review" | "clarify"; notice?: string }> {
  const parsed = await chatJson(
    `Eres el prefiltro del código ético de ICSF, red de coaches y speakers. Responde solo JSON {"decision":"allow"|"review"|"clarify","notice":""}.
allow: consulta o publicación profesional normal.
review: el texto es una pregunta o aviso válido, pero trata un tema delicado (violencia, maltrato, abuso, duelo, enfermedad, muerte, temas legales) en contexto profesional, educativo o de conferencia. No lo rechaces. Ejemplo: "conferencia de maltrato" y "sobre asesinatos y maltrato animal, ¿alguien tiene material?" es review.
clarify: solo acoso a una persona, odio, spam, estafa, pornografía o datos personales de terceros. notice: una frase en español pidiendo reformular, solo si clarify.
En review, notice puede ir vacío.`,
    text.slice(0, 2000),
  );
  if (!parsed) return { decision: "allow" };
  const decision = asDecision(parsed.decision);
  if (decision === "allow") return { decision: "allow" };
  const notice = String(parsed.notice ?? "").trim().slice(0, 240);
  if (decision === "review") return { decision: "review", notice: REVIEW_NOTICE };
  return { decision: "clarify", notice: notice || "Reformula el texto: no puede publicarse así." };
}

export type QuestionAssist = {
  decision: "allow" | "clarify";
  notice?: string;
  topics: string[];
  answer?: string;
};

export async function assistQuestion(body: string, topicNames: string[]): Promise<QuestionAssist | null> {
  const parsed = await chatJson(
    `Eres el asistente de la International Coaching & Speaker Federation (ICSF). Responde solo JSON {"decision":"allow"|"clarify","notice":"","topics":[],"answer":""}.
clarify si hay acoso a una persona, odio, spam o la pregunta no se entiende. Un tema delicado pero profesional (maltrato, violencia, duelo) no es clarify: usa allow y responde con cuidado, sin detalles gráficos.
allow: answer son 2 a 4 frases en español, prácticas para coaches o speakers, sin inventar políticas, cifras ni credenciales oficiales. Cierra diciendo que la comunidad también puede responder. topics: máximo 2 nombres EXACTOS de esta lista, o vacío: ${topicNames.join(" | ")}.`,
    body.slice(0, 280),
  );
  if (!parsed) return null;
  const decision = asDecision(parsed.decision);
  const topics = Array.isArray(parsed.topics) ? parsed.topics.map((t) => String(t)) : [];
  const answer = String(parsed.answer ?? "").trim();
  return {
    decision: decision === "clarify" ? "clarify" : "allow",
    notice: String(parsed.notice ?? "").trim().slice(0, 240) || undefined,
    topics,
    answer: answer || undefined,
  };
}

export async function assistantUserId() {
  const role = await db.role.findUnique({ where: { key: "member" } });
  if (!role) return null;
  const user = await db.user.upsert({
    where: { email: ASSISTANT_EMAIL },
    update: { name: "Asistente ICSF", status: "ACTIVE" },
    create: { email: ASSISTANT_EMAIL, name: "Asistente ICSF", roleId: role.id, status: "ACTIVE" },
  });
  return user.id;
}
