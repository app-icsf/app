/**
 * Actualiza solo las redes profesionales desde el directorio público.
 *   npx tsx --env-file=.env scripts/sync-socials.ts
 */
import { Prisma, PrismaClient } from "@prisma/client";
import { socialsFromHtml } from "../lib/socials";

const db = new PrismaClient();
const ROOT = "https://coaching-federation.com";

async function main() {
  const urls = new Set<string>();
  for (let page = 1; page <= 8; page++) {
    const res = await fetch(`${ROOT}/directorio?page=${page}`, { headers: { "user-agent": "ICSF-app-directory-import" } });
    if (!res.ok) throw new Error(`${res.status} directorio página ${page}`);
    const html = await res.text();
    const found = [...html.matchAll(/\/directorio\/miembro-[a-f0-9]+/g)].map((m) => m[0]);
    if (found.length === 0) break;
    found.forEach((path) => urls.add(path));
  }

  let updated = 0;
  let missing = 0;
  const problems: string[] = [];

  for (const path of urls) {
    const id = path.split("miembro-")[1];
    try {
      const res = await fetch(`${ROOT}${path}`, { headers: { "user-agent": "ICSF-app-directory-import" } });
      if (!res.ok) throw new Error(`${res.status}`);
      const html = await res.text();
      const socials = socialsFromHtml(html);
      const number = html.match(/Número de miembro<\/small><br>([^<]+)/)?.[1]?.trim();
      const byAuth = await db.user.findUnique({ where: { authId: `dir:${id}` }, select: { profile: { select: { id: true } } } });
      const byCredential = !byAuth && number
        ? await db.credential.findUnique({ where: { number }, select: { user: { select: { profile: { select: { id: true } } } } } })
        : null;
      const profileId = byAuth?.profile?.id ?? byCredential?.user.profile?.id;
      if (!profileId) {
        missing++;
        continue;
      }
      await db.profile.update({
        where: { id: profileId },
        data: { socials: socials.length ? socials : Prisma.DbNull },
      });
      updated++;
    } catch (err) {
      problems.push(`${id} · ${err instanceof Error ? err.message.split("\n")[0] : "error"}`);
    }
  }

  const withSocials = await db.profile.count({ where: { socials: { not: Prisma.DbNull } } });
  console.log(JSON.stringify({ paginas: urls.size, updated, missing, withSocials, problems }, null, 2));
}

main().finally(() => db.$disconnect());
