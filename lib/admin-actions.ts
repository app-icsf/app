"use server";
import bcrypt from "bcryptjs";
import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { db } from "./db";
import { requirePermission } from "./session";
import { audit, notify } from "./notify";
import { slugify, unlockExplorador } from "./slug";
import { resolvePlace } from "./places";

function revalidateAdmin() {
  revalidatePath("/admin");
  revalidatePath("/admin/usuarios");
  revalidatePath("/admin/propuestas");
  revalidatePath("/admin/viajes");
  revalidatePath("/admin/eventos");
  revalidatePath("/admin/auditoria");
  revalidatePath("/admin/grupos");
}

export async function adminCreateUser(formData: FormData) {
  const me = await requirePermission("users.write");
  const email = String(formData.get("email") ?? "").trim().toLowerCase();
  const name = String(formData.get("name") ?? "").trim();
  const password = String(formData.get("password") ?? "");
  const roleId = String(formData.get("roleId") ?? "");
  const validUntilRaw = String(formData.get("validUntil") ?? "");
  if (!email || !name || !password || !roleId) return;
  const passwordHash = await bcrypt.hash(password, 10);
  const user = await db.user.create({
    data: {
      email,
      name,
      passwordHash,
      roleId,
      validUntil: validUntilRaw ? new Date(validUntilRaw) : null,
    },
  });
  const city = String(formData.get("city") ?? "").trim() || null;
  const country = String(formData.get("country") ?? "").trim() || null;
  const region = String(formData.get("region") ?? "").trim() || null;
  const place = resolvePlace(city, country, region);
  await db.profile.create({
    data: {
      userId: user.id,
      slug: slugify(name) + "-" + user.id.slice(-4),
      city: place?.city ?? city,
      country: place?.country ?? country,
      region: place?.region ?? region,
      lat: place?.lat ?? null,
      lng: place?.lng ?? null,
    },
  });
  await audit(me.id, "user.create", user.id, { email });
  revalidateAdmin();
  redirect("/admin/usuarios");
}

export async function adminUpdateUser(formData: FormData) {
  const me = await requirePermission("users.write");
  const id = String(formData.get("id") ?? "");
  const name = String(formData.get("name") ?? "").trim();
  const roleId = String(formData.get("roleId") ?? "");
  const validFrom = String(formData.get("validFrom") ?? "");
  const validUntil = String(formData.get("validUntil") ?? "");
  const password = String(formData.get("password") ?? "");
  const data: Record<string, unknown> = {
    name,
    roleId,
    validFrom: validFrom ? new Date(validFrom) : undefined,
    validUntil: validUntil ? new Date(validUntil) : null,
  };
  if (password) data.passwordHash = await bcrypt.hash(password, 10);
  await db.user.update({ where: { id }, data });
  await audit(me.id, "user.update", id);
  revalidateAdmin();
  redirect(`/admin/usuarios/${id}`);
}

export async function adminSetUserStatus(userId: string, status: "ACTIVE" | "SUSPENDED" | "REVOKED") {
  const me = await requirePermission("users.suspend");
  await db.user.update({ where: { id: userId }, data: { status } });
  await audit(me.id, "user.status", userId, { status });
  revalidateAdmin();
}

export async function adminReviewProposal(proposalId: string, approve: boolean) {
  const me = await requirePermission("events.manage");
  const p = await db.eventProposal.findUniqueOrThrow({ where: { id: proposalId } });
  await db.eventProposal.update({
    where: { id: proposalId },
    data: { status: approve ? "APPROVED" : "REJECTED" },
  });
  if (approve) {
    await db.event.create({
      data: {
        slug: slugify(p.title) + "-" + p.id.slice(-4),
        title: p.title,
        description: p.description,
        categoryId: p.categoryId,
        startsAt: p.proposedDate ?? new Date(Date.now() + 30 * 86400000),
        kind: "HYBRID",
      },
    });
    await notify(p.userId, "EVENT_REMINDER", "Tu propuesta fue aprobada", p.title, "/eventos");
  } else {
    await notify(p.userId, "EVENT_REMINDER", "Tu propuesta no fue aprobada", p.title, "/eventos");
  }
  await audit(me.id, approve ? "proposal.approve" : "proposal.reject", proposalId);
  revalidateAdmin();
  revalidatePath("/eventos");
}

