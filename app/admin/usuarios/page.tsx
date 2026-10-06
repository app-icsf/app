import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { adminRoles, adminUsers } from "@/lib/data";
import { adminCreateUser } from "@/lib/admin-actions";
import Pill from "@/components/Pill";

export default async function AdminUsuarios({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  await requirePermission("users.read");
  const { q } = await searchParams;
  const [users, roles] = await Promise.all([adminUsers(q), adminRoles()]);
  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg">Usuarios</h1>
      <form className="flex gap-2">
        <input name="q" defaultValue={q} placeholder="Buscar nombre o correo" className="flex-1 h-11 rounded-lg border border-border-subtle px-3 bg-surface-container-lowest" />
        <button className="h-11 px-4 rounded-lg bg-surface-container">Buscar</button>
      </form>
      <form action={adminCreateUser} className="grid md:grid-cols-2 gap-2 rounded-xl border border-border-subtle p-4 bg-surface-container-lowest">
        <p className="md:col-span-2 font-label-lg">Alta individual</p>
        <input name="name" required placeholder="Nombre" className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="email" type="email" required placeholder="correo@icsf.org" className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="password" required placeholder="Contraseña temporal" className="h-11 rounded-lg border border-border-subtle px-3" />
        <select name="roleId" className="h-11 rounded-lg border border-border-subtle px-3">
          {roles.map((r) => <option key={r.id} value={r.id}>{r.name}</option>)}
        </select>
        <p className="md:col-span-2 text-body-sm text-on-surface-variant">Ciudad del miembro (aparece en el mapa por ciudad, nunca por GPS exacto).</p>
        <input name="city" required placeholder="Ciudad (ej. San Nicolás de los Garza)" className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="region" placeholder="Estado / región (ej. Nuevo León)" className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="country" required placeholder="País (ej. México)" className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="validUntil" type="date" className="h-11 rounded-lg border border-border-subtle px-3" />
        <button className="h-11 rounded-lg bg-secondary text-on-secondary">Crear usuario</button>
      </form>
      <div className="overflow-x-auto rounded-xl border border-border-subtle">
        <table className="w-full text-body-sm">
          <thead className="bg-surface-container text-left"><tr><th className="p-3">Nombre</th><th>Correo</th><th>Rol</th><th>Estado</th></tr></thead>
          <tbody>
            {users.map((u) => (
              <tr key={u.id} className="border-t border-border-subtle">
                <td className="p-3"><Link href={`/admin/usuarios/${u.id}`} className="text-secondary">{u.name}</Link></td>
                <td>{u.email}</td>
                <td>{u.role.name}</td>
                <td className="p-3"><Pill>{u.status}</Pill></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
