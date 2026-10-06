"use client";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { MapContainer, TileLayer, Marker, useMap } from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { countryCentroid, nearestCity, regionCentroid } from "@/lib/places";
import Link from "next/link";

export type CityCluster = { city: string; region: string; country: string; lat: number; lng: number; count: number };

type Level = "country" | "region" | "city";
type Agg = { key: string; label: string; sub?: string; count: number; lat: number; lng: number; level: Level; cities: CityCluster[] };

function levelForZoom(z: number): Level {
  if (z < 5) return "country";
  if (z < 8.5) return "region";
  return "city";
}

function aggregate(cities: CityCluster[], level: Level): Agg[] {
  const map = new Map<string, Agg>();
  for (const c of cities) {
    const key = level === "country" ? c.country : level === "region" ? `${c.country}|${c.region}` : `${c.country}|${c.region}|${c.city}`;
    const label = level === "country" ? c.country : level === "region" ? c.region : c.city;
    const sub = level === "city" ? `${c.region}, ${c.country}` : level === "region" ? c.country : undefined;
    const existing = map.get(key);
    const centroid =
      level === "country"
        ? countryCentroid(c.country)
        : level === "region"
          ? regionCentroid(c.country, c.region, { lat: c.lat, lng: c.lng })
          : { lat: c.lat, lng: c.lng };
    if (!existing) {
      map.set(key, { key, label, sub, count: c.count, lat: centroid.lat, lng: centroid.lng, level, cities: [c] });
    } else {
      existing.count += c.count;
      existing.cities.push(c);
    }
  }
  return [...map.values()];
}

function pinIcon(count: number, active: boolean) {
  const size = count >= 20 ? 56 : count >= 8 ? 48 : 40;
  return L.divIcon({
    className: "icsf-map-pin",
    iconSize: [size, size],
    iconAnchor: [size / 2, size / 2],
    html: `<div class="icsf-pin ${active ? "is-active" : ""}" style="width:${size}px;height:${size}px">${count}</div>`,
  });
}

function ZoomSync({ onZoom }: { onZoom: (z: number) => void }) {
  const map = useMap();
  useEffect(() => {
    const sync = () => onZoom(map.getZoom());
    sync();
    map.on("zoomend", sync);
    return () => {
      map.off("zoomend", sync);
    };
  }, [map, onZoom]);
  return null;
}

function FlyTo({ target }: { target: { lat: number; lng: number; zoom: number } | null }) {
  const map = useMap();
  useEffect(() => {
    if (!target) return;
    map.flyTo([target.lat, target.lng], target.zoom, { duration: 0.7 });
  }, [map, target]);
  return null;
}

function FitTiles() {
  const map = useMap();
  useEffect(() => {
    const t = window.setTimeout(() => map.invalidateSize(), 80);
    const t2 = window.setTimeout(() => map.invalidateSize(), 400);
    const onResize = () => map.invalidateSize();
    window.addEventListener("resize", onResize);
    return () => {
      clearTimeout(t);
      clearTimeout(t2);
      window.removeEventListener("resize", onResize);
    };
  }, [map]);
  return null;
}

