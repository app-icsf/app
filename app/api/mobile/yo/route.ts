import { NextRequest, NextResponse } from "next/server";
import { getAcademyHome, getAchievementsHome, getCredential, getIncomingConnections, getMyProfile } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const origin = req.nextUrl.origin;
  const [profile, incoming, academy, credential, achievements] = await Promise.all([
    getMyProfile(uid),
    getIncomingConnections(uid),
    getAcademyHome(uid),
    getCredential(uid),
    getAchievementsHome(uid),
  ]);
  return NextResponse.json({
    profile: {
      name: profile.user.name,
      title: profile.title,
      bio: profile.bio,
      quote: profile.quote,
      city: profile.city,
      country: profile.country,
      slug: profile.slug,
      tier: profile.tier?.name ?? null,
      avatarUrl: profile.avatarUrl ? new URL(profile.avatarUrl, origin).toString() : null,
    },
    incoming: incoming.map((item) => ({
      id: item.id,
      name: item.from.user.name,
      title: item.from.title,
      slug: item.from.slug,
    })),
    academy: academy.enrollment
      ? { programTitle: academy.enrollment.program.title, progressPct: academy.progressPct, nextModuleTitle: academy.nextModule?.title ?? null }
      : { openPrograms: academy.openPrograms.map((program) => ({ id: program.id, title: program.title, modules: program._count.modules })) },
    credential: credential
      ? { number: credential.number, title: credential.title, status: credential.status, issuedAt: credential.issuedAt.toISOString(), expiresAt: credential.expiresAt?.toISOString() ?? null }
      : null,
    achievements: {
      totalUnlocked: achievements.totalUnlocked,
      inProgress: achievements.inProgress,
      families: achievements.families.map((family) => ({
        slug: family.slug,
        name: family.name,
        unlocked: family.achievements.filter((item) => item.unlocks.length > 0).length,
        total: family.achievements.length,
      })),
    },
  });
}
