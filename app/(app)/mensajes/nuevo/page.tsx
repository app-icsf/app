import { redirect } from "next/navigation";
import { requireUser } from "@/lib/session";
import { db } from "@/lib/db";

// Busca (o crea) la conversación directa con `a` y redirige — el botón "Mensaje" de un perfil nunca
// apunta a un chat fijo, siempre resuelve la conversación real entre los dos usuarios.
export default async function NuevaConversacion({ searchParams }: { searchParams: Promise<{ a?: string }> }) {
  const user = await requireUser();
  const { a } = await searchParams;
  if (!a || a === user.id) redirect("/mensajes");

  const existing = await db.conversation.findFirst({
    where: { kind: "DIRECT", members: { some: { userId: user.id } }, AND: { members: { some: { userId: a } } } },
    select: { id: true },
  });
  if (existing) redirect(`/mensajes/${existing.id}`);

  const conv = await db.conversation.create({ data: { kind: "DIRECT", members: { create: [{ userId: user.id }, { userId: a }] } } });
  redirect(`/mensajes/${conv.id}`);
}
