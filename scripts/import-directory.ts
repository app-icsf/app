/**
 * Copia el directorio público de coaching-federation.com a la base de la app.
 * No asigna contraseña: estos miembros aparecen en el directorio y el mapa,
 * y el alta de acceso sigue haciéndose en el portal.
 *
 *   npx tsx --env-file=.env scripts/import-directory.ts
 */
import { mkdir, writeFile } from "fs/promises";
import path from "path";
import { Prisma, PrismaClient } from "@prisma/client";
import { resolvePlace } from "../lib/places";
import { socialsFromHtml } from "../lib/socials";

const db = new PrismaClient();
const ROOT = "https://coaching-federation.com";
const AVATAR_DIR = path.join(process.cwd(), "public", "avatars");

const COUNTRY_ALIASES: Record<string, string> = {
  mexico: "México",
  méxico: "México",
  "méxico-argentina": "México",
  "mexico-argentina": "México",
  "dominican republic": "República Dominicana",
  colombia: "Colombia",
  "costa rica": "Costa Rica",
  "united states": "Estados Unidos",
  usa: "Estados Unidos",
  "estados unidos": "Estados Unidos",
  "ee. uu.": "Estados Unidos",
  "eeuu": "Estados Unidos",
  spain: "España",
  españa: "España",
  argentina: "Argentina",
  peru: "Perú",
  perú: "Perú",
  chile: "Chile",
  ecuador: "Ecuador",
  panama: "Panamá",
  panamá: "Panamá",
  guatemala: "Guatemala",
  "republica dominicana": "República Dominicana",
  "república dominicana": "República Dominicana",
  venezuela: "Venezuela",
  uruguay: "Uruguay",
  paraguay: "Paraguay",
  bolivia: "Bolivia",
  brasil: "Brasil",
  brazil: "Brasil",
  canada: "Canadá",
  canadá: "Canadá",
  italia: "Italia",
  france: "Francia",
  francia: "Francia",
  germany: "Alemania",
  alemania: "Alemania",
  "united kingdom": "Reino Unido",
  "reino unido": "Reino Unido",
};

function decode(html: string) {
  return html
    .replace(/<br\s*\/?>/gi, "\n")
    .replace(/<[^>]+>/g, "")
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .replace(/&nbsp;/g, " ")
    .replace(/\u00a0/g, " ");
}

function norm(s: string) {
  return s.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/\s+/g, " ").trim();
}

function slugify(s: string) {
  return norm(s).replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || "miembro";
}

function titleCase(s: string) {
  const small = new Set(["de", "del", "la", "las", "los", "y", "e"]);
  return s
    .toLowerCase()
    .split(/\s+/)
    .map((w, i) => (i > 0 && small.has(w) ? w : w.charAt(0).toUpperCase() + w.slice(1)))
    .join(" ");
}

function countryName(raw: string) {
  const clean = raw.replace(/\s+/g, " ").trim();
  return COUNTRY_ALIASES[norm(clean)] ?? clean;
}

function block(html: string, id: string) {
  const start = html.search(new RegExp(`id="${id}"[^>]*>`));
  if (start < 0) return "";
  const rest = html.slice(start);
  const end = rest.search(/<div[^>]+id="(?!${id})|<\/section>/);
  return rest.slice(0, end > 0 ? end : 2500);
}

async function get(url: string) {
  const res = await fetch(url, { headers: { "user-agent": "ICSF-app-directory-import" } });
  if (!res.ok) throw new Error(`${res.status} ${url}`);
  return res;
}

function parseMember(html: string, sourceUrl: string) {
  const h1 = decode(html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/)?.[1] ?? "");
  const [rawName, rawCountry] = h1.split("|").map((s) => s.trim());
  const name = (rawName || "Miembro ICSF").replace(/\s+/g, " ");
  const role = decode(html.match(/<div class="role">([\s\S]*?)<\/div>/)?.[1] ?? "").replace(/\s+/g, " ").trim();
  const portrait = html.match(/<img class="portrait" src="([^"]+)"/)?.[1] ?? null;
  const badge = decode(html.match(/<span class="badge[^"]*">([\s\S]*?)<\/span>/)?.[1] ?? "Activo").trim();
  const number = decode(html.match(/Número de miembro<\/small><br>([^<]+)/)?.[1] ?? "").trim();
  const vigencia = decode(html.match(/Vigencia<\/small><br>([^<]+)/)?.[1] ?? "").trim();
  const membership = decode(html.match(/Tipo de membresía<\/small><br>([^<]+)/)?.[1] ?? "").trim();
  const fact = html.match(/class="fact">⌖[\s\S]*?<b>([\s\S]*?)<\/b>/)?.[1] ?? "";
  const factLines = decode(fact).split("\n").map((s) => s.trim()).filter(Boolean);
  let city = factLines[0] ? titleCase(factLines[0]) : null;
  let country = countryName(factLines[1] || rawCountry || "");
  if (city && norm(city) === norm(country)) city = null;
  const sobre = decode(block(html, "sobre").replace(/^[\s\S]*?<p class="prose">/, "").split("</p>")[0] ?? "").replace(/\n{3,}/g, "\n\n").trim();
  const chips = [...html.matchAll(/<span class="chip">([\s\S]*?)<\/span>/g)].map((m) => decode(m[1]).replace(/\s+/g, " ").trim()).filter(Boolean);
  const id = sourceUrl.split("miembro-")[1]?.replace(/\/$/, "") ?? slugify(name);
  const socials = socialsFromHtml(html);
  return { id, sourceUrl, name, role, portrait, badge, number, vigencia, membership, city, country: country || null, sobre, chips, socials };
}

