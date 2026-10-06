import { requirePermission } from "@/lib/session";
import { proposeGroup } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";

export default async function ProponerGrupo() {
  await requirePermission("community.post");
  return (
    <>
      <DetailHeader title="Proponer grupo" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-4">
        <p className="text-body-md text-on-surface-variant">El Representante del país o la Federación revisa la propuesta antes de abrir el espacio.</p>
        <form action={proposeGroup} className="space-y-3">
          <input name="name" required placeholder="Nombre del grupo" className="w-full h-12 rounded-lg bg-surface-card border border-border-subtle px-4 text-body-md" />
          <textarea name="description" rows={4} placeholder="Propósito y a quién convoca" className="w-full rounded-lg bg-surface-card border border-border-subtle px-4 py-3 text-body-md" />
          <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg">Enviar propuesta</button>
        </form>
      </main>
    </>
  );
}
