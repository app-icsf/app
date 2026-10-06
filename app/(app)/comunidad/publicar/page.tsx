import { requirePermission } from "@/lib/session";
import { myPublishCommunities } from "@/lib/data";
import { publishPost } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";

export default async function Publicar({ searchParams }: { searchParams: Promise<{ aviso?: string }> }) {
  const user = await requirePermission("community.post");
  const { aviso } = await searchParams;
  const memberships = await myPublishCommunities(user.id);

  return (
    <>
      <DetailHeader title="Publicar" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-4">
        <p className="text-body-md text-on-surface-variant">Comparte un aviso, un hallazgo o un recurso con tu espacio colegiado.</p>
        {aviso && <p role="alert" className="rounded-lg bg-honor-amber-soft text-on-tertiary-container text-body-sm p-3">{aviso}</p>}
        {memberships.length === 0 ? (
          <p className="text-body-sm text-on-surface-variant">Únete a una comunidad para poder publicar.</p>
        ) : (
          <form action={publishPost} className="space-y-3">
            <select name="communityId" required className="w-full h-12 rounded-lg bg-surface-card border border-border-subtle px-4 text-body-md">
              {memberships.map((m) => (
                <option key={m.communityId} value={m.communityId}>{m.community.name}</option>
              ))}
            </select>
            <input name="title" placeholder="Título (opcional)" className="w-full h-12 rounded-lg bg-surface-card border border-border-subtle px-4 text-body-md" />
            <textarea name="body" required rows={6} placeholder="Texto, enlace o hashtag…" className="w-full rounded-lg bg-surface-card border border-border-subtle px-4 py-3 text-body-md" />
            <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg">Publicar</button>
          </form>
        )}
      </main>
    </>
  );
}