export default function MemberMap({
  cities,
  missingCity,
}: {
  cities: CityCluster[];
  missingCity: boolean;
}) {
  const [zoom, setZoom] = useState(3.4);
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState<Agg | null>(null);
  const [fly, setFly] = useState<{ lat: number; lng: number; zoom: number } | null>(null);
  const [geoMsg, setGeoMsg] = useState<string | null>(null);
  const [geoBusy, setGeoBusy] = useState(false);
  const askedRef = useRef(false);
  const level = levelForZoom(zoom);

  const filtered = useMemo(() => {
    const q = query.trim().toLowerCase();
    if (!q) return cities;
    return cities.filter((c) => `${c.city} ${c.region} ${c.country}`.toLowerCase().includes(q));
  }, [cities, query]);

  const clusters = useMemo(() => aggregate(filtered, level), [filtered, level]);

  const applyCity = useCallback(
    (place: { city: string; region: string; country: string; lat: number; lng: number }, notice: string) => {
      setGeoMsg(notice);
      setFly({ lat: place.lat, lng: place.lng, zoom: 11 });
      const city = cities.find((c) => c.city === place.city && c.country === place.country && c.region === place.region)
        ?? cities.find((c) => c.city === place.city && c.country === place.country);
      if (city) {
        setSelected({
          key: `${city.country}|${city.region}|${city.city}`,
          label: city.city,
          sub: `${city.region}, ${city.country}`,
          count: city.count,
          lat: city.lat,
          lng: city.lng,
          level: "city",
          cities: [city],
        });
      }
    },
    [cities]
  );

  const onLocate = useCallback(
    (fromUser: boolean) => {
      if (!navigator.geolocation) {
        setGeoMsg("Este dispositivo no ofrece geolocalización. Indica tu ciudad en el perfil.");
        return;
      }
      setGeoBusy(true);
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          const place = nearestCity(pos.coords.latitude, pos.coords.longitude);
          setGeoBusy(false);
          applyCity(place, `Ciudad aproximada: ${place.city}, ${place.region}. No guardamos tu GPS exacto.`);
        },
        () => {
          setGeoBusy(false);
          if (fromUser) setGeoMsg("No autorizaste la ubicación. El mapa sigue visible; tu ciudad se toma del formulario de alta / perfil.");
        },
        { enableHighAccuracy: false, timeout: 12000, maximumAge: 300000 }
      );
    },
    [applyCity]
  );

  useEffect(() => {
    if (askedRef.current) return;
    askedRef.current = true;
    onLocate(false);
  }, [onLocate]);

  function onClusterClick(a: Agg) {
    setSelected(a);
    if (a.level === "country") setFly({ lat: a.lat, lng: a.lng, zoom: 5.6 });
    else if (a.level === "region") setFly({ lat: a.lat, lng: a.lng, zoom: 10 });
    else setFly({ lat: a.lat, lng: a.lng, zoom: 11.5 });
  }

  return (
    <div className="flex flex-col">
      <div className="px-margin pb-2">
        <label className="relative block">
          <span className="material-symbols-outlined absolute left-3.5 top-1/2 -translate-y-1/2 text-on-surface-variant text-[20px]">search</span>
          <input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar ciudad, país o capítulo..."
            className="w-full h-12 pl-11 pr-4 rounded-full bg-surface-card border border-border-subtle text-body-md outline-none focus:ring-2 focus:ring-primary-container"
          />
        </label>
      </div>

      <div className="relative w-full h-[min(62vh,520px)] bg-surface-container-low overflow-hidden">
        <MapContainer
          center={[23.6, -99]}
          zoom={3.4}
          minZoom={2}
          maxZoom={12}
          scrollWheelZoom
          className="h-full w-full z-0"
          attributionControl={false}
          style={{ height: "100%", width: "100%" }}
        >
          <TileLayer
            url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
            attribution='&copy; OpenStreetMap'
          />
          <FitTiles />
          <ZoomSync onZoom={setZoom} />
          <FlyTo target={fly} />
          {clusters.map((c) => (
            <Marker
              key={c.key}
              position={[c.lat, c.lng]}
              icon={pinIcon(c.count, selected?.key === c.key)}
              eventHandlers={{ click: () => onClusterClick(c) }}
            />
          ))}
        </MapContainer>
        <button
          type="button"
          onClick={() => onLocate(true)}
          disabled={geoBusy}
          className="absolute right-3 bottom-3 z-[400] w-11 h-11 rounded-full bg-surface-card text-on-surface flex items-center justify-center border border-border-subtle"
          aria-label="Usar mi ciudad aproximada"
        >
          <span className="material-symbols-outlined text-[22px]">{geoBusy ? "hourglass_top" : "my_location"}</span>
        </button>
        <div className="absolute left-3 top-3 z-[400] px-2.5 py-1 rounded-full bg-surface-card/95 border border-border-subtle font-label-sm text-label-sm text-on-surface">
          {level === "country" ? "Países" : level === "region" ? "Estados / regiones" : "Ciudades"}
        </div>
      </div>

      {geoMsg && <p className="mx-margin mt-2 text-body-sm text-on-surface-variant">{geoMsg}</p>}
      {missingCity && (
        <Link href="/yo/editar" className="mx-margin mt-2 block rounded-xl bg-honor-amber-soft text-on-tertiary-container p-3 text-body-sm">
          Completa tu ciudad en el perfil (la misma del alta) para aparecer en el mapa. Nunca usamos tu GPS exacto.
        </Link>
      )}

      <div className="px-margin py-4 pb-6">
        {selected ? (
          <div className="bg-surface-card rounded-2xl p-5 card-elevated space-y-3">
            <div className="w-10 h-1 bg-surface-container-highest rounded-full mx-auto -mt-1" />
            <div>
              <h2 className="font-headline-md text-on-surface font-semibold">{selected.label}</h2>
              {selected.sub && <p className="text-body-sm text-on-surface-variant">{selected.sub}</p>}
              <p className="text-body-sm text-on-surface-variant mt-1">{selected.count} {selected.count === 1 ? "miembro" : "miembros"}</p>
            </div>
            {selected.level !== "city" && (
              <ul className="space-y-1.5">
                {Object.entries(
                  selected.cities.reduce<Record<string, number>>((acc, c) => {
                    const k = selected.level === "country" ? c.region : c.city;
                    acc[k] = (acc[k] ?? 0) + c.count;
                    return acc;
                  }, {})
                )
                  .sort((a, b) => b[1] - a[1])
                  .map(([name, n]) => (
                    <li key={name} className="flex justify-between text-body-sm">
                      <span>{name}</span>
                      <span className="font-label-md text-secondary">{n}</span>
                    </li>
                  ))}
              </ul>
            )}
            <Link
              href={`/descubrir?q=${encodeURIComponent(selected.level === "city" ? selected.label : selected.cities[0]?.country ?? selected.label)}`}
              className="h-12 w-full bg-primary-container text-on-primary rounded-xl font-label-md flex items-center justify-center gap-2"
            >
              <span className="material-symbols-outlined text-[18px]">group</span>Ver miembros
            </Link>
          </div>
        ) : (
          <p className="text-body-sm text-on-surface-variant text-center">Acerca el mapa: país → estado → ciudad. Los puntos son conteos de miembros por ciudad del alta, no su GPS.</p>
        )}
      </div>
    </div>
  );
}
