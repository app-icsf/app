import { requirePermission } from "@/lib/session";
import { adminTravelLogs } from "@/lib/data";
import { adminReviewTravel } from "@/lib/admin-actions";
import { longDate } from "@/lib/format";
import Pill from "@/components/Pill";

export default async function AdminViajes() {
  await requirePermission("travel.review");
  const rows = await adminTravelLogs();
  return (
    <div className="space-y-4">
      <h1 className="font-headline-lg">Registros de viaje</h1>
      {rows.map((t) => (
        <div key={t.id} className="rounded-xl border border-border-subtle p-4 bg-surface-container-lowest flex flex-col gap-2">
          <div className="flex justify-between gap-3">
            <div>
              <p className="font-label-lg">{t.city}, {t.country}</p>
              <p className="text-body-sm text-on-surface-variant">{t.user.name} · {t.activityType?.name ?? "Actividad"} · {t.happenedAt ? longDate(t.happenedAt) : "sin fecha"}</p>
            </div>
            <Pill>{t.status}</Pill>
          </div>
          {t.status === "PENDING" && (
            <div className="flex gap-2">
              <form action={async () => { "use server"; await adminReviewTravel(t.id, true); }}><button className="h-10 px-4 rounded-lg bg-secondary text-on-secondary">Verificar</button></form>
              <form action={async () => { "use server"; await adminReviewTravel(t.id, false); }}><button className="h-10 px-4 rounded-lg bg-surface-container">Rechazar</button></form>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
