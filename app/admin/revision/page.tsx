import { requirePermission } from "@/lib/session";
import { adminReviews } from "@/lib/data";
import { adminResolveReview } from "@/lib/admin-actions";
import { timeAgo } from "@/lib/format";

export default async function AdminRevision() {
  await requirePermission("community.moderate");
  const rows = await adminReviews();
  return (
    <div className="space-y-4">
      <h1 className="font-headline-lg">Revisión</h1>
      <p className="text-body-sm text-on-surface-variant">Textos válidos que tocan un tema delicado. No están visibles hasta que un administrador los publique.</p>
      {rows.map((p) => (
        <article key={p.id} className="rounded-xl border border-border-subtle p-4 bg-surface-container-lowest space-y-2">
          <p className="text-body-sm text-on-surface-variant">{p.author.name} · {p.community?.name ?? "Pregunta"} · {timeAgo(p.createdAt)}</p>
          {p.title && <p className="font-label-lg">{p.title}</p>}
          <p className="text-body-md">{p.body}</p>
          <div className="flex gap-2">
            <form action={async () => { "use server"; await adminResolveReview(p.id, true); }}><button className="h-10 px-4 rounded-lg bg-secondary text-on-secondary">Publicar</button></form>
            <form action={async () => { "use server"; await adminResolveReview(p.id, false); }}><button className="h-10 px-4 rounded-lg bg-surface-container">No publicar</button></form>
          </div>
        </article>
      ))}
      {rows.length === 0 && <p className="text-body-sm text-on-surface-variant">No hay textos en revisión.</p>}
    </div>
  );
}
