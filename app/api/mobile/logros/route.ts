import { NextRequest, NextResponse } from "next/server";
import { getAchievementsHome } from "@/lib/data";
import { readMobileToken } from "@/lib/mobile-token";

export async function GET(req: NextRequest) {
  const uid = readMobileToken(req.headers.get("authorization"));
  if (!uid) return NextResponse.json({ error: "Sesión vencida." }, { status: 401 });
  const home = await getAchievementsHome(uid);
  return NextResponse.json({
    totalUnlocked: home.totalUnlocked,
    inProgress: home.inProgress,
    families: home.families.map((family) => ({
      slug: family.slug,
      name: family.name,
      achievements: family.achievements.map((item) => ({
        name: item.name,
        tier: item.tier,
        unlocked: item.unlocks.length > 0,
      })),
    })),
  });
}
