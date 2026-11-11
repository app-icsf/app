import { NextRequest, NextResponse } from "next/server";
import { getCommunityHome } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const { mine, discover, pending } = await getCommunityHome(uid);
  return NextResponse.json({
    mine: mine.map((m) => ({
      id: m.communityId,
      slug: m.community.slug,
      name: m.community.name,
      kind: m.community.kind,
      members: m.community._count.members,
      lastPost: m.community.posts[0]
        ? {
            body: m.community.posts[0].body,
            authorName: m.community.posts[0].author.name,
            createdAt: m.community.posts[0].createdAt.toISOString(),
          }
        : null,
    })),
    discover: discover.map((c) => ({
      id: c.id,
      slug: c.slug,
      name: c.name,
      kind: c.kind,
      members: c._count.members,
    })),
    pending: pending.map((m) => ({
      id: m.communityId,
      slug: m.community.slug,
      name: m.community.name,
    })),
  });
}
