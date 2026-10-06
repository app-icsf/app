# Modelo de datos — fase 1b (todo dinámico, cero hardcodeo)

Esquema completo: [`prisma/schema.prisma`](../prisma/schema.prisma). Datos demo: [`prisma/seed.ts`](../prisma/seed.ts).
Cada consulta de pantalla vive en [`lib/data.ts`](../lib/data.ts) (una función por pantalla); cada acción de
botón (RSVP, unirse, conectar, enviar mensaje, reaccionar, marcar lección, registrar viaje, preguntar,
proponer evento, notificaciones) vive en [`lib/actions.ts`](../lib/actions.ts) como server action de Next.js.

## Qué cambió respecto al prototipo visual

Todo lo que en el diseño se veía como una lista fija (niveles de acreditación, temas/hashtags, categorías de
evento, alcance territorial de una pregunta, tipos de actividad de viaje, competencias de la credencial,
intenciones de contacto) ahora es una **tabla catálogo** en SQLite, sembrada por `prisma/seed.ts` y lista para
editarse desde el portal admin en fase 3 — no hay arrays de texto dentro de los componentes de pantalla.

| Catálogo | Tabla | Ejemplo sembrado |
|---|---|---|
| Niveles de acreditación | `Tier` | Certified, Master Coach, Fellow, Fellow MCC |
| Especialidades / hashtags | `Topic` | Storytelling, Coaching Ejecutivo, IA aplicada... |
| Categorías de evento | `EventCategory` | Keynotes, Masterclasses, Cumbres, Mentorías |
| Alcance territorial | `Scope` | Iberoamérica, Andina, Cono Sur... |
| Tipo de actividad (viajes) | `ActivityType` | Keynote, Taller, Reunión Capitular, Mentoría In Situ |
| Competencias de credencial | `Competency` | Oratoria de Alto Impacto, Storytelling Estratégico... |
| Intenciones de contacto | `IntentTag` | "Conecta conmigo si...", "Estoy abierto a..." |

## Pantalla → datos

| Pantalla | Lectura (`lib/data.ts`) | Escritura (`lib/actions.ts`) |
|---|---|---|
| Inicio `/` | `getHomeFeed` — cumpleaños de hoy, miembro nuevo, última publicación, hilos destacados, próximo evento, sugerencia por tema/capítulo en común | `celebrate`, `toggleRsvp` |
| Comunidad `/comunidad` | `getCommunityHome` — mis comunidades con último mensaje, comunidades por descubrir | `joinCommunity` |
| Muro de comunidad `/comunidad/[slug]` | `getChapterWall` — hilos, respuestas anidadas, reacciones | `postToChapterWall`, `reactToPost`, `joinCommunity` |
| Mapa `/mapa` | `getMapData` / `getChapterDetail` — capítulos con conteo real de miembros y eventos próximos | — |
| Descubrir `/descubrir` | `getDiscoverProfiles` — búsqueda por nombre/ciudad/título | `sendConnectionRequest` |
| Perfil `/miembros/[slug]` | `getProfileBySlug` — bio, temas, intenciones, estado de conexión | `sendConnectionRequest` |
| Mensajes `/mensajes`, `/mensajes/[id]` | `getConversations`, `getConversation` — no leídos calculados por `lastReadAt` | `sendChatMessage`, `markConversationRead` |
| Eventos `/eventos`, `/eventos/proponer` | `getEvents` — RSVP y cupo real | `toggleRsvp`, `proposeEvent` |
| Preguntar `/preguntar` | `getQuestionCatalog` | `postQuestion` |
| Academy `/academy`, `/academy/ruta`, `/academy/leccion/[id]` | `getAcademyHome`, `getProgramRoute`, `getLesson` — progreso por módulo e inscripción real | `markLessonComplete` |
| Logros `/yo`, `/yo/logros/[slug]`, `/yo/logros/desbloqueado/[id]` | `getAchievementsHome`, `getAchievementFamily`, `getLatestUnlock` | `submitTravelLog` |
| Credencial `/yo/credencial`, `/credencial/verificar/[code]` | `getCredential`, `getCredentialByVerifyCode` (pública, sin sesión) | — |
| Notificaciones `/notificaciones` | `getNotifications` | `markNotificationsRead` |
| Búsqueda `/buscar` | `globalSearch` (personas, eventos, publicaciones) | — |

## Rutas dinámicas (nada de slugs fijos)

