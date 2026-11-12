import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearLocalCache } from "@/lib/local-cache";
import { loadPermissions } from "@/lib/access";
import { readMobileToken } from "@/lib/mobile-token";

export async function POST(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const perms = await loadPermissions(uid);
  if (!perms.includes("events.read")) return NextResponse.json({ error: "Sin permiso para eventos." }, { status: 403 });
  const raw = await req.json().catch(() => null);
  const parsed = z.object({ eventId: z.string().min(1), status: z.enum(["INTERESTED", "GOING"]) }).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Falta el evento." }, { status: 400 });
  const event = await db.event.findUnique({ where: { id: parsed.data.eventId }, include: { rsvps: { where: { status: "GOING" } } } });
  if (!event) return NextResponse.json({ error: "No encontramos el evento." }, { status: 404 });
  const existing = await db.eventRsvp.findUnique({ where: { eventId_userId: { eventId: event.id, userId: uid } } });
  if (existing?.status === parsed.data.status) {
    await db.eventRsvp.delete({ where: { eventId_userId: { eventId: event.id, userId: uid } } });
    clearLocalCache();
    return NextResponse.json({ ok: true, status: null });
  }
  if (parsed.data.status === "GOING" && event.capacity && event.rsvps.filter((rsvp) => rsvp.userId !== uid).length >= event.capacity) {
    return NextResponse.json({ error: "Ya no hay lugares." }, { status: 409 });
  }
  await db.eventRsvp.upsert({
    where: { eventId_userId: { eventId: event.id, userId: uid } },
    update: { status: parsed.data.status },
    create: { eventId: event.id, userId: uid, status: parsed.data.status },
  });
  clearLocalCache();
  return NextResponse.json({ ok: true, status: parsed.data.status });
}
