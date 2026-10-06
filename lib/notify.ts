import { db } from "./db";

export async function notify(userId: string, type: string, title: string, body?: string, link?: string) {
  if (!userId) return;
  await db.notification.create({ data: { userId, type, title, body, link } });
}

export async function audit(actorId: string | null, action: string, target?: string, meta?: unknown) {
  await db.auditLog.create({
    data: { actorId: actorId ?? undefined, action, target, meta: meta ? JSON.stringify(meta) : undefined },
  });
}
