import { requireUser } from "@/lib/session";
import { getEditCatalogs, getMyProfile } from "@/lib/data";
import { updateMyProfile } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";

export default async function EditarPerfil() {
  const user = await requireUser();
  const [profile, topics] = await Promise.all([getMyProfile(user.id), getEditCatalogs()]);
  const selected = new Set(profile.topics.map((t) => t.topicId));

  return (
    <>
      <DetailHeader title="Editar perfil" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5">
        <form action={updateMyProfile} className="space-y-3">
          <input name="name" defaultValue={user.name ?? ""} required placeholder="Nombre" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          <input name="title" defaultValue={profile.title ?? ""} placeholder="Título profesional" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          <input name="quote" defaultValue={profile.quote ?? ""} placeholder="Frase o cita" className="w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          <p className="text-label-md text-on-surface-variant">Ciudad (se usa en el mapa por ciudad, no por GPS)</p>
          <div className="grid grid-cols-1 gap-2.5">
            <input name="city" defaultValue={profile.city ?? ""} required placeholder="Ciudad (ej. Monterrey)" className="h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
            <input name="region" defaultValue={profile.region ?? ""} placeholder="Estado / región (ej. Nuevo León)" className="h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
            <input name="country" defaultValue={profile.country ?? ""} required placeholder="País (ej. México)" className="h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          </div>
          <label className="block text-label-sm text-on-surface-variant">Cumpleaños (mes-día, opt-in para el feed)
            <input name="birthday" defaultValue={profile.birthday ?? ""} placeholder="MM-DD" className="mt-1 w-full h-12 rounded-lg bg-surface-container-lowest border border-border-subtle px-4 text-body-md" />
          </label>
          <textarea name="bio" defaultValue={profile.bio ?? ""} rows={5} placeholder="Sobre mí" className="w-full rounded-lg bg-surface-container-lowest border border-border-subtle p-4 text-body-md" />
          <p className="text-label-md text-on-surface-variant">Especialidades</p>
          <div className="flex flex-wrap gap-2">
            {topics.map((t) => (
              <label key={t.id} className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-surface-container text-label-md">
                <input type="checkbox" name="topicId" value={t.id} defaultChecked={selected.has(t.id)} />
                {t.name}
              </label>
            ))}
          </div>
          <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg text-label-lg">Guardar</button>
        </form>
      </main>
    </>
  );
}
