import { requirePermission } from "@/lib/session";
import { adminRoles, adminUserDetail } from "@/lib/data";
import { adminIssueCredential, adminSetUserStatus, adminUpdateUser } from "@/lib/admin-actions";
import { longDate } from "@/lib/format";

export default async function AdminUsuario({ params }: { params: Promise<{ id: string }> }) {
  await requirePermission("users.write");
  const { id } = await params;
  const [u, roles] = await Promise.all([adminUserDetail(id), adminRoles()]);
  return (
    <div className="space-y-6 max-w-xl">
      <h1 className="font-headline-lg">{u.name}</h1>
      <p className="text-body-sm text-on-surface-variant">{u.email} · {u.role.name} · {u.status}</p>
      <form action={adminUpdateUser} className="space-y-2">
        <input type="hidden" name="id" value={u.id} />
        <input name="name" defaultValue={u.name} className="w-full h-11 rounded-lg border border-border-subtle px-3" />
        <select name="roleId" defaultValue={u.roleId} className="w-full h-11 rounded-lg border border-border-subtle px-3">
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <label className="block text-label-sm">Vigente desde
          <input name="validFrom" type="date" defaultValue={u.validFrom.toISOString().slice(0, 10)} className="mt-1 w-full h-11 rounded-lg border border-border-subtle px-3" />
        </label>
        <label className="block text-label-sm">Vigente hasta (vacío = sin caducidad)
          <input name="validUntil" type="date" defaultValue={u.validUntil ? u.validUntil.toISOString().slice(0, 10) : ""} className="mt-1 w-full h-11 rounded-lg border border-border-subtle px-3" />
        </label>
        <input name="password" placeholder="Nueva contraseña (opcional)" className="w-full h-11 rounded-lg border border-border-subtle px-3" />
        <button className="w-full h-11 rounded-lg bg-secondary text-on-secondary">Guardar</button>
      </form>
      <div className="flex gap-2">
        {u.status !== "ACTIVE" && <form action={async () => { "use server"; await adminSetUserStatus(u.id, "ACTIVE"); }}><button className="h-10 px-4 rounded-lg bg-surface-container">Reactivar</button></form>}
        {u.status === "ACTIVE" && <form action={async () => { "use server"; await adminSetUserStatus(u.id, "SUSPENDED"); }}><button className="h-10 px-4 rounded-lg bg-surface-container">Suspender</button></form>}
        {u.status !== "REVOKED" && <form action={async () => { "use server"; await adminSetUserStatus(u.id, "REVOKED"); }}><button className="h-10 px-4 rounded-lg bg-error-container text-on-error-container">Revocar</button></form>}
      </div>
      <section className="space-y-2">
        <h2 className="font-headline-sm">Credenciales</h2>
        {u.credentials.map((c) => (
          <p key={c.id} className="text-body-sm">{c.title} · {c.number} · {c.status} · emitida {longDate(c.issuedAt)}</p>
        ))}
        <form action={adminIssueCredential} className="flex gap-2">
          <input type="hidden" name="userId" value={u.id} />
          <input name="title" defaultValue="Master Speaker" className="flex-1 h-11 rounded-lg border border-border-subtle px-3" />
          <button className="h-11 px-4 rounded-lg bg-primary-container text-on-primary">Emitir</button>
        </form>
      </section>
    </div>
  );
}
