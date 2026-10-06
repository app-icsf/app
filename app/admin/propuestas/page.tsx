import { requirePermission } from "@/lib/session";
import { adminProposals } from "@/lib/data";
import { adminReviewProposal } from "@/lib/admin-actions";
import { longDate } from "@/lib/format";
import Pill from "@/components/Pill";

export default async function AdminPropuestas() {
  await requirePermission("events.manage");
  const rows = await adminProposals();
  return (
    <div className="space-y-4">
      <h1 className="font-headline-lg">Propuestas de evento</h1>
      {rows.map((p) => (
        <div key={p.id} className="rounded-xl border border-border-subtle p-4 bg-surface-container-lowest space-y-2">
          <div className="flex items-start justify-between gap-3">
            <div>
              <p className="font-label-lg">{p.title}</p>
              <p className="text-body-sm text-on-surface-variant">{p.user.name} · {p.category?.name ?? "Sin categoría"} · {p.proposedDate ? longDate(p.proposedDate) : "sin fecha"}</p>
              {p.description && <p className="text-body-sm mt-1">{p.description}</p>}
            </div>
            <Pill>{p.status}</Pill>
          </div>
          {p.status === "PENDING" && (
            <div className="flex gap-2">
              <form action={async () => { "use server"; await adminReviewProposal(p.id, true); }}><button className="h-10 px-4 rounded-lg bg-secondary text-on-secondary">Aprobar y publicar</button></form>
              <form action={async () => { "use server"; await adminReviewProposal(p.id, false); }}><button className="h-10 px-4 rounded-lg bg-surface-container">Rechazar</button></form>
            </div>
          )}
        </div>
      ))}
      {rows.length === 0 && <p className="text-body-sm text-on-surface-variant">No hay propuestas.</p>}
    </div>
  );
}
