import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearLocalCache } from "@/lib/local-cache";
import { getMyProfile } from "@/lib/data";
import { notify } from "@/lib/notify";
import { readMobileToken } from "@/lib/mobile-token";

export async function POST(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const raw = await req.json().catch(() => null);
  const parsed = z.object({ slug: z.string().min(1) }).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Falta el miembro." }, { status: 400 });
  const myProfile = await getMyProfile(uid);
  const target = await db.profile.findUnique({ where: { slug: parsed.data.slug }, select: { id: true, userId: true, user: { select: { name: true } } } });
  if (!target) return NextResponse.json({ error: "No encontramos a este miembro." }, { status: 404 });
  if (target.id === myProfile.id) return NextResponse.json({ error: "No puedes conectarte contigo." }, { status: 400 });
  const existing = await db.connection.findFirst({
    where: { OR: [{ fromId: myProfile.id, toId: target.id }, { fromId: target.id, toId: myProfile.id }] },
  });
  if (existing) return NextResponse.json({ ok: true, status: existing.status });
  await db.connection.create({ data: { fromId: myProfile.id, toId: target.id, status: "PENDING" } });
  await notify(target.userId, "COMMUNITY", "Nueva solicitud de conexión", `${myProfile.user.name} quiere conectar contigo.`, `/miembros/${myProfile.slug}`);
  clearLocalCache();
  return NextResponse.json({ ok: true, status: "PENDING" });
}
