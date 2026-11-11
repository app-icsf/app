import { NextRequest, NextResponse } from "next/server";
import { countMentors, getConversations } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const [conversations, mentorCount] = await Promise.all([getConversations(uid), countMentors(uid)]);
  const origin = req.nextUrl.origin;
  return NextResponse.json({
    mentorCount,
    conversations: conversations.map((c) => {
      const other = c.conversation.members[0]?.user;
      const last = c.conversation.messages[0];
      return {
        id: c.conversationId,
        pinned: c.pinned,
        unread: c.unread,
        title: c.conversation.title ?? other?.name ?? "Conversación",
        other: other
          ? {
              name: other.name,
              slug: other.profile?.slug ?? null,
              avatarUrl: other.profile?.avatarUrl ? new URL(other.profile.avatarUrl, origin).toString() : null,
              tier: other.profile?.tier?.name ?? null,
            }
          : null,
        lastMessage: last
          ? {
              body: last.kind === "VOICE" ? "Nota de voz" : last.kind === "FILE" ? last.attachmentName ?? "Archivo" : last.body,
              createdAt: last.createdAt.toISOString(),
              kind: last.kind,
            }
          : null,
      };
    }),
  });
}
