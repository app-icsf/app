import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { adminDashboard } from "@/lib/data";
import { timeAgo } from "@/lib/format";

export default async function AdminHome() {
  await requirePermission("users.read");
  const d = await adminDashboard();
  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg text-headline-lg">Resumen</h1>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          ["Usuarios", d.users, "/admin/usuarios"],
          ["Viajes pendientes", d.pendingTravel, "/admin/viajes"],
          ["Propuestas", d.pendingProposals, "/admin/propuestas"],
          ["Eventos próximos", d.events, "/admin/eventos"],
        ].map(([label, n, href]) => (
          <Link key={href as string} href={href as string} className="rounded-xl border border-border-subtle bg-surface-container-lowest p-4">
            <p className="font-headline-md">{n as number}</p>
            <p className="text-label-sm text-on-surface-variant">{label as string}</p>
          </Link>
        ))}
      </div>
      <section className="space-y-2">
        <h2 className="font-headline-sm">Última bitácora</h2>
        {d.audit.length === 0 && <p className="text-body-sm text-on-surface-variant">Sin movimientos aún.</p>}
        {d.audit.map((a) => (
          <p key={a.id} className="text-body-sm border-b border-border-subtle py-2">
            <span className="font-medium">{a.actor?.name ?? "sistema"}</span> · {a.action} {a.target ? `· ${a.target}` : ""} · {timeAgo(a.createdAt)}
          </p>
        ))}
      </section>
    </div>
  );
}
