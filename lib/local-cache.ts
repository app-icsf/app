// Caché de secciones en disco (.cache/sections). La segunda visita lee el archivo
// y no vuelve a consultar Postgres hasta que vence el plazo o una acción lo borra.
import { mkdirSync, readFileSync, renameSync, rmSync, statSync, writeFileSync } from "fs";
import path from "path";

const DIR = path.join(process.cwd(), ".cache", "sections");

export const TTL = {
  /** Directorio, mapa y catálogos que casi no cambian. */
  directory: 6 * 60 * 60 * 1000,
  /** Pantallas de la app: volver a entrar no repite la consulta. */
  section: 10 * 60 * 1000,
  /** Mensajes y avisos: el refresco automático no consulta en cada tick. */
  live: 30 * 1000,
  /** Portal admin: corto, y además se borra al guardar. */
  admin: 60 * 1000,
};

function fileFor(key: string) {
  let hash = 0;
  for (let i = 0; i < key.length; i++) hash = (Math.imul(31, hash) + key.charCodeAt(i)) | 0;
  const safe = key.normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-zA-Z0-9._-]+/g, "_").slice(0, 80);
  return path.join(DIR, `${safe || "section"}-${(hash >>> 0).toString(36)}.json`);
}

function encode(value: unknown): unknown {
  if (value instanceof Date) return { __t: "date", v: value.toISOString() };
  if (value instanceof Map) return { __t: "map", v: [...value.entries()].map(([k, v]) => [encode(k), encode(v)]) };
  if (Array.isArray(value)) return value.map(encode);
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) {
      if (key === "passwordHash") continue;
      out[key] = encode(inner);
    }
    return out;
  }
  return value;
}

function decode(value: unknown): unknown {
  if (Array.isArray(value)) return value.map(decode);
  if (value && typeof value === "object" && "__t" in value) {
    const tagged = value as { __t?: string; v?: unknown };
    if (tagged.__t === "date" && typeof tagged.v === "string") return new Date(tagged.v);
    if (tagged.__t === "map" && Array.isArray(tagged.v)) {
      return new Map(tagged.v.map((pair) => {
        const [k, v] = pair as [unknown, unknown];
        return [decode(k), decode(v)];
      }));
    }
  }
  if (value && typeof value === "object") {
    const out: Record<string, unknown> = {};
    for (const [key, inner] of Object.entries(value)) out[key] = decode(inner);
    return out;
  }
  return value;
}

export async function sectionCache<T>(key: string, ttlMs: number, load: () => Promise<T>): Promise<T> {
  const file = fileFor(key);
  try {
    if (Date.now() - statSync(file).mtimeMs < ttlMs) {
      return decode(JSON.parse(readFileSync(file, "utf8"))) as T;
    }
  } catch {
    /* no hay archivo o está vencido: se consulta y se guarda */
  }
  const data = await load();
  mkdirSync(DIR, { recursive: true });
  const tmp = `${file}.${process.pid}.tmp`;
  writeFileSync(tmp, JSON.stringify(encode(data)));
  renameSync(tmp, file);
  return data;
}

/** Borra todas las secciones guardadas. Las acciones de escritura lo llaman para no servir datos viejos. */
export function clearLocalCache() {
  rmSync(DIR, { recursive: true, force: true });
}
