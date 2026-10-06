import Link from "next/link";
import { requirePermission } from "@/lib/session";
import { getMyProfile, getProfileBySlug } from "@/lib/data";
import { respondToConnection, sendConnectionRequest } from "@/lib/actions";
import DetailHeader from "@/components/DetailHeader";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import Pill from "@/components/Pill";
import SectionLabel from "@/components/SectionLabel";

export default async function PerfilMiembro({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const user = await requirePermission("directory.read");
  const [{ profile, connection, achievementCount, eventsCount }, me] = await Promise.all([
    getProfileBySlug(slug, user.id),
    getMyProfile(user.id),
  ]);
  const connectIf = profile.intentTags.filter((t) => t.tag.kind === "CONNECT_IF");
  const openTo = profile.intentTags.filter((t) => t.tag.kind === "OPEN_TO");
  const connected = connection?.status === "ACCEPTED";
  const isMe = profile.userId === user.id;
  const theyRequested = connection?.status === "PENDING" && connection.toId === me.id;

  return (
    <>
      <DetailHeader title="Perfil de miembro" />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe">
        <div className="px-margin py-6 flex flex-col items-center text-center gap-3 bg-surface-container-low">
          <Avatar name={profile.user.name} size={88} />
          <div>
            <h1 className="font-headline-lg text-headline-lg text-on-surface">{profile.user.name}</h1>
            <p className="font-body-sm text-body-sm text-on-surface-variant flex items-center justify-center gap-1 mt-1"><span className="material-symbols-outlined text-[15px]">location_on</span>{[profile.city, profile.country].filter(Boolean).join(", ")}</p>
          </div>
          <div className="flex items-center gap-2"><TierBadge tier={profile.tier} /><span className="font-label-md text-label-md text-on-surface-variant">{profile.title}</span></div>
          {profile.quote && <p className="italic font-body-md text-body-md text-on-surface max-w-xs">"{profile.quote}"</p>}
          {!isMe && (
            <div className="grid grid-cols-2 gap-2.5 w-full max-w-xs pt-2">
              {theyRequested && connection ? (
                <form action={async () => { "use server"; await respondToConnection(connection.id, true, `/miembros/${slug}`); }}>
                  <button className="w-full h-11 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md">Aceptar</button>
                </form>
              ) : (
                <form action={async () => { "use server"; await sendConnectionRequest(profile.id, `/miembros/${slug}`); }}>
                  <button disabled={!!connection} className="w-full h-11 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md disabled:opacity-50">{connected ? "Conectado" : connection ? "Solicitud enviada" : "Conectar"}</button>
                </form>
              )}
              <Link href={`/mensajes/nuevo?a=${profile.userId}`} className="h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center">Mensaje</Link>
            </div>
          )}
          <div className="flex items-center gap-6 pt-2 text-body-sm text-body-sm text-on-surface-variant">
            <span><b className="text-on-surface">{achievementCount}</b> logros</span>
            <span><b className="text-on-surface">{eventsCount}</b> eventos</span>
          </div>
        </div>

        <div className="px-margin py-5 space-y-5">
          {profile.bio && (
            <section><SectionLabel>Sobre mí</SectionLabel><p className="font-body-md text-body-md text-on-surface leading-relaxed mt-1.5">{profile.bio}</p></section>
          )}
          {profile.topics.length > 0 && (
            <section><SectionLabel>Temas &amp; Especialidades</SectionLabel><div className="flex flex-wrap gap-2 mt-1.5">{profile.topics.map((t) => <span key={t.topicId} className="px-3 py-1.5 rounded-full bg-surface-container text-on-surface-variant font-label-md text-label-md">{t.topic.name}</span>)}</div></section>
          )}
          {connectIf.length > 0 && (
            <section className="bg-surface-container-lowest rounded-xl p-4 border border-border-subtle"><h2 className="font-label-md text-label-md uppercase tracking-wider text-secondary mb-1.5">Conecta conmigo si...</h2><p className="font-body-md text-body-md text-on-surface leading-relaxed">{connectIf.map((t) => t.tag.name).join(", ")}.</p></section>
          )}
          {openTo.length > 0 && (
            <section><SectionLabel>Estoy abierto a...</SectionLabel><div className="flex flex-wrap gap-2 mt-1.5">{openTo.map((t) => <Pill key={t.tagId} tone="amber">{t.tag.name}</Pill>)}</div></section>
          )}
          {/* Aún no hay vista pública de trayectoria/logros de OTROS miembros (ver docs/MATRIZ_FUNCIONAL.md, duda D16);
              solo se enlaza cuando es tu propio perfil, para no apuntar a la página de otra persona. */}
          {isMe && <Link href="/yo" className="block text-center h-11 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center">Ver mi huella y trayectoria en ICSF</Link>}
        </div>
      </main>
    </>
  );
}
