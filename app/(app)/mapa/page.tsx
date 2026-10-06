import { requirePermission } from "@/lib/session";
import { getMapPresence, getMyProfile } from "@/lib/data";
import RootHeader from "@/components/RootHeader";
import MapLoader from "@/components/MapLoader";

export default async function Mapa() {
  const user = await requirePermission("directory.read");
  const [cities, me] = await Promise.all([getMapPresence(), getMyProfile(user.id).catch(() => null)]);

  return (
    <>
      <RootHeader userId={user.id} label="Mapa" showSearch />
      <main className="flex-1 w-full bg-surface pt-16 pb-28">
        <div className="px-margin pt-3 pb-2 flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-1.5 px-3 py-1 bg-surface-card rounded-full border border-border-subtle">
              <span className="w-2 h-2 rounded-full bg-secondary animate-pulse" />
              <span className="font-label-sm text-label-sm text-on-surface uppercase tracking-wider">Red Global Activa</span>
            </div>
            <span className="font-label-md text-label-md text-on-surface font-semibold">ICSF en el Mundo</span>
          </div>
          <p className="text-body-sm text-on-surface-variant">Los puntos son conteos por ciudad. Acerca el mapa para ver estado y luego ciudad.</p>
        </div>
        <MapLoader cities={cities} missingCity={!me?.city} />
      </main>
    </>
  );
}
