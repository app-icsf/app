import { db } from "./db";

export function slugify(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/(^-|-$)/g, "");
}

export async function unlockExplorador(userId: string) {
  const verified = await db.travelLog.count({ where: { userId, status: "VERIFIED" } });
  const family = await db.achievementFamily.findUnique({
    where: { slug: "explorador" },
    include: { achievements: true },
  });
  if (!family) return;
  for (const a of family.achievements) {
    if (verified >= a.goal) {
      await db.userAchievement.upsert({
        where: { userId_achievementId: { userId, achievementId: a.id } },
        update: {},
        create: { userId, achievementId: a.id },
      });
    }
  }
}