`miembros/[slug]`, `comunidad/[slug]`, `mensajes/[id]`, `academy/leccion/[id]`, `yo/logros/[slug]`,
`yo/logros/desbloqueado/[id]`, `credencial/verificar/[code]`. El botón "Mensaje" de un perfil pasa por
`/mensajes/nuevo?a=<userId>`, que busca o crea la conversación real entre los dos usuarios antes de redirigir
— nunca apunta a un chat fijo.

## Rendimiento (carga ágil)

- SQLite local + Prisma: consultas del orden de milisegundos; cada pantalla dispara sus lecturas en paralelo
  con `Promise.all` (ver `lib/data.ts`).
- `React.cache()` en `getMyProfile` evita repetir la misma consulta de sesión dentro de un mismo request.
- Índices explícitos en las claves de consulta frecuente (`Post(communityId, createdAt)`,
  `Message(conversationId, createdAt)`, `Event(startsAt)`, `Profile(chapterId)`, `TravelLog(userId, status)`, etc.)
- Cada acción revalida solo la ruta que cambió (`revalidatePath`), no toda la app.
- Fase 2 (Supabase/Postgres): los mismos índices se trasladan; añadir `pgvector` solo si se implementa
  búsqueda semántica (ver matriz de IA en `docs/MATRIZ_FUNCIONAL.md`).

## Cómo volver a sembrar

```bash
npm run db:reset     # borra dev.db, vuelve a crear el esquema y siembra datos demo
npm run db:studio    # explorador visual de las tablas (Prisma Studio)
```

`npm run db:reset` pide confirmación cuando lo ejecuta un agente (borra datos); en tu terminal corre directo.

## Componentes reutilizables (`components/`)

Ningún patrón visual repetido vive duplicado en dos pantallas — está en un componente:

| Componente | Reemplaza / centraliza |
|---|---|
| `RootHeader` / `DetailHeader` | Cabecera de las 5 pantallas raíz vs. cabecera de pantallas de detalle |
| `Avatar` | Círculo con iniciales de una persona (todas las listas de personas) |
| `IconCircle` | Círculo con ícono (comunidad, capítulo, familia de logro, remitente institucional) |
| `TierBadge` / `Pill` | `TierBadge` es un `Pill` especializado en el nivel de acreditación; `Pill` cubre el resto de insignias de estado (Acreditado, propuesta en revisión/aprobada, viaje verificado/en revisión) |
| `SectionLabel` | Encabezado de sección en mayúsculas (~20 apariciones: "Hoy en ICSF", "Conversaciones", "Mis Comunidades"...) |
| `EmptyState` | Texto de "sin resultados / sin actividad" (comunidad, mensajes, descubrir, buscar, notificaciones, eventos, academy) |
| `ProgressBar` | Barra de progreso lineal (familias de logros, Academy) |
| `FeedCard` | Las tres tarjetas del carrusel "Hoy en ICSF" (cumpleaños, nuevo miembro, publicación) |
| `MessageComposer` | Barra de envío de texto, compartida entre el muro de comunidad y el chat directo |
| `ScrollToBottom` | Ancla que lleva el chat al último mensaje |
| `BackLink`, `HeaderBell`, `SignOutButton` | Piezas pequeñas de navegación/sesión |

**Excepción documentada:** los mapas `ICONS`/`TONES` que traducen un `kind`/`type` interno del propio esquema
(p.ej. `Community.kind`, `Notification.type`) a un glifo son lógica de presentación sobre un enum de código,
no contenido editable por el admin — a diferencia de los catálogos (`Tier`, `Topic`, `EventCategory`...), que sí
viven enteros en BD.

## Correcciones de esta revisión

- El botón "Ver huella y trayectoria" en el perfil de un miembro apuntaba siempre a **tu propia** página de
  logros (`/yo/logros/explorador`), sin importar de quién fuera el perfil. Ahora solo se muestra al ver tu
  propio perfil (aún no existe una vista pública de logros de otra persona — ver duda D16 en la matriz).
- Los botones "Me interesa" / "Asistiré" ahora muestran explícitamente la acción de deshacer ("Ya no me
  interesa", "Cancelar asistencia") en vez de solo un `✓` ambiguo.
- `getMyProfile` en `/yo` estaba pidiéndose pero no se usaba (consulta muerta); ahora alimenta la insignia de
  nivel real del usuario en vez de un texto fijo "Acreditado".
