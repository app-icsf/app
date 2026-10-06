import { requirePermission } from "@/lib/session";
import { adminPendingGroups } from "@/lib/data";
import { adminApproveGroup, adminRejectGroup } from "@/lib/admin-actions";

export default async function AdminGrupos() {
  await requirePermission("community.moderate");
  const pending = await adminPendingGroups();
  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg">Grupos pendientes</h1>
      <p className="text-body-sm text-on-surface-variant">El Representante por país o Admin aprueba espacios temáticos propuestos por miembros.</p>
      {pending.length === 0 && <p className="text-body-sm text-on-surface-variant">No hay propuestas en cola.</p>}
      <div className="space-y-3">
        {pending.map((g) => (
          <div key={g.id} className="rounded-xl border border-border-subtle p-4 bg-surface-container-lowest space-y-2">
            <p className="font-label-lg">{g.name}</p>
            {g.description && <p className="text-body-sm text-on-surface-variant">{g.description}</p>}
            <p className="text-label-sm text-outline">Propuesto por {g.members[0]?.user.name ?? "miembro"} · {g._count.members} integrante(s)</p>
            <div className="flex gap-2">
              <form action={async () => { "use server"; await adminApproveGroup(g.id); }}>
                <button className="h-10 px-4 rounded-lg bg-secondary text-on-secondary text-label-md">Aprobar</button>
              </form>
              <form action={async () => { "use server"; await adminRejectGroup(g.id); }}>
                <button className="h-10 px-4 rounded-lg bg-error-container text-on-error-container text-label-md">Rechazar</button>
              </form>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
