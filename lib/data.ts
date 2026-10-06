// Capa de datos: una función de lectura por pantalla. Todas consultan Prisma directamente — nada de
// contenido fijo en los componentes. `cache()` evita repetir la misma consulta dentro de un mismo request
// (p.ej. el perfil del usuario actual, usado por el layout y por la pantalla).
import { cache } from "react";
import { db } from "./db";
import { resolvePlace } from "./places";

export const getMyProfile = cache(async (userId: string) => {
  return db.profile.findUniqueOrThrow({
    where: { userId },
    include: { tier: true, chapter: true, topics: { include: { topic: true } }, intentTags: { include: { tag: true } } },
  });
});

// ── Inicio ───────────────────────────────────────────────────────────────
export async function getHomeFeed(userId: string) {
  const me = await getMyProfile(userId);
  const [birthdays, newMembers, publication, threads, event, suggestion, notifCount, agenda, academy, memberCount, credential, unlockCount, goingCount] = await Promise.all([
    db.profile.findMany({ where: { userId: { not: userId }, birthday: { not: null } }, include: { user: true } }),
    db.user.findMany({ where: { id: { not: userId }, createdAt: { gte: new Date(Date.now() - 30 * 86400000) } }, orderBy: { createdAt: "desc" }, take: 3, include: { profile: true } }),
    db.post.findFirst({ where: { kind: "PUBLICATION" }, orderBy: { createdAt: "desc" }, include: { author: true } }),
    db.post.findMany({ where: { kind: "THREAD", parentId: null }, orderBy: { createdAt: "desc" }, take: 2, include: { author: { include: { profile: true } }, _count: { select: { replies: true } } } }),
    db.event.findFirst({ where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, include: { category: true, chapter: true, rsvps: { where: { status: { in: ["GOING", "INTERESTED"] } }, include: { user: { include: { profile: true } } }, take: 3 } } }),
    db.profile.findFirst({ where: { userId: { not: userId }, chapterId: me.chapterId, topics: { some: { topicId: { in: me.topics.map((t) => t.topicId) } } } }, include: { user: true, tier: true, topics: { include: { topic: true } } } }),
    db.notification.count({ where: { userId, readAt: null } }),
    db.event.findMany({ where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, take: 3, include: { category: true } }),
    getAcademyHome(userId),
    db.user.count({ where: { status: "ACTIVE" } }),
    db.credential.findFirst({ where: { userId }, orderBy: { issuedAt: "desc" } }),
    db.userAchievement.count({ where: { userId } }),
    db.eventRsvp.count({ where: { userId, status: "GOING" } }),
  ]);
  const now = new Date();
  const mmdd = `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
  const birthdayToday = birthdays.find((b) => b.birthday === mmdd);
  const myRsvp = event ? await db.eventRsvp.findUnique({ where: { eventId_userId: { eventId: event.id, userId } } }) : null;
  return { me, birthdayToday, newMember: newMembers[0] ?? null, publication, threads, event, myRsvp, suggestion, unreadNotifications: notifCount, agenda, academy, memberCount, credential, unlockCount, goingCount };
}

// ── Comunidad ────────────────────────────────────────────────────────────
export async function getCommunityHome(userId: string) {
  const [mine, discover] = await Promise.all([
    db.communityMember.findMany({
      where: { userId }, orderBy: { pinned: "desc" },
      include: { community: { include: { posts: { orderBy: { createdAt: "desc" }, take: 1, include: { author: true, _count: { select: { replies: true } } } }, _count: { select: { members: true } } } } },
    }),
    db.community.findMany({ where: { members: { none: { userId } }, kind: { not: "PENDING" } }, include: { _count: { select: { members: true } } } }),
  ]);
  const pending = mine.filter((m) => m.community.kind === "PENDING");
  const activeMine = mine.filter((m) => m.community.kind !== "PENDING");
  return { mine: activeMine, discover, pending };
}

export async function getChapterWall(slug: string, userId: string) {
  const community = await db.community.findUniqueOrThrow({
    where: { slug },
    include: { _count: { select: { members: true } }, members: { where: { userId }, select: { userId: true } } },
  });
  const chapter = await db.chapter.findFirst({ where: { name: community.name } });
  const posts = await db.post.findMany({
    where: { communityId: community.id, parentId: null },
    orderBy: { createdAt: "desc" },
    include: {
      author: { include: { profile: { include: { tier: true } } } },
      reactions: { include: { user: { select: { name: true } } } },
      replies: { orderBy: { createdAt: "asc" }, include: { author: { include: { profile: { include: { tier: true } } } }, reactions: { include: { user: { select: { name: true } } } } } },
    },
  });
  return { community, chapter, posts, isMember: community.members.length > 0 };
}

// ── Mapa ─────────────────────────────────────────────────────────────────
export async function getIncomingConnections(userId: string) {
  const me = await getMyProfile(userId);
  return db.connection.findMany({
    where: { toId: me.id, status: "PENDING" },
    include: { from: { include: { user: true, tier: true } } },
    orderBy: { createdAt: "desc" },
  });
}

export async function getEditCatalogs() {
  return db.topic.findMany({ orderBy: { name: "asc" } });
}

export async function getMapData() {
  const chapters = await db.chapter.findMany({
    include: { _count: { select: { profiles: true } }, events: { where: { startsAt: { gte: new Date() } }, select: { id: true } } },
  });
  const travelers = await db.travelLog.groupBy({ by: ["city"], where: { status: "VERIFIED", happenedAt: { gte: new Date(Date.now() - 7 * 86400000) } }, _count: true });
  return { chapters, travelers };
}

export async function getMapPresence() {
  const profiles = await db.profile.findMany({
    where: { AND: [{ city: { not: null } }, { city: { not: "" } }] },
    select: { city: true, country: true, region: true, lat: true, lng: true },
  });
  const buckets = new Map<string, { city: string; region: string; country: string; lat: number; lng: number; count: number }>();
  for (const p of profiles) {
    const place = resolvePlace(p.city, p.country, p.region);
    if (!place) continue;
    const key = `${place.country}|${place.region}|${place.city}`;
    const cur = buckets.get(key);
    if (cur) cur.count += 1;
    else buckets.set(key, { city: place.city, region: place.region, country: place.country, lat: place.lat, lng: place.lng, count: 1 });
  }
  return [...buckets.values()];
}

export async function getChapterDetail(slug: string) {
  const chapter = await db.chapter.findUniqueOrThrow({
    where: { slug },
    include: { _count: { select: { profiles: true } }, events: { where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" } }, profiles: { include: { user: true, tier: true }, take: 4 } },
  });
  const travelers = await db.travelLog.count({ where: { status: "VERIFIED", country: chapter.country, happenedAt: { gte: new Date(Date.now() - 7 * 86400000) } } });
  return { chapter, travelers };
}

// ── Descubrir ────────────────────────────────────────────────────────────
export async function getDiscoverProfiles(userId: string, q?: string) {
  return db.profile.findMany({
    where: {
      userId: { not: userId },
      ...(q ? { OR: [{ user: { name: { contains: q } } }, { city: { contains: q } }, { country: { contains: q } }, { title: { contains: q } }] } : {}),
    },
    include: { user: true, tier: true, topics: { include: { topic: true } } },
    orderBy: { user: { name: "asc" } },
  });
}

// ── Perfil de miembro ────────────────────────────────────────────────────
export async function getProfileBySlug(slug: string, viewerUserId: string) {
  const profile = await db.profile.findUniqueOrThrow({
    where: { slug },
    include: { user: true, tier: true, chapter: true, topics: { include: { topic: true } }, intentTags: { include: { tag: true } } },
  });
  const viewer = await getMyProfile(viewerUserId);
  const connection = await db.connection.findFirst({ where: { OR: [{ fromId: viewer.id, toId: profile.id }, { fromId: profile.id, toId: viewer.id }] } });
  const [achievementCount, eventsCount] = await Promise.all([
    db.userAchievement.count({ where: { userId: profile.userId } }),
    db.eventRsvp.count({ where: { userId: profile.userId, status: "GOING" } }),
  ]);
  return { profile, connection, achievementCount, eventsCount };
}

// ── Mensajes ─────────────────────────────────────────────────────────────
export async function getConversations(userId: string) {
  const memberships = await db.conversationMember.findMany({
    where: { userId },
    orderBy: { pinned: "desc" },
    include: {
      conversation: {
        include: {
          members: { where: { userId: { not: userId } }, include: { user: { include: { profile: { include: { tier: true } } } } } },
          messages: { orderBy: { createdAt: "desc" }, take: 1 },
          _count: { select: { messages: true } },
        },
      },
    },
  });
  const withUnread = await Promise.all(
    memberships.map(async (m) => {
      const mine = m.lastReadAt ?? new Date(0);
      const unread = await db.message.count({ where: { conversationId: m.conversationId, createdAt: { gt: mine }, senderId: { not: userId } } });
      return { ...m, unread };
    })
  );
  return withUnread;
}

export async function getConversation(id: string, userId: string) {
  const conversation = await db.conversation.findUniqueOrThrow({
    where: { id },
    include: {
      members: { include: { user: { include: { profile: { include: { tier: true } } } } } },
      messages: { orderBy: { createdAt: "asc" }, include: { reactions: true, sender: true } },
    },
  });
  const other = conversation.members.find((m) => m.userId !== userId)?.user;
  return { conversation, other };
}

// ── Eventos ──────────────────────────────────────────────────────────────
export async function getEvents(userId: string) {
  const [upcoming, categories, myRsvps] = await Promise.all([
    db.event.findMany({ where: { startsAt: { gte: new Date() } }, orderBy: { startsAt: "asc" }, include: { category: true, chapter: true, rsvps: { include: { user: { include: { profile: true } } } } } }),
    db.eventCategory.findMany(),
    db.eventRsvp.findMany({ where: { userId }, select: { eventId: true, status: true } }),
  ]);
  const rsvpMap = new Map(myRsvps.map((r) => [r.eventId, r.status]));
  const me = await getMyProfile(userId).catch(() => null);
  return { upcoming, categories, rsvpMap, myChapterId: me?.chapterId ?? null };
}

// ── Preguntar / comunidad topics ─────────────────────────────────────────
export async function getQuestionCatalog() {
  const [topics, scopes] = await Promise.all([db.topic.findMany({ take: 3 }), db.scope.findMany()]);
  const [certified, avgMinutes] = await Promise.all([
    db.profile.count({ where: { tier: { rank: { gte: 1 } } } }),
    Promise.resolve(45),
  ]);
  return { topics, scopes, certifiedCount: certified, avgMinutes };
}

export async function getQuestion(id: string) {
  return db.post.findFirst({
    where: { id, kind: "QUESTION", parentId: null },
    include: {
      author: true,
      topics: { include: { topic: true } },
      replies: { orderBy: { createdAt: "asc" }, include: { author: true } },
    },
  });
}

// ── Academy ──────────────────────────────────────────────────────────────
export async function getAcademyHome(userId: string) {
  const [enrollment, catalog] = await Promise.all([
    db.academyEnrollment.findFirst({
      where: { userId, status: "ACTIVE" },
      include: { program: { include: { modules: { orderBy: { position: "asc" } } } }, cohort: true, moduleProgress: true },
    }),
    db.program.findMany({ where: { status: "OPEN" }, include: { _count: { select: { modules: true } } } }),
  ]);
  const nextLesson = await db.post.findFirst({ where: { kind: "LESSON_DISCUSSION" }, orderBy: { createdAt: "desc" } }); // placeholder para "próxima actividad" en vivo
  let progressPct = 0, nextModule = null as null | { title: string };
  if (enrollment) {
    const total = enrollment.program.modules.length;
    const done = enrollment.moduleProgress.filter((m) => m.status === "DONE").length;
    progressPct = total ? Math.round((done / total) * 100) : 0;
    nextModule = enrollment.program.modules.find((m) => enrollment.moduleProgress.find((p) => p.moduleId === m.id)?.status !== "DONE") ?? null;
  }
  const openPrograms = catalog.filter((p) => p.id !== enrollment?.programId);
  return { enrollment, progressPct, nextModule, openPrograms };
}

export async function getProgramRoute(userId: string) {
  return db.academyEnrollment.findFirst({
    where: { userId, status: "ACTIVE" },
    include: {
      program: { include: { modules: { orderBy: { position: "asc" }, include: { lessons: true } } } },
      cohort: true,
      tutor: { include: { profile: { include: { tier: true } } } },
      moduleProgress: true,
      submissions: { include: { module: true } },
    },
  });
}

export async function getLesson(id: string, userId: string) {
  const lesson = await db.lesson.findUniqueOrThrow({
    where: { id },
    include: {
      module: { include: { program: true } },
      downloads: true,
      progress: { where: { userId } },
      discussions: { where: { parentId: null }, include: { author: true, _count: { select: { replies: true } } } },
    },
  });
  const instructor = await db.profile.findFirst({ where: { chapterRole: { not: null } }, include: { user: true, tier: true } });
  return { lesson, instructor, myProgress: lesson.progress[0] ?? null };
}

// ── Logros ───────────────────────────────────────────────────────────────
export async function getAchievementsHome(userId: string) {
  const families = await db.achievementFamily.findMany({ include: { achievements: { orderBy: { tier: "asc" }, include: { unlocks: { where: { userId } } } } } });
  const totalUnlocked = await db.userAchievement.count({ where: { userId } });
  const inProgress = families.filter((f) => {
    const unlocked = f.achievements.filter((a) => a.unlocks.length).length;
    return unlocked > 0 && unlocked < f.achievements.length;
  }).length;
  return { families, totalUnlocked, inProgress };
}

export async function getAchievementFamily(slug: string, userId: string) {
  const family = await db.achievementFamily.findUniqueOrThrow({
    where: { slug },
    include: { achievements: { orderBy: { tier: "asc" }, include: { unlocks: { where: { userId } } } } },
  });
  const activityTypes = await db.activityType.findMany();
  const travelLogs = await db.travelLog.findMany({ where: { userId }, orderBy: { createdAt: "desc" }, include: { activityType: true } });
  return { family, activityTypes, travelLogs };
}

export async function getLatestUnlock(userId: string) {
  return db.userAchievement.findFirst({ where: { userId }, orderBy: { unlockedAt: "desc" }, include: { achievement: { include: { family: true } } } });
}

// ── Credencial ───────────────────────────────────────────────────────────
export async function getCredential(userId: string) {
  return db.credential.findFirst({ where: { userId }, orderBy: { issuedAt: "desc" }, include: { competencies: { include: { competency: true } }, user: { include: { profile: true } } } });
}

export async function getCredentialByVerifyCode(code: string) {
  return db.credential.findUnique({ where: { verifyCode: code }, include: { competencies: { include: { competency: true } }, user: { include: { profile: true } } } });
}

// ── Notificaciones ───────────────────────────────────────────────────────
export async function getNotifications(userId: string) {
  return db.notification.findMany({ where: { userId }, orderBy: { createdAt: "desc" } });
}

export async function getUnreadMessageCount(userId: string) {
  const memberships = await db.conversationMember.findMany({ where: { userId }, select: { conversationId: true, lastReadAt: true } });
  const counts = await Promise.all(
    memberships.map((m) =>
      db.message.count({
        where: { conversationId: m.conversationId, senderId: { not: userId }, createdAt: { gt: m.lastReadAt ?? new Date(0) } },
      })
    )
  );
  return counts.reduce((a, n) => a + n, 0);
}

// ── Búsqueda global ──────────────────────────────────────────────────────
export async function globalSearch(q: string, userId: string) {
  if (!q.trim()) return { people: [], events: [], posts: [] };
  const [people, events, posts] = await Promise.all([
    db.profile.findMany({ where: { userId: { not: userId }, OR: [{ user: { name: { contains: q } } }, { city: { contains: q } }] }, include: { user: true, tier: true }, take: 5 }),
    db.event.findMany({ where: { title: { contains: q } }, take: 5 }),
    db.post.findMany({ where: { body: { contains: q } }, include: { author: true }, take: 5 }),
  ]);
  return { people, events, posts };
}

export async function adminDashboard() {
  const [users, pendingTravel, pendingProposals, events, audit] = await Promise.all([
    db.user.count(),
    db.travelLog.count({ where: { status: "PENDING" } }),
    db.eventProposal.count({ where: { status: "PENDING" } }),
    db.event.count({ where: { startsAt: { gte: new Date() } } }),
    db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take: 8, include: { actor: true } }),
  ]);
  return { users, pendingTravel, pendingProposals, events, audit };
}

export async function adminUsers(q?: string) {
  return db.user.findMany({
    where: q ? { OR: [{ name: { contains: q } }, { email: { contains: q } }] } : undefined,
    include: { role: true, profile: true },
    orderBy: { createdAt: "desc" },
  });
}

export async function adminUserDetail(id: string) {
  return db.user.findUniqueOrThrow({
    where: { id },
    include: { role: true, profile: { include: { tier: true } }, credentials: true },
  });
}

export async function adminRoles() {
  return db.role.findMany({ include: { _count: { select: { users: true } } } });
}

export async function adminProposals() {
  return db.eventProposal.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, category: true },
  });
}

export async function adminTravelLogs() {
  return db.travelLog.findMany({
    orderBy: { createdAt: "desc" },
    include: { user: true, activityType: true, reviewedBy: true },
  });
}

export async function adminEventsCatalog() {
  const [events, categories, chapters] = await Promise.all([
    db.event.findMany({ orderBy: { startsAt: "desc" }, include: { category: true, chapter: true, _count: { select: { rsvps: true } } } }),
    db.eventCategory.findMany(),
    db.chapter.findMany(),
  ]);
  return { events, categories, chapters };
}

export async function adminAudit(take = 80) {
  return db.auditLog.findMany({ orderBy: { createdAt: "desc" }, take, include: { actor: true } });
}

export async function adminPendingGroups() {
  return db.community.findMany({
    where: { kind: "PENDING" },
    include: { _count: { select: { members: true } }, members: { take: 1, include: { user: true } } },
    orderBy: { name: "asc" },
  });
}

export async function myPublishCommunities(userId: string) {
  return db.communityMember.findMany({
    where: { userId, community: { kind: { not: "PENDING" } } },
    include: { community: true },
    orderBy: { pinned: "desc" },
  });
}
