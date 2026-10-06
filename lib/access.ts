import { db } from "./db";
import { ALL_PERMISSIONS, type PermissionKey } from "./constants";

export type AccessCheck =
  | { ok: true; user: { id: string; email: string; name: string; roleKey: string } }
  | { ok: false; reason: "not_found" | "inactive" | "not_started" | "expired" };

/** Regla única de alta/vigencia. Se usa en login (cualquier proveedor) y al revalidar la sesión. */
export async function checkAccess(email: string): Promise<AccessCheck> {
  const u = await db.user.findUnique({ where: { email: email.toLowerCase() }, include: { role: true } });
  if (!u) return { ok: false, reason: "not_found" }; // las altas solo las hace el portal admin
  const now = new Date();
  if (u.status !== "ACTIVE") return { ok: false, reason: "inactive" };
  if (u.validFrom > now) return { ok: false, reason: "not_started" };
  if (u.validUntil && u.validUntil < now) return { ok: false, reason: "expired" };
  return { ok: true, user: { id: u.id, email: u.email, name: u.name, roleKey: u.role.key } };
}

/** Permisos efectivos = permisos del rol (admin: todos) + GRANT − DENY. */
export async function loadPermissions(userId: string): Promise<PermissionKey[]> {
  const u = await db.user.findUnique({
    where: { id: userId },
    include: { role: { include: { permissions: { include: { permission: true } } } }, overrides: { include: { permission: true } } },
  });
  if (!u) return [];
  if (u.role.key === "admin") return [...ALL_PERMISSIONS];
  const set = new Set(u.role.permissions.map((rp) => rp.permission.key));
  for (const o of u.overrides) o.effect === "DENY" ? set.delete(o.permission.key) : set.add(o.permission.key);
  return [...set] as PermissionKey[];
}
