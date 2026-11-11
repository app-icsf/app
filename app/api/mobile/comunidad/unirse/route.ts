import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearLocalCache } from "@/lib/local-cache";
import { readMobileToken } from "@/lib/mobile-token";

export async function POST(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const raw = await req.json().catch(() => null);
  const parsed = z.object({ communityId: z.string().min(1) }).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Falta la comunidad." }, { status: 400 });
  await db.communityMember.upsert({
    where: { communityId_userId: { communityId: parsed.data.communityId, userId: uid } },
    update: {},
    create: { communityId: parsed.data.communityId, userId: uid },
  });
  clearLocalCache();
  return NextResponse.json({ ok: true });
}
