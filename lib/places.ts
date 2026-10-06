/** Catálogo de centroides urbanos. El mapa nunca usa GPS exacto: solo ciudad / estado / país. */

export type Place = { city: string; region: string; country: string; lat: number; lng: number };

export const COUNTRY_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  México: { lat: 23.63, lng: -102.55 },
  Mexico: { lat: 23.63, lng: -102.55 },
  Colombia: { lat: 4.57, lng: -74.3 },
  "Costa Rica": { lat: 9.75, lng: -84.07 },
  España: { lat: 40.42, lng: -3.7 },
  Spain: { lat: 40.42, lng: -3.7 },
  Perú: { lat: -9.19, lng: -75.02 },
  Argentina: { lat: -34.6, lng: -58.38 },
  "Estados Unidos": { lat: 39.8, lng: -98.5 },
};

export const REGION_CENTROIDS: Record<string, { lat: number; lng: number }> = {
  "México|Nuevo León": { lat: 25.57, lng: -99.97 },
  "México|Ciudad de México": { lat: 19.43, lng: -99.13 },
  "México|Jalisco": { lat: 20.67, lng: -103.35 },
  "México|Puebla": { lat: 19.04, lng: -98.2 },
  "Colombia|Cundinamarca": { lat: 4.71, lng: -74.07 },
  "Colombia|Antioquia": { lat: 6.25, lng: -75.56 },
  "Costa Rica|San José": { lat: 9.93, lng: -84.08 },
  "España|Comunidad de Madrid": { lat: 40.42, lng: -3.7 },
};

const ALIASES: Record<string, string> = {
  "san nicolas": "San Nicolás de los Garza",
  "san nicolas de los garza": "San Nicolás de los Garza",
  "cdmx": "Ciudad de México",
  "ciudad de mexico": "Ciudad de México",
  "mexico city": "Ciudad de México",
};

const PLACES: Place[] = [
  { city: "Ciudad de México", region: "Ciudad de México", country: "México", lat: 19.432, lng: -99.133 },
  { city: "Monterrey", region: "Nuevo León", country: "México", lat: 25.686, lng: -100.316 },
  { city: "San Nicolás de los Garza", region: "Nuevo León", country: "México", lat: 25.746, lng: -100.279 },
  { city: "Guadalupe", region: "Nuevo León", country: "México", lat: 25.677, lng: -100.215 },
  { city: "Guadalajara", region: "Jalisco", country: "México", lat: 20.673, lng: -103.344 },
  { city: "Puebla", region: "Puebla", country: "México", lat: 19.041, lng: -98.206 },
  { city: "Bogotá", region: "Cundinamarca", country: "Colombia", lat: 4.711, lng: -74.072 },
  { city: "Medellín", region: "Antioquia", country: "Colombia", lat: 6.247, lng: -75.566 },
  { city: "San José", region: "San José", country: "Costa Rica", lat: 9.928, lng: -84.091 },
  { city: "Madrid", region: "Comunidad de Madrid", country: "España", lat: 40.417, lng: -3.704 },
  { city: "Lima", region: "Lima", country: "Perú", lat: -12.046, lng: -77.043 },
];

function norm(s: string) {
  return s
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

export function resolvePlace(city?: string | null, country?: string | null, region?: string | null): Place | null {
  if (!city) return null;
  const alias = ALIASES[norm(city)];
  const canonical = alias ?? city;
  const nc = norm(canonical);
  const nco = country ? norm(country) : "";
  const nr = region ? norm(region) : "";
  const hit =
    PLACES.find((p) => norm(p.city) === nc && (!nco || norm(p.country) === nco) && (!nr || norm(p.region) === nr)) ??
    PLACES.find((p) => norm(p.city) === nc && (!nco || norm(p.country) === nco)) ??
    PLACES.find((p) => norm(p.city) === nc) ??
    PLACES.find((p) => nc.includes(norm(p.city)) || norm(p.city).includes(nc));
  if (hit) {
    return { ...hit };
  }
  if (country && COUNTRY_CENTROIDS[country]) {
    const c = COUNTRY_CENTROIDS[country];
    return { city: city.trim(), region: region?.trim() || country, country: country.trim(), lat: c.lat, lng: c.lng };
  }
  if (nr && nco) {
    const key = `${country}|${region}`;
    const rc = REGION_CENTROIDS[key];
    if (rc) return { city: city.trim(), region: region!.trim(), country: country!.trim(), lat: rc.lat, lng: rc.lng };
  }
  return null;
}

export function nearestCity(lat: number, lng: number): Place {
  let best = PLACES[0];
  let bestD = Infinity;
  for (const p of PLACES) {
    const d = (p.lat - lat) ** 2 + (p.lng - lng) ** 2;
    if (d < bestD) {
      bestD = d;
      best = p;
    }
  }
  return best;
}

export function countryCentroid(country: string) {
  return COUNTRY_CENTROIDS[country] ?? COUNTRY_CENTROIDS.México;
}

export function regionCentroid(country: string, region: string, fallback: { lat: number; lng: number }) {
  return REGION_CENTROIDS[`${country}|${region}`] ?? fallback;
}

export const ALL_PLACES = PLACES;
