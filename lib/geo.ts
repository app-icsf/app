/** Proyección mercator simple para el lienzo del mapa (sin librería). */
export function project(lat: number, lng: number) {
  const x = (lng + 180) / 360;
  const latRad = (lat * Math.PI) / 180;
  const mercN = Math.log(Math.tan(Math.PI / 4 + latRad / 2));
  const y = 0.5 - mercN / (2 * Math.PI);
  return { x, y };
}

/** Recorte editorial: Iberoamérica + España. */
export function projectIbero(lat: number, lng: number) {
  const west = -120, east = 20, north = 50, south = -40;
  const p = project(lat, lng);
  const nw = project(north, west);
  const se = project(south, east);
  const left = ((p.x - nw.x) / (se.x - nw.x)) * 100;
  const top = ((p.y - nw.y) / (se.y - nw.y)) * 100;
  return {
    left: `${Math.min(92, Math.max(8, left))}%`,
    top: `${Math.min(88, Math.max(10, top))}%`,
  };
}

export function haversineKm(a: { lat: number; lng: number }, b: { lat: number; lng: number }) {
  const R = 6371;
  const dLat = ((b.lat - a.lat) * Math.PI) / 180;
  const dLng = ((b.lng - a.lng) * Math.PI) / 180;
  const s =
    Math.sin(dLat / 2) ** 2 +
    Math.cos((a.lat * Math.PI) / 180) * Math.cos((b.lat * Math.PI) / 180) * Math.sin(dLng / 2) ** 2;
  return 2 * R * Math.asin(Math.sqrt(s));
}
