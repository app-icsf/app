import { NextRequest, NextResponse } from "next/server";
import { db } from "@/lib/db";
import { readMobileToken } from "@/lib/mobile-token";
import { readSocials, SOCIAL_LABEL } from "@/lib/socials";

export async function GET(req: NextRequest, ctx: { params: Promise<{ slug: string }> }) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const { slug } = await ctx.params;
  const profile = await db.profile.findUnique({
    where: { slug },
    select: {
      slug: true,
      title: true,
      bio: true,
      quote: true,
      avatarUrl: true,
      city: true,
      country: true,
      socials: true,
      user: { select: { name: true } },
      topics: { select: { topic: { select: { name: true } } } },
    },
  });
  if (!profile) return NextResponse.json({ error: "No encontramos a este miembro." }, { status: 404 });
  const origin = req.nextUrl.origin;
  return NextResponse.json({
    slug: profile.slug,
    name: profile.user.name,
    title: profile.title,
    bio: profile.bio,
    quote: profile.quote,
    city: profile.city,
    country: profile.country,
    avatarUrl: profile.avatarUrl ? new URL(profile.avatarUrl, origin).toString() : null,
    topics: profile.topics.map((topic) => topic.topic.name),
    socials: readSocials(profile.socials).map((link) => ({ ...link, label: SOCIAL_LABEL[link.network] })),
  });
}