function extOf(buf: Buffer) {
  if (buf[0] === 0xff && buf[1] === 0xd8) return "jpg";
  if (buf[0] === 0x89 && buf[1] === 0x50) return "png";
  if (buf.slice(0, 4).toString() === "RIFF") return "webp";
  return "img";
}

async function main() {
  const role = await db.role.findUnique({ where: { key: "member" } });
  if (!role) throw new Error("Falta el rol member. Corre el seed de catálogos primero.");
  const chapters = await db.chapter.findMany();
  const chapterByCountry = new Map(chapters.map((c) => [norm(c.country), c]));
  await mkdir(AVATAR_DIR, { recursive: true });

  const urls = new Set<string>();
  for (let page = 1; page <= 8; page++) {
    const res = await get(`${ROOT}/directorio?page=${page}`);
    const html = await res.text();
    const found = [...html.matchAll(/\/directorio\/miembro-[a-f0-9]+/g)].map((m) => `${ROOT}${m[0]}`);
    if (found.length === 0) break;
    found.forEach((u) => urls.add(u));
  }

  let created = 0;
  let updated = 0;
  let skipped = 0;
  const countries = new Map<string, number>();
  const problems: string[] = [];

  for (const url of urls) {
    try {
      const html = await (await get(url)).text();
      const m = parseMember(html, url);
      if (m.number === "M-8259EA96F37E" || m.id.startsWith("8259ea96")) {
        skipped++;
        continue;
      }
      const place = m.city || m.country ? resolvePlace(m.city, m.country, null) : null;
      const country = place?.country ?? m.country;
      const city = place?.city ?? m.city;
      const region = place?.region ?? null;
      if (country) countries.set(country, (countries.get(country) ?? 0) + 1);

      let chapterId: string | undefined;
      if (country) {
        const key = norm(country);
        let chapter = chapterByCountry.get(key);
        if (!chapter) {
          chapter = await db.chapter.create({
            data: {
              slug: `capitulo-${slugify(country)}`,
              name: `Capítulo ${country}`,
              country,
              city: city ?? undefined,
              lat: place?.lat,
              lng: place?.lng,
            },
          });
          chapterByCountry.set(key, chapter);
        }
        chapterId = chapter.id;
      }

      let avatarUrl: string | null = null;
      if (m.portrait) {
        const img = Buffer.from(await (await get(m.portrait)).arrayBuffer());
        const ext = extOf(img);
        const file = `dir-${m.id}.${ext}`;
        await writeFile(path.join(AVATAR_DIR, file), img);
        avatarUrl = `/avatars/${file}`;
      }

      const email = `m-${m.id}@directorio.icsf.local`;
      const authId = `dir:${m.id}`;
      const active = /activ/i.test(m.badge) && !/inactiv/i.test(m.badge);
      const validUntil = /^\d{4}-\d{2}-\d{2}$/.test(m.vigencia) ? new Date(`${m.vigencia}T23:59:59.000Z`) : null;
      const existing = await db.user.findUnique({ where: { authId }, include: { profile: true } });
      const user = existing
        ? await db.user.update({
            where: { id: existing.id },
            data: { name: m.name, status: active ? "ACTIVE" : "SUSPENDED", validUntil },
          })
        : await db.user.create({
            data: { email, authId, name: m.name, roleId: role.id, status: active ? "ACTIVE" : "SUSPENDED", validUntil },
          });

      const baseSlug = slugify(m.name);
      let slug = existing?.profile?.slug ?? baseSlug;
      if (!existing?.profile) {
        const clash = await db.profile.findUnique({ where: { slug } });
        if (clash) slug = `${baseSlug}-${m.id.slice(0, 4)}`;
      }
      const profile = await db.profile.upsert({
        where: { userId: user.id },
        update: {
          title: m.role || m.membership || null,
          bio: m.sobre || null,
          city,
          country,
          region,
          lat: place?.lat,
          lng: place?.lng,
          avatarUrl,
          chapterId,
          socials: m.socials.length ? m.socials : Prisma.DbNull,
        },
        create: {
          userId: user.id,
          slug,
          title: m.role || m.membership || null,
          bio: m.sobre || null,
          city,
          country,
          region,
          lat: place?.lat,
          lng: place?.lng,
          avatarUrl,
          chapterId,
          socials: m.socials.length ? m.socials : Prisma.DbNull,
        },
      });

      if (m.number) {
        const cred = await db.credential.findUnique({ where: { number: m.number } });
        if (!cred) {
          await db.credential.create({
            data: {
              userId: user.id,
              number: m.number,
              title: m.membership || "Miembro",
              status: active ? "ACTIVE" : "EXPIRED",
              expiresAt: validUntil,
              verifyCode: `ICSF-${m.id.slice(0, 12).toUpperCase()}`,
            },
          });
        } else if (cred.userId === user.id) {
          await db.credential.update({
            where: { id: cred.id },
            data: { title: m.membership || cred.title, status: active ? "ACTIVE" : "EXPIRED", expiresAt: validUntil },
          });
        }
      }

      await db.profileTopic.deleteMany({ where: { profileId: profile.id } });
      for (const chip of m.chips.slice(0, 8)) {
        const key = slugify(chip);
        const topic = await db.topic.upsert({ where: { key }, update: { name: chip }, create: { key, name: chip } });
        await db.profileTopic.create({ data: { profileId: profile.id, topicId: topic.id } });
      }

      existing ? updated++ : created++;
    } catch (err) {
      problems.push(`${url} · ${err instanceof Error ? err.message.split("\n")[0] : "error"}`);
    }
  }

  console.log(JSON.stringify({ paginas: urls.size, created, updated, skipped, countries: Object.fromEntries(countries), problems }, null, 2));
}

main().finally(() => db.$disconnect());
