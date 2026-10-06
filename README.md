# ICSF App

Prototipo funcional local (app de miembros + portal admin). Plan: [`docs/PLAN.md`](docs/PLAN.md).

```bash
npm install
cp .env.example .env        # AUTH_SECRET, SEED_ADMIN_*, SEED_MEMBER_PASSWORD
npm run db:reset            # SQLite + seed
npm run dev                 # http://localhost:3000
npm run test:access
```

- Login admin: `SEED_ADMIN_EMAIL` / `SEED_ADMIN_PASSWORD` (por defecto `admin@icsf.local`).
- Miembros demo: `rodrigo.palacios@demo.icsf.local` (y el resto `@demo.icsf.local`) con `SEED_MEMBER_PASSWORD` (`icsf-demo`).
- Portal: `/admin` (solo rol admin / `users.read`).
- Sin auto-registro: las altas se hacen en el portal.
- Apple / Google al definir `AUTH_GOOGLE_*` / `AUTH_APPLE_*`.
- Asistente: `OPENAI_API_KEY` y `OPENAI_MODEL` en `.env`. Preguntar responde al momento; publicaciones pasan un prefiltro.
- Publicación: Railway (`railway.toml`). Token opcional en `RAILWAY_TOKEN`.
