"use server";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { requirePermission, requireUser } from "./session";
import { getMyProfile } from "./data";
import { notify } from "./notify";
import type { PermissionKey } from "./constants";
import { slugify } from "./slug";
import { resolvePlace } from "./places";
import { assistQuestion, assistantUserId, moderateText } from "./openai";

async function revalidate(path: string) {
  revalidatePath(path);
}

export async function toggleRsvp(eventId: string, status: "INTERESTED" | "GOING", path: string) {
  const me = await requirePermission("events.read");
  const event = await db.event.findUniqueOrThrow({ where: { id: eventId }, include: { rsvps: { where: { status: "GOING" } } } });
  const existing = await db.eventRsvp.findUnique({ where: { eventId_userId: { eventId, userId: me.id } } });
  if (existing?.status === status) {
    await db.eventRsvp.delete({ where: { eventId_userId: { eventId, userId: me.id } } });
  } else {
    if (status === "GOING" && event.capacity && event.rsvps.filter((r) => r.userId !== me.id).length >= event.capacity) {
      return;
    }
    await db.eventRsvp.upsert({
      where: { eventId_userId: { eventId, userId: me.id } },
      update: { status },
      create: { eventId, userId: me.id, status },
    });
  }
  await revalidate(path);
}

export async function joinCommunity(communityId: string, path: string) {
  const me = await requireUser();
  await db.communityMember.upsert({
    where: { communityId_userId: { communityId, userId: me.id } },
    update: {},
    create: { communityId, userId: me.id },
  });
  await revalidate(path);
}

export async function sendConnectionRequest(toProfileId: string, path: string) {
  const me = await requirePermission("directory.read");
  const myProfile = await getMyProfile(me.id);
  if (myProfile.id === toProfileId) return;
  const existing = await db.connection.findFirst({
    where: { OR: [{ fromId: myProfile.id, toId: toProfileId }, { fromId: toProfileId, toId: myProfile.id }] },
  });
  if (existing) return;
  await db.connection.create({ data: { fromId: myProfile.id, toId: toProfileId, status: "PENDING" } });
  const target = await db.profile.findUnique({ where: { id: toProfileId } });
  if (target) {
    await notify(target.userId, "COMMUNITY", `${me.name} quiere conectar`, "Tienes una solicitud de conexión.", `/miembros/${myProfile.slug}`);
  }
  await revalidate(path);
}

export async function respondToConnection(connectionId: string, accept: boolean, path: string) {
  const me = await requireUser();
  const myProfile = await getMyProfile(me.id);
  const conn = await db.connection.findUniqueOrThrow({ where: { id: connectionId }, include: { from: true } });
  if (conn.toId !== myProfile.id) return;
  if (accept) {
    await db.connection.update({ where: { id: connectionId }, data: { status: "ACCEPTED" } });
    await notify(conn.from.userId, "COMMUNITY", `${me.name} aceptó tu conexión`, undefined, `/miembros/${myProfile.slug}`);
  } else {
    await db.connection.delete({ where: { id: connectionId } });
  }
  await revalidate(path);
}

export async function reactToPost(postId: string, emoji: string, path: string) {
  const me = await requireUser();
  const where = { postId_userId: { postId, userId: me.id } };
  const existing = await db.postReaction.findUnique({ where });
  if (existing?.emoji === emoji) await db.postReaction.delete({ where });
  else if (existing) await db.postReaction.update({ where, data: { emoji } });
  else await db.postReaction.create({ data: { postId, userId: me.id, emoji } });
  await revalidate(path);
}

export async function postToChapterWall(communityId: string, body: string, path: string) {
  const me = await requirePermission("community.post");
  if (!body.trim()) return;
  const member = await db.communityMember.findUnique({ where: { communityId_userId: { communityId, userId: me.id } } });
  if (!member) return;
  const mod = await moderateText(body);
  if (!mod.ok) redirect(`${path}?aviso=${encodeURIComponent(mod.notice ?? "Reformula el mensaje.")}`);
  await db.post.create({ data: { communityId, authorId: me.id, kind: "CHAPTER_WALL", body: body.trim() } });
  await revalidate(path);
}

export async function publishPost(formData: FormData) {
  const me = await requirePermission("community.post");
  const body = String(formData.get("body") ?? "").trim();
  const title = String(formData.get("title") ?? "").trim() || null;
  const communityId = String(formData.get("communityId") ?? "").trim();
  if (!body || !communityId) return;
  const member = await db.communityMember.findUnique({ where: { communityId_userId: { communityId, userId: me.id } } });
  if (!member) return;
  const mod = await moderateText([title, body].filter(Boolean).join("\n"));
  if (!mod.ok) redirect(`/comunidad/publicar?aviso=${encodeURIComponent(mod.notice ?? "Reformula el texto.")}`);
  await db.post.create({ data: { communityId, authorId: me.id, kind: "PUBLICATION", title, body } });
  const community = await db.community.findUnique({ where: { id: communityId } });
  revalidatePath("/");
  revalidatePath("/comunidad");
  if (community?.slug) redirect(`/comunidad/${community.slug}`);
  redirect("/comunidad");
}

