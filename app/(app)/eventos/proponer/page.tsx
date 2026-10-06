import { db } from "@/lib/db";
import { requireUser } from "@/lib/session";
import { proposeEvent } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import SectionLabel from "@/components/SectionLabel";
import Pill from "@/components/Pill";

export default async function ProponerEvento() {
  const user = await requireUser();
  const [categories, myProposals] = await Promise.all([
    db.eventCategory.findMany(),
    db.eventProposal.findMany({ where: { userId: user.id }, orderBy: { createdAt: "desc" }, include: { category: true } }),
  ]);
  const path = "/eventos/proponer";

  return (
    <>
      <DetailHeader title="Proponer evento" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-5">
        <p className="text-body-sm text-body-sm text-on-surface-variant">Los miembros Fellows y Master Coaches pueden avalar y hospedar eventos oficiales con créditos de la Federación. Tu propuesta pasa a revisión del comité (portal admin, fase 3).</p>
        <form action={async (fd: FormData) => { "use server"; await proposeEvent(fd, path); }} className="space-y-3">
          <input name="title" required placeholder="Título de la conferencia" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          <textarea name="description" placeholder="Describe el enfoque, audiencia y formato" rows={4} className="w-full rounded-lg bg-surface-container-lowest border border-border-subtle p-4 text-body-md" />
          <select name="categoryId" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md">
            <option value="">Categoría (opcional)</option>
            {categories.map((c) => <option key={c.id} value={c.id}>{c.name}</option>)}
          </select>
          <input name="proposedDate" type="date" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg">Enviar propuesta</button>
        </form>
        {myProposals.length > 0 && (
          <section className="space-y-2">
            <SectionLabel>Tus propuestas</SectionLabel>
            {myProposals.map((p) => (
              <div key={p.id} className="bg-surface-container-lowest rounded-xl p-4 border border-border-subtle flex items-center justify-between gap-2">
                <div><p className="font-label-lg text-label-lg text-on-surface">{p.title}</p><p className="text-body-sm text-body-sm text-on-surface-variant">{p.category?.name ?? "Sin categoría"}</p></div>
                <Pill tone={p.status === "APPROVED" ? "secondary" : p.status === "REJECTED" ? "error" : "amber"}>{p.status === "PENDING" ? "En revisión" : p.status === "APPROVED" ? "Aprobada" : "No aprobada"}</Pill>
              </div>
            ))}
          </section>
        )}
      </main>
    </>
  );
}
