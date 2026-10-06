import { requirePermission } from "@/lib/session";
import { adminAudit } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export default async function AdminAuditoria() {
  await requirePermission("audit.read");
  const rows = await adminAudit();
  return (
    <div className="space-y-4">
      <h1 className="font-headline-lg">Bitácora</h1>
      {rows.map((a) => (
        <p key={a.id} className="text-body-sm border-b border-border-subtle py-2">
          <span className="font-medium">{a.actor?.name ?? "sistema"}</span> · {a.action}
          {a.target ? ` · ${a.target}` : ""} · {timeAgo(a.createdAt)}
        </p>
      ))}
      {rows.length === 0 && <p className="text-body-sm text-on-surface-variant">Sin registros.</p>}
    </div>
  );
}