export async function proposeGroup(formData: FormData) {
  const me = await requirePermission("community.post");
  const name = String(formData.get("name") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim() || null;
  if (!name) return;
  let slug = slugify(name);
  const clash = await db.community.findUnique({ where: { slug } });
  if (clash) slug = `${slug}-${me.id.slice(-4)}`;
  const community = await db.community.create({ data: { name, description, slug, kind: "PENDING" } });
  await db.communityMember.create({ data: { communityId: community.id, userId: me.id, role: "ADMIN" } });
  const reps = await db.user.findMany({ where: { role: { key: { in: ["admin", "country_rep"] } } }, select: { id: true } });
  for (const r of reps) {
    await notify(r.id, "COMMUNITY", "Propuesta de grupo", `${me.name} propone «${name}».`, "/admin/grupos");
  }
  revalidatePath("/comunidad");
  redirect("/comunidad");
}

export async function sendChatMessage(conversationId: string, body: string, path: string) {
  const me = await requirePermission("messages.send");
  if (!body.trim()) return;
  const member = await db.conversationMember.findUnique({
    where: { conversationId_userId: { conversationId, userId: me.id } },
  });
  if (!member) return;
  await db.message.create({ data: { conversationId, senderId: me.id, body: body.trim() } });
  await db.conversationMember.update({
    where: { conversationId_userId: { conversationId, userId: me.id } },
    data: { lastReadAt: new Date() },
  }).catch(() => {});
  const others = await db.conversationMember.findMany({ where: { conversationId, userId: { not: me.id } } });
  for (const o of others) {
    await notify(o.userId, "MESSAGE", `${me.name} te escribió`, body.trim().slice(0, 120), `/mensajes/${conversationId}`);
  }
  await revalidate(path);
}

export async function markConversationRead(conversationId: string) {
  const me = await requireUser();
  await db.conversationMember.updateMany({ where: { conversationId, userId: me.id }, data: { lastReadAt: new Date() } });
}

export async function markLessonComplete(lessonId: string, path: string) {
  const me = await requirePermission("academy.access");
  const lesson = await db.lesson.findUniqueOrThrow({ where: { id: lessonId }, include: { module: { include: { lessons: true, program: true } } } });
  await db.lessonProgress.upsert({
    where: { lessonId_userId: { lessonId, userId: me.id } },
    update: { completedAt: new Date() },
    create: { lessonId, userId: me.id, completedAt: new Date() },
  });
  const enrollment = await db.academyEnrollment.findUnique({
    where: { userId_programId: { userId: me.id, programId: lesson.module.programId } },
  });
  if (enrollment) {
    const lessonIds = lesson.module.lessons.map((l) => l.id);
    const done = await db.lessonProgress.count({
      where: { userId: me.id, lessonId: { in: lessonIds }, completedAt: { not: null } },
    });
    if (done >= lessonIds.length) {
      await db.moduleProgress.upsert({
        where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: lesson.moduleId } },
        update: { status: "DONE", completedAt: new Date() },
        create: { enrollmentId: enrollment.id, moduleId: lesson.moduleId, status: "DONE", completedAt: new Date() },
      });
    }
  }
  await revalidate(path);
}

export async function enrollInProgram(programId: string, path: string) {
  const me = await requirePermission("academy.access");
  const modules = await db.module.findMany({ where: { programId }, orderBy: { position: "asc" } });
  const enrollment = await db.academyEnrollment.upsert({
    where: { userId_programId: { userId: me.id, programId } },
    update: { status: "ACTIVE" },
    create: { userId: me.id, programId, status: "ACTIVE" },
  });
  for (const [i, m] of modules.entries()) {
    await db.moduleProgress.upsert({
      where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: m.id } },
      update: {},
      create: { enrollmentId: enrollment.id, moduleId: m.id, status: i === 0 ? "IN_PROGRESS" : "LOCKED" },
    });
  }
  await revalidate(path);
  redirect("/academy/ruta");
}

