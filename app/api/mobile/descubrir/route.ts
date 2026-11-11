import { NextRequest, NextResponse } from "next/server";
import { getDiscoverPage } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const q = req.nextUrl.searchParams.get("q") ?? undefined;
  const offset = Number(req.nextUrl.searchParams.get("offset") ?? "0");
  const limit = Number(req.nextUrl.searchParams.get("limit") ?? "20");
  const page = await getDiscoverPage(uid, q, Number.isFinite(offset) ? offset : 0, Number.isFinite(limit) ? limit : 20);
  const origin = req.nextUrl.origin;
  return NextResponse.json({
    nextOffset: page.nextOffset,
    profiles: page.profiles.map((profile) => ({
      slug: profile.slug,
      name: profile.user.name,
      title: profile.title,
      city: profile.city,
      country: profile.country,
      avatarUrl: profile.avatarUrl ? new URL(profile.avatarUrl, origin).toString() : null,
      topics: profile.topics.map((topic) => topic.topic.name),
    })),
  });
}
