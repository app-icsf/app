import { requirePermission } from "@/lib/session";
import { adminEventsCatalog } from "@/lib/data";
import { adminCreateEvent } from "@/lib/admin-actions";
import { longDate } from "@/lib/format";

export default async function AdminEventos() {
  await requirePermission("events.manage");
  const { events, categories, chapters } = await adminEventsCatalog();
  return (
    <div className="space-y-6">
      <h1 className="font-headline-lg">Eventos</h1>
      <form action={adminCreateEvent} className="grid md:grid-cols-2 gap-2 rounded-xl border border-border-subtle p-4 bg-surface-container-lowest">
        <p className="md:col-span-2 font-label-lg">Nuevo evento</p>
        <input name="title" required placeholder="Título" className="h-11 rounded-lg border border-border-subtle px-3 md:col-span-2" />
        <textarea name="description" placeholder="Descripción" className="md:col-span-2 rounded-lg border border-border-subtle p-3 min-h-20" />
        <input name="startsAt" type="datetime-local" required className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="location" placeholder="Lugar" className="h-11 rounded-lg border border-border-subtle px-3" />
        <select name="categoryId" className="h-11 rounded-lg border border-border-subtle px-3">
          <option value="">Categoría</option>
          {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="chapterId" className="h-11 rounded-lg border border-border-subtle px-3">
          <option value="">Capítulo</option>
          {chapters.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
        </select>
        <select name="kind" className="h-11 rounded-lg border border-border-subtle px-3">
          <option value="HYBRID">Híbrido</option>
          <option value="IN_PERSON">Presencial</option>
          <option value="ONLINE">En línea</option>
        </select>
        <input name="capacity" type="number" placeholder="Cupo" className="h-11 rounded-lg border border-border-subtle px-3" />
        <input name="ceuCredits" type="number" step="0.5" placeholder="CCEUs" className="h-11 rounded-lg border border-border-subtle px-3" />
        <button className="h-11 rounded-lg bg-secondary text-on-secondary md:col-span-2">Publicar</button>
      </form>
      <ul className="space-y-2">
        {events.map((e) => (
          <li key={e.id} className="rounded-xl border border-border-subtle p-3 bg-surface-container-lowest">
            <p className="font-label-lg">{e.title}</p>
            <p className="text-body-sm text-on-surface-variant">{longDate(e.startsAt)} · {e.location} · {e._count.rsvps} RSVP</p>
          </li>
        ))}
      </ul>
    </div>
  );
}