export async function submitTravelLog(formData: FormData, path: string) {
  const me = await requireUser();
  const city = String(formData.get("city") ?? "").trim();
  const country = String(formData.get("country") ?? "").trim();
  const activityTypeId = String(formData.get("activityTypeId") ?? "") || undefined;
  const happenedAtRaw = String(formData.get("happenedAt") ?? "");
  if (!city) return;
  await db.travelLog.create({
    data: {
      userId: me.id,
      city,
      country: country || "—",
      activityTypeId,
      happenedAt: happenedAtRaw ? new Date(happenedAtRaw) : undefined,
      status: "PENDING",
    },
  });
  const admins = await db.user.findMany({ where: { role: { key: "admin" } }, select: { id: true } });
  for (const a of admins) {
    await notify(a.id, "COMMUNITY", "Nuevo registro de viaje", `${me.name} envió ${city}, ${country}`, "/admin/viajes");
  }
  await revalidate(path);
}

export async function postQuestion(formData: FormData, path: string) {
  const me = await requirePermission("community.post");
  const body = String(formData.get("body") ?? "").trim();
  const scopeId = String(formData.get("scopeId") ?? "") || undefined;
  const topicIds = formData.getAll("topicId").map(String);
  if (!body) return { error: "Escribe una pregunta." };
  const catalog = await db.topic.findMany({ select: { id: true, name: true } });
  const ai = await assistQuestion(body, catalog.map((t) => t.name));
  if (ai?.decision === "clarify") {
    return { error: ai.notice || "Reformula la pregunta para publicarla." };
  }
  const post = await db.post.create({ data: { authorId: me.id, kind: "QUESTION", body, scopeId } });
  const chosen = new Set(topicIds.filter(Boolean));
  for (const name of ai?.topics ?? []) {
    const hit = catalog.find((t) => t.name.toLowerCase() === name.toLowerCase());
    if (hit) chosen.add(hit.id);
  }
  for (const topicId of chosen) await db.postTopic.create({ data: { postId: post.id, topicId } });
  if (ai?.answer) {
    const botId = await assistantUserId();
    if (botId) {
      await db.post.create({ data: { authorId: botId, kind: "QUESTION", parentId: post.id, body: ai.answer } });
    }
  }
  await revalidate(path);
  revalidatePath("/comunidad");
  return { id: post.id };
}

export async function celebrate(profileUserId: string, path: string) {
  const me = await requireUser();
  await notify(profileUserId, "BIRTHDAY", `${me.name} te felicitó`, "¡Feliz cumpleaños desde ICSF!", "/");
  await revalidate(path);
}

export async function markNotificationsRead(path: string) {
  const me = await requireUser();
  await db.notification.updateMany({ where: { userId: me.id, readAt: null }, data: { readAt: new Date() } });
  await revalidate(path);
}

export async function proposeEvent(formData: FormData, path: string) {
  const me = await requirePermission("events.read");
  const profile = await getMyProfile(me.id);
  const canPropose = me.perms.includes("events.manage" as PermissionKey) || (profile.tier?.rank ?? 0) >= 2;
  if (!canPropose) return;
  const title = String(formData.get("title") ?? "").trim();
  const description = String(formData.get("description") ?? "").trim();
  const categoryId = String(formData.get("categoryId") ?? "") || undefined;
  const proposedDateRaw = String(formData.get("proposedDate") ?? "");
  if (!title) return;
  await db.eventProposal.create({
    data: {
      userId: me.id,
      title,
      description,
      categoryId,
      proposedDate: proposedDateRaw ? new Date(proposedDateRaw) : undefined,
    },
  });
  const admins = await db.user.findMany({ where: { role: { key: "admin" } }, select: { id: true } });
  for (const a of admins) {
    await notify(a.id, "EVENT_REMINDER", "Nueva propuesta de evento", title, "/admin/propuestas");
  }
  await revalidate(path);
}

export async function updateMyProfile(formData: FormData) {
  const me = await requireUser();
  const title = String(formData.get("title") ?? "").trim() || null;
  const quote = String(formData.get("quote") ?? "").trim() || null;
  const bio = String(formData.get("bio") ?? "").trim() || null;
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  const birthday = String(formData.get("birthday") ?? "").trim() || null;
  const place = resolvePlace(city, country, region);
  await db.profile.update({
    where: { userId: me.id },
    data: {
      title, quote, bio,
      city: place?.city ?? city,
      country: place?.country ?? country,
      region: place?.region ?? region,
      lat: place?.lat ?? null,
      lng: place?.lng ?? null,
      birthday: birthday || null,
    },
  });
  const name = String(formData.get("name") ?? "").trim();
  if (name) await db.user.update({ where: { id: me.id }, data: { name } });
  const topicIds = formData.getAll("topicId").map(String).filter(Boolean);
  const profile = await db.profile.findUniqueOrThrow({ where: { userId: me.id } });
  await db.profileTopic.deleteMany({ where: { profileId: profile.id } });
  for (const topicId of topicIds) await db.profileTopic.create({ data: { profileId: profile.id, topicId } });
  revalidatePath("/yo");
  revalidatePath("/yo/editar");
  revalidatePath("/mapa");
  redirect("/yo");
}