export async function adminReviewTravel(logId: string, approve: boolean) {
  const me = await requirePermission("travel.review");
  const log = await db.travelLog.update({
    where: { id: logId },
    data: { status: approve ? "VERIFIED" : "REJECTED", reviewedById: me.id },
  });
  if (approve) {
    await unlockExplorador(log.userId);
    await notify(log.userId, "ACHIEVEMENT", "Viaje verificado", `${log.city}, ${log.country}`, "/yo/logros/explorador");
  } else {
    await notify(log.userId, "COMMUNITY", "Viaje no verificado", `${log.city}, ${log.country}`, "/yo/logros/explorador");
  }
  await audit(me.id, approve ? "travel.verify" : "travel.reject", logId);
  revalidateAdmin();
}

export async function adminCreateEvent(formData: FormData) {
  const me = await requirePermission("events.manage");
  const title = String(formData.get("title") ?? "").trim();
  if (!title) return;
  await db.event.create({
    data: {
      slug: slugify(title) + "-" + Date.now().toString(36),
      title,
      description: String(formData.get("description") ?? "") || null,
      categoryId: String(formData.get("categoryId") ?? "") || null,
      startsAt: new Date(String(formData.get("startsAt") ?? Date.now())),
      location: String(formData.get("location") ?? "") || null,
      kind: String(formData.get("kind") ?? "HYBRID"),
      capacity: Number(formData.get("capacity") || 0) || null,
      ceuCredits: Number(formData.get("ceuCredits") || 0) || null,
      chapterId: String(formData.get("chapterId") ?? "") || null,
    },
  });
  await audit(me.id, "event.create", title);
  revalidateAdmin();
  revalidatePath("/eventos");
  redirect("/admin/eventos");
}

export async function adminIssueCredential(formData: FormData) {
  const me = await requirePermission("credentials.issue");
  const userId = String(formData.get("userId") ?? "");
  const title = String(formData.get("title") ?? "Miembro ICSF").trim();
  if (!userId) return;
  const number = `ICSF-CERT-${Date.now()}`;
  const verifyCode = `ICSF-VERIFY-${Math.random().toString(36).slice(2, 10).toUpperCase()}`;
  await db.credential.create({
    data: {
      userId,
      number,
      title,
      status: "ACTIVE",
      expiresAt: new Date(Date.now() + 3 * 365 * 86400000),
      signedByName: me.name ?? "Secretaría ICSF",
      signedByRole: "Portal administrativo",
      verifyCode,
      blockNumber: String(19000 + Math.floor(Math.random() * 900)),
    },
  });
  await notify(userId, "CREDENTIAL", "Credencial emitida", title, "/yo/credencial");
  await audit(me.id, "credential.issue", userId, { number });
  revalidateAdmin();
  redirect(`/admin/usuarios/${userId}`);
}

export async function adminApproveGroup(id: string) {
  const me = await requirePermission("community.moderate");
  const community = await db.community.update({ where: { id }, data: { kind: "TOPIC" } });
  await audit(me.id, "community.approve", community.id, { name: community.name });
  revalidateAdmin();
  revalidatePath("/comunidad");
}

export async function adminRejectGroup(id: string) {
  const me = await requirePermission("community.moderate");
  const community = await db.community.findUniqueOrThrow({ where: { id } });
  await db.community.delete({ where: { id } });
  await audit(me.id, "community.reject", id, { name: community.name });
  revalidateAdmin();
  revalidatePath("/comunidad");
}
