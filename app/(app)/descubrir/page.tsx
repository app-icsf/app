import { requirePermission } from "@/lib/session";
import { countActiveThisWeek, getDiscoverPage } from "@/lib/data";
import RootHeader from "@/components/RootHeader";
import DiscoverFeed from "@/components/DiscoverFeed";

export default async function Descubrir({ searchParams }: { searchParams: Promise<{ q?: string }> }) {
  const me = await requirePermission("directory.read");
  const { q } = await searchParams;
  const [{ profiles, nextOffset }, activeThisWeek] = await Promise.all([
    getDiscoverPage(me.id, q, 0),
    countActiveThisWeek(),
  ]);

  return (
    <>
      <RootHeader userId={me.id} label="Descubrir" showSearch />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="flex flex-col w-full px-margin pb-6 gap-y-space-md">
          <header className="flex flex-col gap-1.5 pt-2">
            <div className="inline-flex items-center gap-1.5 text-secondary"><span className="material-symbols-outlined text-[16px]" style={{ fontVariationSettings: "'FILL' 1" }}>stars</span><span className="font-label-sm text-label-sm uppercase tracking-widest font-semibold">Red Global ICSF</span></div>
            <h1 className="font-display-lg-mobile text-display-lg-mobile text-on-surface tracking-tight">Descubrir personas</h1>
            <p className="font-body-md text-body-md text-on-surface-variant max-w-xs leading-relaxed">Conecta con speakers, coaches y facilitadores de la federación.</p>
          </header>

          <form className="relative w-full shadow-sm rounded-xl bg-surface-container-lowest border border-border-subtle">
            <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">search</span></div>
            <input name="q" defaultValue={q} placeholder="Nombre, ciudad, especialidad, tema..." className="w-full h-12 pl-11 pr-4 bg-transparent text-on-surface font-body-md text-body-md placeholder:text-outline-variant focus:outline-none rounded-xl" />
          </form>

          <DiscoverFeed initial={profiles} nextOffset={nextOffset} query={q} />
          <p className="text-center font-label-sm text-label-sm text-outline uppercase tracking-wider">Más de {activeThisWeek} miembros activos esta semana</p>
        </div>
      </main>
    </>
  );
}
