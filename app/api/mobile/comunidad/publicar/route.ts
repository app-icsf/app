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
  if (!perms.includes("community.post")) return NextResponse.json({ error: "Sin permiso para publicar." }, { status: 403 });
  const raw = await req.json().catch(() => null);
  const parsed = z
    .object({
      communityId: z.string().min(1),
      body: z.string().trim().min(1),
      title: z.string().trim().optional(),
    })
    .safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Escribe el mensaje y elige comunidad." }, { status: 400 });
  const post = await db.post.create({
    data: {
      authorId: uid,
      communityId: parsed.data.communityId,
      kind: "THREAD",
      body: parsed.data.body,
      title: parsed.data.title || null,
      moderation: "REVIEW",
    },
  });
  clearLocalCache();
  return NextResponse.json({ ok: true, id: post.id, moderation: post.moderation });
}
