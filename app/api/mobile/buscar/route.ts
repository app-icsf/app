import { NextRequest, NextResponse } from "next/server";
import { globalSearch } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q") ?? "";
  const result = await globalSearch(q, uid);
  const origin = req.nextUrl.origin;
  return NextResponse.json({
    people: result.people.map((profile) => ({
      slug: profile.slug,
      name: profile.user.name,
      title: profile.title,
      city: profile.city,
      country: profile.country,
      avatarUrl: profile.avatarUrl ? new URL(profile.avatarUrl, origin).toString() : null,
      tier: profile.tier?.name ?? null,
    })),
    events: result.events.map((event) => ({
      id: event.id,
      title: event.title,
      startsAt: event.startsAt.toISOString(),
      location: event.location,
    })),
    posts: result.posts.map((post) => ({
      id: post.id,
      body: post.body,
      authorName: post.author.name,
    })),
  });
}
