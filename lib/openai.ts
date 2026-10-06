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

function asDecision(value: unknown): "allow" | "clarify" {
  return String(value ?? "").toLowerCase() === "clarify" ? "clarify" : "allow";
}

/** Prefiltro. Si OpenAI no responde, se publica: la sanción sigue siendo humana. */
export async function moderateText(text: string): Promise<{ ok: boolean; notice?: string }> {
  const parsed = await chatJson(
    `Eres el prefiltro del código ético de ICSF (coaches y speakers). Responde solo JSON {"decision":"allow"|"clarify","notice":""}. Usa clarify ante acoso, odio, spam, estafa o datos personales de terceros. El tono informal se permite. notice: una frase en español solo si clarify, pidiendo reformular. No sancionar.`,
    text.slice(0, 2000),
  );
  if (!parsed || asDecision(parsed.decision) === "allow") return { ok: true };
  const notice = String(parsed.notice ?? "").trim().slice(0, 240);
  return { ok: false, notice: notice || "Reformula el texto para poder publicarlo." };
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
clarify si hay acoso, odio, spam o la pregunta no se entiende; notice pide reformular, en español.
allow: answer son 2 a 4 frases en español, prácticas para coaches o speakers, sin inventar políticas, cifras ni credenciales oficiales. Cierra diciendo que la comunidad también puede responder. topics: máximo 2 nombres EXACTOS de esta lista, o vacío: ${topicNames.join(" | ")}.`,
    body.slice(0, 280),
  );
  if (!parsed) return null;
  const topics = Array.isArray(parsed.topics) ? parsed.topics.map((t) => String(t)) : [];
  const answer = String(parsed.answer ?? "").trim();
  return {
    decision: asDecision(parsed.decision),
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
