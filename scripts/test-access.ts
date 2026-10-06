// Verifica las reglas de alta/vigencia/permisos contra la BD local:  npm run test:access
import { db } from "../lib/db";
import { checkAccess, loadPermissions } from "../lib/access";
import { ALL_PERMISSIONS } from "../lib/constants";

let fails = 0;
const eq = (name: string, got: unknown, want: unknown) => {
  const ok = JSON.stringify(got) === JSON.stringify(want);
  console.log(`${ok ? "✓" : "✗"} ${name}${ok ? "" : ` (got ${JSON.stringify(got)}, want ${JSON.stringify(want)})`}`);
  if (!ok) fails++;
};

async function main() {
  const member = await db.role.findUniqueOrThrow({ where: { key: "member" } });
  const day = 86400000;
  const mk = (email: string, data: object) => db.user.upsert({ where: { email }, update: { status: "ACTIVE", validFrom: new Date(0), validUntil: null, ...data }, create: { email, name: email, roleId: member.id, ...data } });

  eq("correo no dado de alta → not_found", (await checkAccess("nadie@x.com")).ok, false);
  await mk("t-ok@test.local", {});
  eq("miembro activo → ok", (await checkAccess("t-ok@test.local")).ok, true);
  await mk("t-exp@test.local", { validUntil: new Date(Date.now() - day) });
  eq("vigencia vencida → expired", (await checkAccess("t-exp@test.local") as any).reason, "expired");
  await mk("t-fut@test.local", { validFrom: new Date(Date.now() + day) });
  eq("vigencia futura → not_started", (await checkAccess("t-fut@test.local") as any).reason, "not_started");
  await mk("t-sus@test.local", { status: "SUSPENDED" });
  eq("suspendido → inactive", (await checkAccess("t-sus@test.local") as any).reason, "inactive");

  const admin = await db.user.findFirstOrThrow({ where: { role: { key: "admin" } } });
  eq("admin tiene TODOS los permisos", (await loadPermissions(admin.id)).length, ALL_PERMISSIONS.length);
  const m = await db.user.findUniqueOrThrow({ where: { email: "t-ok@test.local" } });
  eq("miembro NO tiene users.write", (await loadPermissions(m.id)).includes("users.write"), false);
  const perm = await db.permission.findUniqueOrThrow({ where: { key: "events.manage" } });
  await db.userPermission.upsert({ where: { userId_permissionId: { userId: m.id, permissionId: perm.id } }, update: { effect: "GRANT" }, create: { userId: m.id, permissionId: perm.id } });
  eq("override GRANT por usuario", (await loadPermissions(m.id)).includes("events.manage"), true);
  await db.userPermission.update({ where: { userId_permissionId: { userId: m.id, permissionId: perm.id } }, data: { effect: "DENY" } });
  eq("override DENY por usuario", (await loadPermissions(m.id)).includes("events.manage"), false);

  await db.user.deleteMany({ where: { email: { endsWith: "@test.local" } } });
  process.exit(fails ? 1 : 0);
}
main();
