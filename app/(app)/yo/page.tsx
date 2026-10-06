import Link from "next/link";
import { requireUser } from "@/lib/session";
import { getAchievementsHome, getIncomingConnections, getMyProfile, getAcademyHome, getCredential } from "@/lib/data";
import { respondToConnection } from "@/lib/actions";
import RootHeader from "@/components/RootHeader";
import SignOutButton from "@/components/SignOutButton";
import ProgressBar from "@/components/ProgressBar";
import IconCircle from "@/components/IconCircle";
import Avatar from "@/components/Avatar";
import { pct } from "@/lib/format";

export default async function Yo() {
  const user = await requireUser();
  const [{ families, totalUnlocked, inProgress }, profile, incoming, academy, credential] = await Promise.all([
    getAchievementsHome(user.id),
    getMyProfile(user.id),
    getIncomingConnections(user.id),
    getAcademyHome(user.id),
    getCredential(user.id),
  ]);
  const isAdmin = user.role === "admin" || user.perms.includes("users.write");
  const isRep = user.role === "country_rep";

  return (
    <>
      <RootHeader userId={user.id} label="Yo" />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-6 gap-y-space-md">
          <div className="pt-space-md space-y-3">
            <div className="flex items-start gap-3">
              <Avatar name={user.name ?? "Miembro"} size={64} />
              <div className="min-w-0 flex-1">
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-honor-amber-soft text-on-tertiary-container font-label-sm text-label-sm">
                  <span className="material-symbols-outlined filled text-[14px] text-ambassador-gold">verified</span>
                  {profile.tier?.name ?? "Miembro ICSF"}
                </span>
                <h1 className="text-headline-lg font-headline-lg text-on-surface tracking-tight font-bold mt-1">{user.name}</h1>
                <p className="text-body-md font-body-md text-on-surface-variant">{profile.title ?? "Tu crecimiento, impacto y aportes a la red ICSF."}</p>
              </div>
            </div>
            <div className="flex gap-2">
              <Link href="/yo/editar" className="h-10 px-4 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center">Editar perfil</Link>
              <Link href="/yo/credencial" className="h-10 px-4 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center gap-1">
                <span className="material-symbols-outlined text-[16px] text-ambassador-gold">badge</span> Credencial
              </Link>
            </div>
          </div>

          {incoming.length > 0 && (
            <section className="space-y-2">
              <h2 className="font-headline-sm text-headline-sm font-bold">Solicitudes de conexión</h2>
              {incoming.map((c) => (
                <div key={c.id} className="bg-surface-card rounded-xl p-3.5 card-elevated flex items-center gap-3">
                  <Avatar name={c.from.user.name} size={40} />
                  <div className="min-w-0 flex-1"><p className="font-label-lg text-label-lg text-on-surface truncate">{c.from.user.name}</p><p className="text-body-sm text-body-sm text-on-surface-variant truncate">{c.from.title}</p></div>
                  <form action={async () => { "use server"; await respondToConnection(c.id, true, "/yo"); }}>
                    <button className="h-9 px-3 rounded-lg bg-secondary text-on-secondary text-label-sm">Aceptar</button>
                  </form>
                  <form action={async () => { "use server"; await respondToConnection(c.id, false, "/yo"); }}>
                    <button className="h-9 px-3 rounded-lg bg-surface-container text-on-surface text-label-sm">Rechazar</button>
                  </form>
                </div>
              ))}
            </section>
          )}

          {academy.enrollment && (
            <Link href="/academy" className="block bg-surface-card rounded-xl p-space-md card-elevated space-y-2">
              <div className="flex items-center justify-between">
                <span className="font-label-sm text-label-sm text-text-muted uppercase tracking-wider">ICSF Academy</span>
                <span className="font-label-md text-label-md text-stage-electric-blue font-bold">{academy.progressPct}%</span>
              </div>
              <p className="font-headline-sm text-headline-sm font-bold text-on-surface">{academy.enrollment.program.title}</p>
              <ProgressBar percent={academy.progressPct} height="h-2" />
              <p className="text-label-sm text-on-surface-variant">{academy.nextModule ? `Continuar: ${academy.nextModule.title}` : "Programa activo"}</p>
            </Link>
          )}

          <div className="grid grid-cols-3 gap-2.5">
            <Link href="/eventos" className="bg-surface-card rounded-xl p-3 flex flex-col items-center text-center gap-1.5 card-elevated">
              <span className="material-symbols-outlined text-stage-electric-blue text-[22px]">event</span>
              <span className="font-label-sm text-label-sm font-semibold">Eventos</span>
            </Link>
            <Link href="/academy" className="bg-surface-card rounded-xl p-3 flex flex-col items-center text-center gap-1.5 card-elevated">
              <span className="material-symbols-outlined text-secondary text-[22px]">school</span>
              <span className="font-label-sm text-label-sm font-semibold">Academy</span>
            </Link>
            <Link href="/yo/credencial" className="bg-surface-card rounded-xl p-3 flex flex-col items-center text-center gap-1.5 card-elevated">
              <span className="material-symbols-outlined text-ambassador-gold text-[22px]">badge</span>
              <span className="font-label-sm text-label-sm font-semibold">Credencial</span>
            </Link>
          </div>

          <section className="w-full bg-surface-card rounded-xl card-elevated p-space-md">
            <div className="grid grid-cols-3 gap-space-sm text-center">
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low">
                <span className="font-headline-md text-headline-md text-primary-container font-bold">{totalUnlocked}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Obtenidos</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-secondary/10">
                <span className="font-headline-md text-headline-md text-secondary font-bold">{inProgress}</span>
                <span className="font-label-sm text-label-sm text-secondary font-semibold mt-0.5">En curso</span>
              </div>
              <div className="flex flex-col items-center justify-center p-2 rounded-lg bg-surface-container-low">
                <span className="font-headline-md text-headline-md text-primary-container font-bold">{families.length}</span>
                <span className="font-label-sm text-label-sm text-on-surface-variant mt-0.5">Familias</span>
              </div>
            </div>
          </section>

          <section className="space-y-3">
            <div className="flex items-center justify-between">
              <h2 className="font-headline-sm text-headline-sm font-bold">Familias de Acreditación</h2>
              <span className="font-label-md text-label-md text-on-surface-variant">{families.length} activas</span>
            </div>
            {families.map((f) => {
              const unlocked = f.achievements.filter((a) => a.unlocks.length).length;
              const last = [...f.achievements].reverse().find((a) => a.unlocks.length);
              const p = pct(unlocked, f.achievements.length);
              return (
                <Link key={f.id} href={`/yo/logros/${f.slug}`} className="block bg-surface-card rounded-xl p-space-md card-elevated space-y-2">
                  <div className="flex items-center gap-3">
                    <IconCircle icon={f.icon} tone="primary" />
                    <div className="min-w-0 flex-1"><p className="font-label-lg text-label-lg text-on-surface">{f.name}</p><p className="text-body-sm text-body-sm text-on-surface-variant">{f.description}</p></div>
                    <div className="text-right shrink-0"><p className="font-label-lg text-label-lg text-on-surface">{unlocked}/{f.achievements.length}</p><p className="text-label-sm text-label-sm text-secondary font-bold">{p}%</p></div>
                  </div>
                  <ProgressBar percent={p} />
                  {last && <p className="text-label-sm text-label-sm text-on-surface-variant">Último: <span className="text-on-surface font-medium">{last.name}</span></p>}
                </Link>
              );
            })}
          </section>

          <section className="space-y-2">
            <h2 className="font-headline-sm text-headline-sm font-bold">Ajustes</h2>
            <Link href="/yo/editar" className="flex items-center gap-3 bg-surface-card rounded-xl p-3.5 card-elevated">
              <span className="material-symbols-outlined text-secondary">manage_accounts</span>
              <span className="flex-1 font-label-lg text-label-lg">Datos de perfil</span>
              <span className="material-symbols-outlined text-outline">chevron_right</span>
            </Link>
            {credential && (
              <a href={`/credencial/verificar/${credential.verifyCode}`} className="flex items-center gap-3 bg-surface-card rounded-xl p-3.5 card-elevated">
                <span className="material-symbols-outlined text-ambassador-gold">verified_user</span>
                <span className="flex-1 font-label-lg text-label-lg">Verificación pública</span>
                <span className="material-symbols-outlined text-outline">chevron_right</span>
              </a>
            )}
            {(isAdmin || isRep) && (
              <Link href="/admin" className="flex items-center gap-3 bg-primary-container text-on-primary rounded-xl p-3.5">
                <span className="material-symbols-outlined">admin_panel_settings</span>
                <span className="flex-1 font-label-lg text-label-lg">{isRep && !isAdmin ? "Panel de representante" : "Portal administrativo"}</span>
                <span className="material-symbols-outlined">chevron_right</span>
              </Link>
            )}
          </section>
          <SignOutButton />
        </div>
      </main>
    </>
  );
}
