import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { db } from "@/lib/db";
import { clearLocalCache } from "@/lib/local-cache";
import { getConversation } from "@/lib/data";
import { loadPermissions } from "@/lib/access";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const { id } = await ctx.params;
  const member = await db.conversationMember.findUnique({ where: { conversationId_userId: { conversationId: id, userId: uid } } });
  if (!member) return NextResponse.json({ error: "No tienes acceso a esta conversación." }, { status: 403 });
  const { conversation, other } = await getConversation(id, uid);
  const origin = req.nextUrl.origin;
  await db.conversationMember.updateMany({ where: { conversationId: id, userId: uid }, data: { lastReadAt: new Date() } });
  clearLocalCache();
  return NextResponse.json({
    id: conversation.id,
    title: conversation.title ?? other?.name ?? "Conversación",
    other: other
      ? {
          name: other.name,
          slug: other.profile?.slug ?? null,
          avatarUrl: other.profile?.avatarUrl ? new URL(other.profile.avatarUrl, origin).toString() : null,
        }
      : null,
    messages: conversation.messages.map((msg) => ({
      id: msg.id,
      body: msg.body,
      kind: msg.kind,
      attachmentName: msg.attachmentName,
      createdAt: msg.createdAt.toISOString(),
      mine: msg.senderId === uid,
      senderName: msg.sender.name,
    })),
  });
}

export async function POST(req: NextRequest, ctx: { params: Promise<{ id: string }> }) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const perms = await loadPermissions(uid);
  if (!perms.includes("messages.send")) return NextResponse.json({ error: "Sin permiso para enviar mensajes." }, { status: 403 });
  const { id } = await ctx.params;
  const member = await db.conversationMember.findUnique({ where: { conversationId_userId: { conversationId: id, userId: uid } } });
  if (!member) return NextResponse.json({ error: "No tienes acceso a esta conversación." }, { status: 403 });
  const raw = await req.json().catch(() => null);
  const parsed = z.object({ body: z.string().trim().min(1) }).safeParse(raw);
  if (!parsed.success) return NextResponse.json({ error: "Escribe un mensaje." }, { status: 400 });
  const message = await db.message.create({
    data: { conversationId: id, senderId: uid, body: parsed.data.body, kind: "TEXT" },
  });
  await db.conversationMember.updateMany({ where: { conversationId: id, userId: uid }, data: { lastReadAt: new Date() } });
  clearLocalCache();
  return NextResponse.json({
    id: message.id,
    body: message.body,
    kind: message.kind,
    createdAt: message.createdAt.toISOString(),
    mine: true,
  });
}
