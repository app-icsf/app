import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getCommunityHome } from "@/lib/data";
import { joinCommunity } from "@/lib/actions";
import RootHeader from "@/components/RootHeader";
import SectionLabel from "@/components/SectionLabel";
import IconCircle from "@/components/IconCircle";
import EmptyState from "@/components/EmptyState";
import { timeAgo } from "@/lib/format";

// Icono según el `kind` estructural de la comunidad (GENERAL/CHAPTER/TOPIC lo define el propio esquema,
// no es un catálogo editable) — el nombre y el conteo de miembros sí vienen siempre de BD.
const ICONS: Record<string, string> = { GENERAL: "public", CHAPTER: "flag", TOPIC: "groups" };

export default async function Comunidad() {
  const user = await requireUser();
  const { mine, discover, pending } = await getCommunityHome(user.id);

  return (
    <>
      <RootHeader userId={user.id} label="Comunidad" showSearch />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-6 gap-y-space-md">
          <div className="pt-space-sm bg-gradient-to-r from-primary-container via-[#132238] to-secondary rounded-xl p-space-md text-on-primary relative overflow-hidden">
            <div className="absolute -right-6 -bottom-6 w-28 h-28 bg-stage-electric-blue/20 rounded-full blur-2xl" />
            <div className="flex items-start justify-between relative z-10">
              <div className="space-y-1">
                <div className="flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-ambassador-gold animate-pulse" />
                  <span className="font-label-sm text-label-sm uppercase tracking-wider text-tertiary-fixed">Foro de Oratoria &amp; Liderazgo</span>
                </div>
                <p className="font-headline-sm text-headline-sm font-bold text-white">{mine.reduce((n, m) => n + m.community._count.members, 0)} miembros en tus espacios</p>
                <p className="font-body-sm text-body-sm text-surface-container-highest max-w-[260px]">Espacio colegiado para directores, embajadores y oradores acreditados ICSF.</p>
              </div>
              <div className="w-10 h-10 rounded-full bg-white/10 flex items-center justify-center text-white shrink-0">
                <span className="material-symbols-outlined text-[20px]">groups</span>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <Link href="/comunidad/publicar" className="h-11 rounded-xl bg-secondary text-on-secondary font-label-md flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">edit_note</span> Publicar
            </Link>
            <Link href="/comunidad/proponer" className="h-11 rounded-xl bg-surface-card card-elevated text-on-surface font-label-md flex items-center justify-center gap-1.5">
              <span className="material-symbols-outlined text-[18px]">group_add</span> Proponer grupo
            </Link>
          </div>

          {pending.length > 0 && (
            <section className="space-y-2">
              <SectionLabel>En revisión</SectionLabel>
              {pending.map((m) => (
                <div key={m.communityId} className="bg-honor-amber-soft rounded-xl p-3.5">
                  <p className="font-label-lg text-on-surface">{m.community.name}</p>
                  <p className="text-body-sm text-on-tertiary-container">Pendiente de Representante o Federación</p>
                </div>
              ))}
            </section>
          )}

          <Link href="/preguntar" className="bg-primary-container rounded-xl p-space-md flex items-center justify-between gap-3 text-inverse-on-surface">
            <div><p className="font-label-lg text-label-lg">¿Tienes una consulta rápida?</p><p className="text-body-sm text-body-sm text-on-primary-container mt-0.5">Resuelve dudas de membresía, eventos o credenciales</p></div>
            <span className="shrink-0 px-3 h-9 rounded-lg bg-secondary text-on-secondary text-label-md font-label-md flex items-center">Preguntar</span>
          </Link>

          <section className="space-y-space-sm">
            <SectionLabel right={<span className="text-label-sm font-label-sm text-outline">{mine.length} activas</span>}>Mis Comunidades</SectionLabel>
            <div className="space-y-2.5">
              {mine.map((m) => {
                const last = m.community.posts[0];
                return (
                  <Link key={m.communityId} href={`/comunidad/${m.community.slug}`} className="flex items-center gap-3 bg-surface-card rounded-xl p-space-sm card-elevated">
                    <IconCircle icon={ICONS[m.community.kind] ?? "groups"} tone="secondary" />
                    <div className="min-w-0 flex-1">
                      <div className="flex items-center justify-between gap-2"><p className="font-label-lg text-label-lg text-on-surface truncate">{m.community.name}</p>{last && <span className="text-label-sm text-label-sm text-outline shrink-0">{timeAgo(last.createdAt)}</span>}</div>
                      {last ? <p className="text-body-sm text-body-sm text-on-surface-variant truncate">{last.author.name.split(" ")[0]}: {last.body}</p> : <p className="text-body-sm text-body-sm text-outline">Sin actividad reciente</p>}
                    </div>
                  </Link>
                );
              })}
              {mine.length === 0 && <EmptyState>Aún no perteneces a ninguna comunidad.</EmptyState>}
            </div>
          </section>

          {discover.length > 0 && (
            <section className="space-y-space-sm">
              <SectionLabel>Descubrir Comunidades</SectionLabel>
              <p className="text-body-sm text-body-sm text-on-surface-variant -mt-2">Conecta con nodos locales y círculos temáticos</p>
              <div className="space-y-2.5">
                {discover.map((c) => (
                  <div key={c.id} className="flex items-center gap-3 bg-surface-card rounded-xl p-space-sm card-elevated">
                    <IconCircle icon={ICONS[c.kind] ?? "groups"} tone="neutral" />
                    <div className="min-w-0 flex-1"><p className="font-label-lg text-label-lg text-on-surface truncate">{c.name}</p><p className="text-body-sm text-body-sm text-on-surface-variant">{c.kind === "CHAPTER" ? "Capítulo oficial" : "Grupo temático"} · {c._count.members} miembros</p></div>
                    <form action={async () => { "use server"; await joinCommunity(c.id, "/comunidad"); }}>
                      <button className="shrink-0 px-4 h-9 rounded-full bg-primary-container text-on-primary text-label-md font-label-md">Unirse</button>
                    </form>
                  </div>
                ))}
              </div>
            </section>
          )}
          <p className="text-body-sm text-body-sm text-outline text-center pt-2">Diálogos constructivos bajo el Código de Honor y Ética de ICSF.</p>
        </div>
      </main>
    </>
  );
}
