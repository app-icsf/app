# ICSF App — Plan de implementación

> Estado: **producto miembro + admin listos para piloto** (Next.js, Prisma/Postgres, Auth.js sin auto-registro, UX Global Luminary).
> Infra pendiente de nube: FCM, Storage real, Realtime, Railway. GitHub: `https://github.com/app-icsf/app.git` (publicar cuando lo pidas).

## 1. Stack

| Capa | Hoy (local) | Siguiente (nube) |
|---|---|---|
| App | Next.js 15 + Tailwind, PWA (manifest) | Capacitor si se publica en tiendas |
| Datos | Prisma + SQLite | Postgres / Supabase |
| Auth | Auth.js, sin auto-registro | Supabase Auth, signups OFF |
| Chat | persistido + refresh cada 4 s | Realtime |
| Push | centro in-app | FCM |
| Admin | `/admin` en este repo | igual, con RLS |

## 2. Qué está listo

Login, inicio, comunidad, mapa (lat/lng + búsqueda + GPS), descubrir/perfil (conectar / aceptar), mensajes, eventos (RSVP, ICS, propuestas), preguntar, Academy (inscripción, video, completar lección), logros, viajes, credencial verificable, notificaciones, búsqueda, edición de perfil, FAB de creación, portal admin (altas, vigencia, suspender, propuestas, viajes, eventos, emitir credencial, bitácora).

Criterio de salida fase 1: flujo navegable con BD y permisos en las acciones relevantes.

## 3. Acceso

Sin auto-registro. Alta solo desde `/admin`. Vigencia y suspensión cierran la sesión en ≤ 5 min. Demo: `admin@icsf.local` (ver `.env`) y miembros `*@demo.icsf.local` / contraseña `icsf-demo`.

## 4. Pendiente fuera de este prototipo

Supabase, Storage de archivos reales, FCM, llamadas, notas de voz, pagos, asistente OpenAI en Preguntar, blockchain. Las 37 dudas de `MATRIZ_FUNCIONAL.md` se resolvieron con defaults de producto en el prototipo (ciudad no GPS exacto; chat de texto; credencial con registro propio; PDF vía imprimir). El despliegue de la app es Railway (`railway.toml`).
