import { NextRequest, NextResponse } from "next/server";
import { getChapterWall } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const { slug } = await ctx.params;
  try {
    const { community, posts, isMember } = await getChapterWall(slug, uid);
    const origin = req.nextUrl.origin;
    return NextResponse.json({
      id: community.id,
      slug: community.slug,
      name: community.name,
      kind: community.kind,
      members: community._count.members,
      isMember,
      posts: posts.map((post) => ({
        id: post.id,
        title: post.title,
        body: post.body,
        moderation: post.moderation,
        createdAt: post.createdAt.toISOString(),
        authorName: post.author.name,
        authorSlug: post.author.profile?.slug ?? null,
        authorAvatar: post.author.profile?.avatarUrl ? new URL(post.author.profile.avatarUrl, origin).toString() : null,
        repliesCount: post.replies.length,
        reactions: post.reactions.length,
      })),
    });
  } catch {
    return NextResponse.json({ error: "No encontramos esta comunidad." }, { status: 404 });
  }
}
