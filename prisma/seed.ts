// Seed de datos demo. Todo lo que las pantallas muestran como "catálogo" (niveles, temas, categorías de
// evento, alcance territorial, tipos de actividad, competencias, intenciones de contacto) se crea aquí como
// filas reales en BD — nunca como arrays en el código de las pantallas (ver docs/MATRIZ_FUNCIONAL.md).
// Idempotente: usa upsert donde tiene clave natural; se puede re-ejecutar con `npm run db:seed`.
import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";
import { PERMISSIONS, ALL_PERMISSIONS, MEMBER_PERMISSIONS, COUNTRY_REP_PERMISSIONS } from "../lib/constants";
import { resolvePlace } from "../lib/places";

const db = new PrismaClient();
const slugify = (s: string) =>
  s.toLowerCase().normalize("NFD").replace(/[̀-ͯ]/g, "").replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const days = (n: number) => new Date(Date.now() + n * 86400000);
const monthDay = (d: Date) => `${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
const pick = <T,>(arr: T[], n: number) => arr.slice(0, n);

async function main() {
  // ── 1. Permisos y roles ───────────────────────────────────────────────
  for (const [key, description] of Object.entries(PERMISSIONS)) {
    await db.permission.upsert({ where: { key }, update: { description }, create: { key, description, module: key.split(".")[0] } });
  }
  const perms = await db.permission.findMany();
  const byPerm = new Map(perms.map((p) => [p.key, p.id]));
  const adminRole = await db.role.upsert({ where: { key: "admin" }, update: {}, create: { key: "admin", name: "Administrador", isSystem: true, description: "Todos los permisos activos" } });
  const memberRole = await db.role.upsert({ where: { key: "member" }, update: {}, create: { key: "member", name: "Miembro", isSystem: true } });
  const countryRepRole = await db.role.upsert({
    where: { key: "country_rep" },
    update: { name: "Representante por país", description: "Opera el capítulo/país: altas locales, grupos y agenda." },
    create: { key: "country_rep", name: "Representante por país", isSystem: true, description: "Opera el capítulo/país: altas locales, grupos y agenda." },
  });
  for (const key of ALL_PERMISSIONS) await db.rolePermission.upsert({ where: { roleId_permissionId: { roleId: adminRole.id, permissionId: byPerm.get(key)! } }, update: {}, create: { roleId: adminRole.id, permissionId: byPerm.get(key)! } });
  for (const key of MEMBER_PERMISSIONS) await db.rolePermission.upsert({ where: { roleId_permissionId: { roleId: memberRole.id, permissionId: byPerm.get(key)! } }, update: {}, create: { roleId: memberRole.id, permissionId: byPerm.get(key)! } });
  for (const key of COUNTRY_REP_PERMISSIONS) await db.rolePermission.upsert({ where: { roleId_permissionId: { roleId: countryRepRole.id, permissionId: byPerm.get(key)! } }, update: {}, create: { roleId: countryRepRole.id, permissionId: byPerm.get(key)! } });

  // ── 2. Catálogos ───────────────────────────────────────────────────────
  const tierDefs = [
    { key: "certified", name: "Certified", rank: 1, colorKey: "secondary" },
    { key: "master", name: "Master Coach", rank: 2, colorKey: "secondary" },
    { key: "fellow", name: "Fellow", rank: 3, colorKey: "tertiary" },
    { key: "mcc", name: "Fellow MCC", rank: 4, colorKey: "tertiary" },
  ];
  const tier: Record<string, string> = {};
  for (const t of tierDefs) tier[t.key] = (await db.tier.upsert({ where: { key: t.key }, update: t, create: t })).id;

  const topicDefs = ["Oratoria de Alto Impacto", "Liderazgo", "Storytelling", "Coaching Ejecutivo", "Mentoría", "Transformación de Equipos", "Cultura Corporativa", "Liderazgo Femenino", "Neurocoaching", "Comunicación Asertiva", "Facilitación de Diálogos", "IA aplicada a formación"];
  const topic: Record<string, string> = {};
  for (const name of topicDefs) topic[name] = (await db.topic.upsert({ where: { key: slugify(name) }, update: { name }, create: { key: slugify(name), name } })).id;

  const intentDefs: [string, string][] = [
    ["CONNECT_IF", "Preparar una conferencia conjunta"], ["CONNECT_IF", "Necesitas mentoría en oratoria"], ["CONNECT_IF", "Estás de paso y quieres un café"],
    ["OPEN_TO", "Conferencias conjuntas"], ["OPEN_TO", "Participar en podcasts"], ["OPEN_TO", "Mentoría ICSF"], ["OPEN_TO", "Cafés en viajes"],
  ];
  const intent: Record<string, string> = {};
  for (const [kind, name] of intentDefs) intent[name] = (await db.intentTag.upsert({ where: { key: slugify(name) }, update: { kind, name }, create: { kind, key: slugify(name), name } })).id;

  const catDefs = [["keynote", "Keynotes", "podium"], ["masterclass", "Masterclasses", "school"], ["cumbre", "Cumbres ICSF", "groups"], ["mentoria", "Mentorías", "diversity_3"], ["encuentro", "Encuentros", "event"]] as const;
  const cat: Record<string, string> = {};
  for (const [key, name, icon] of catDefs) cat[key] = (await db.eventCategory.upsert({ where: { key }, update: { name, icon }, create: { key, name, icon } })).id;

  const scopeDefs = [["global", "Todo el mundo (18 países miembros)"], ["iberoamerica", "España e Iberoamérica"], ["centroamerica", "México y Centroamérica"], ["andina", "Colombia y Región Andina"], ["cono-sur", "Argentina y Cono Sur"], ["usa", "Estados Unidos / Expansión Global"]] as const;
  const scope: Record<string, string> = {};
  for (const [key, name] of scopeDefs) scope[key] = (await db.scope.upsert({ where: { key }, update: { name }, create: { key, name } })).id;

  const actDefs = ["Conferencia Magistral (Keynote)", "Taller o Masterclass Especializada", "Reunión Capitular ICSF", "Programa de Mentoría In Situ"];
  const activity: Record<string, string> = {};
  for (const name of actDefs) activity[name] = (await db.activityType.upsert({ where: { key: slugify(name) }, update: { name }, create: { key: slugify(name), name } })).id;

  const compDefs: [string, string][] = [
    ["Oratoria de Alto Impacto Plenario", "Dominio escénico en auditorios multitudinarios y modulación prosódica avanzada."],
    ["Storytelling Estratégico para Liderazgo", "Arquitectura de narrativas transformacionales orientadas a comités ejecutivos globales."],
    ["Ética y Código de Honor ICSF", "Compromiso deontológico y apego a los cánones internacionales de divulgación veraz."],
  ];
  const comp: Record<string, string> = {};
  for (const [name, description] of compDefs) comp[name] = (await db.competency.upsert({ where: { key: slugify(name) }, update: { name, description }, create: { key: slugify(name), name, description } })).id;

  // ── 3. Capítulos ───────────────────────────────────────────────────────
  const chapterDefs = [
    { name: "Capítulo México", country: "México", city: "Ciudad de México", lat: 19.43, lng: -99.13, description: "124 ponentes y miembros activos. Sede oficial de simposios iberoamericanos." },
    { name: "Costa Rica", country: "Costa Rica", city: "San José", lat: 9.93, lng: -84.08, description: "Capítulo oficial con 48 miembros certificados." },
    { name: "Colombia", country: "Colombia", city: "Bogotá", lat: 4.71, lng: -74.07, description: "Nodo andino de storytelling y liderazgo." },
    { name: "España", country: "España", city: "Madrid", lat: 40.42, lng: -3.7, description: "Puente ibérico de la federación con Europa." },
  ];
  const chapter: Record<string, string> = {};
  for (const c of chapterDefs) chapter[c.country] = (await db.chapter.upsert({ where: { slug: slugify(c.name) }, update: c, create: { ...c, slug: slugify(c.name) } })).id;

  // ── 4. Usuarios y perfiles ───────────────────────────────────────────
  const adminEmail = (process.env.SEED_ADMIN_EMAIL ?? "admin@icsf.local").toLowerCase();
  const adminPasswordHash = await bcrypt.hash(process.env.SEED_ADMIN_PASSWORD ?? "cambia-esto", 10);
  const memberPasswordHash = await bcrypt.hash(process.env.SEED_MEMBER_PASSWORD ?? "icsf-demo", 10);
  const admin = await db.user.upsert({ where: { email: adminEmail }, update: { passwordHash: adminPasswordHash }, create: { email: adminEmail, name: "Sofía Valenzuela", passwordHash: adminPasswordHash, roleId: adminRole.id } });
  await db.profile.upsert({
    where: { userId: admin.id }, update: { city: "Ciudad de México", country: "México", region: "Ciudad de México", lat: 19.432, lng: -99.133 },
    create: { userId: admin.id, slug: "sofia-valenzuela", title: "Master Speaker", tierId: tier.master, quote: "Construyo puentes entre la oratoria y el liderazgo consciente.", bio: "Directiva de membresía ICSF. Acompaña a la cohorte Master Speaker y coordina el capítulo México.", city: "Ciudad de México", country: "México", region: "Ciudad de México", lat: 19.432, lng: -99.133, chapterId: chapter["México"], birthday: monthDay(days(120)) },
  });

  type Seed = { name: string; email: string; title: string; tier: string; city: string; country: string; region?: string; topics: string[]; bday?: number; mentor?: boolean; role?: string; bio: string; quote?: string };
  const people: Seed[] = [
    { name: "Rodrigo Palacios", email: "rodrigo.palacios", title: "Fellow ICSF · Conferencista Internacional", tier: "mcc", city: "Bogotá", country: "Colombia", topics: ["Liderazgo", "Comunicación Asertiva", "Cultura Corporativa", "Storytelling"], mentor: true, bio: "Conferencista con más de 12 años en escenarios de Iberoamérica. Miembro activo de ICSF desde 2021. Apasionado por la mentoría a nuevas voces y la cocreación de eventos transformadores.", quote: "Inspirar a equipos a liderar desde la autenticidad y el propósito." },
    { name: "Carlos Mendoza", email: "carlos.mendoza", title: "Executive Coach", tier: "certified", city: "Monterrey", region: "Nuevo León", country: "México", topics: ["Coaching Ejecutivo"], bday: 0, bio: "Coach ejecutivo especializado en juntas directivas." },
    { name: "Elena Rostova", email: "elena.rostova", title: "Leadership Coach", tier: "certified", city: "Madrid", country: "España", topics: ["Liderazgo"], bio: "Coach de liderazgo con enfoque en equipos multiculturales." },
    { name: "David Chen", email: "david.chen", title: "Keynote Speaker", tier: "fellow", city: "San Nicolás de los Garza", region: "Nuevo León", country: "México", topics: ["Oratoria de Alto Impacto"], bio: "Autor de 'El Arte de la Conferencia'. Speaker en cumbres internacionales." },
    { name: "Dra. Camila Morales", email: "camila.morales", title: "Fellow · Storytelling & Liderazgo Femenino", tier: "fellow", city: "Bogotá", country: "Colombia", topics: ["Storytelling", "Liderazgo Femenino"], mentor: true, bio: "Investigadora y speaker en liderazgo femenino en Iberoamérica." },
    { name: "Valentina Arismendi", email: "valentina.arismendi", title: "Keynote Speaker · Storytelling Ejecutivo", tier: "fellow", city: "Guadalupe", region: "Nuevo León", country: "México", topics: ["Liderazgo", "Storytelling"], quote: "Ayudo a líderes a convertir ideas complejas en narrativas memorables.", bio: "Mentora certificada de ICSF, especialista en storytelling ejecutivo." },
    { name: "Mateo Fernández", email: "mateo.fernandez", title: "Coach Ejecutivo · Transformación de Equipos", tier: "master", city: "San José", country: "Costa Rica", topics: ["Transformación de Equipos", "Cultura Corporativa"], mentor: true, quote: "Construyendo culturas de confianza y alto rendimiento.", bio: "Master Coach acreditado, facilitador de equipos de alta dirección." },
    { name: "Dra. Claudia Morales", email: "claudia.morales", title: "Presidenta · Capítulo México", tier: "fellow", city: "Guadalupe", region: "Nuevo León", country: "México", topics: ["Oratoria de Alto Impacto", "Neurocoaching"], role: "Presidenta", bio: "Preside el Capítulo México y la cátedra de oratoria estratégica de ICSF Academy." },
    { name: "Lucía Benítez", email: "lucia.benitez", title: "Speaker", tier: "certified", city: "San Nicolás de los Garza", region: "Nuevo León", country: "México", topics: ["Facilitación de Diálogos"], bio: "Speaker emergente del Capítulo México." },
    { name: "Dra. Elena Casares", email: "elena.casares", title: "Comité de Acreditación", tier: "fellow", city: "Madrid", country: "España", topics: ["Ética y Gobernanza".replace("Ética y Gobernanza", "Liderazgo")], role: "Comité", bio: "Preside el comité de acreditación y homologación de ICSF." },
    { name: "Julián Sotomayor", email: "julian.sotomayor", title: "Fellow ICSF", tier: "fellow", city: "Bogotá", country: "Colombia", topics: ["Oratoria de Alto Impacto"], bio: "Fellow evaluador de ponencias magistrales." },
    { name: "Marco Aurelio Reyes", email: "marco.reyes", title: "Coordinador Logístico", tier: "certified", city: "San Nicolás de los Garza", region: "Nuevo León", country: "México", topics: ["Cultura Corporativa"], bio: "Coordina sedes y logística del Capítulo México." },
    { name: "Ana Beltrán", email: "ana.beltran", title: "Coach de Equipos", tier: "certified", city: "Guadalupe", region: "Nuevo León", country: "México", topics: ["Transformación de Equipos"], bio: "Comparte plantillas de seguimiento ejecutivo con la cohorte." },
    { name: "Secretaría ICSF", email: "secretaria", title: "Secretaría ICSF · Concierge", tier: "fellow", city: "Guadalupe", region: "Nuevo León", country: "México", topics: [], bio: "Canal oficial de atención de la Federación." },
  ];

  const profileId: Record<string, string> = {};
  const userId: Record<string, string> = {};
  for (const p of people) {
    const email = `${p.email}@demo.icsf.local`;
    const joinedAt = p.name === "Elena Rostova" ? days(-0.4) : days(-90);
    const u = await db.user.upsert({
      where: { email },
      update: { passwordHash: memberPasswordHash, lastLoginAt: days(-1) },
      create: { email, name: p.name, roleId: memberRole.id, createdAt: joinedAt, passwordHash: memberPasswordHash, lastLoginAt: days(-2) },
    });
    userId[p.name] = u.id;
    const loc = resolvePlace(p.city, p.country, p.region);
    const prof = await db.profile.upsert({
      where: { userId: u.id },
      update: { title: p.title, tierId: tier[p.tier], city: p.city, country: p.country, region: loc?.region ?? p.region, lat: loc?.lat, lng: loc?.lng, chapterId: chapter[p.country], isMentor: !!p.mentor, chapterRole: p.role, bio: p.bio, quote: p.quote },
      create: { userId: u.id, slug: slugify(p.name), title: p.title, tierId: tier[p.tier], city: p.city, country: p.country, region: loc?.region ?? p.region, lat: loc?.lat, lng: loc?.lng, chapterId: chapter[p.country], isMentor: !!p.mentor, chapterRole: p.role, bio: p.bio, quote: p.quote, birthday: p.bday !== undefined ? monthDay(days(p.bday)) : undefined },
    });
    profileId[p.name] = prof.id;
    await db.profileTopic.deleteMany({ where: { profileId: prof.id } });
    for (const t of p.topics) if (topic[t]) await db.profileTopic.create({ data: { profileId: prof.id, topicId: topic[t] } });
  }
  if (userId["Dra. Claudia Morales"]) {
    await db.user.update({ where: { id: userId["Dra. Claudia Morales"] }, data: { roleId: countryRepRole.id } });
  }
  // Intenciones de contacto para un par de perfiles destacados (Descubrir, Perfil)
  for (const [name, tags] of [
    ["Rodrigo Palacios", ["Preparar una conferencia conjunta", "Necesitas mentoría en oratoria", "Estás de paso y quieres un café", "Conferencias conjuntas", "Participar en podcasts", "Mentoría ICSF", "Cafés en viajes"]],
    ["Dra. Camila Morales", ["Preparar una conferencia conjunta", "Conferencias conjuntas", "Mentoría ICSF"]],
    ["Mateo Fernández", ["Necesitas mentoría en oratoria", "Mentoría ICSF", "Cafés en viajes"]],
  ] as [string, string[]][]) {
    for (const t of tags) await db.profileIntentTag.upsert({ where: { profileId_tagId: { profileId: profileId[name], tagId: intent[t] } }, update: {}, create: { profileId: profileId[name], tagId: intent[t] } });
  }
  const adminProfile = await db.profile.findUniqueOrThrow({ where: { userId: admin.id } });

  // Conexiones aceptadas (red de "Sofía") + una pendiente
  for (const name of ["Rodrigo Palacios", "Carlos Mendoza", "Valentina Arismendi", "Dra. Camila Morales"]) {
    await db.connection.upsert({ where: { fromId_toId: { fromId: adminProfile.id, toId: profileId[name] } }, update: { status: "ACCEPTED" }, create: { fromId: adminProfile.id, toId: profileId[name], status: "ACCEPTED" } });
  }
  await db.connection.upsert({ where: { fromId_toId: { fromId: profileId["Mateo Fernández"], toId: adminProfile.id } }, update: {}, create: { fromId: profileId["Mateo Fernández"], toId: adminProfile.id, status: "PENDING" } });

  // ── 5. Comunidades ───────────────────────────────────────────────────
  const communityDefs = [
    { name: "General ICSF", kind: "GENERAL", description: "Diálogos constructivos bajo el Código de Honor y Ética de ICSF." },
    { name: "Capítulo México", kind: "CHAPTER", description: "Muro oficial del Capítulo México." },
    { name: "Storytelling & Oratoria", kind: "TOPIC", description: "Círculo temático de narrativa y oratoria." },
    { name: "Coaches & Mentores", kind: "TOPIC", description: "Espacio de intercambio entre coaches acreditados." },
    { name: "Costa Rica", kind: "CHAPTER", description: "Capítulo oficial de Costa Rica." },
    { name: "IA en Formación", kind: "TOPIC", description: "Grupo temático sobre IA aplicada a la formación de líderes." },
    { name: "Liderazgo y Equipos", kind: "TOPIC", description: "Grupo temático de liderazgo y alto rendimiento." },
  ];
  const community: Record<string, string> = {};
  for (const c of communityDefs) community[c.name] = (await db.community.upsert({ where: { slug: slugify(c.name) }, update: c, create: { ...c, slug: slugify(c.name) } })).id;

  const memberships: [string, string[]][] = [
    ["General ICSF", ["Sofía Valenzuela", "Rodrigo Palacios", "Carlos Mendoza", "Valentina Arismendi"]],
    ["Capítulo México", ["Sofía Valenzuela", "Dra. Claudia Morales", "Rodrigo Palacios", "Lucía Benítez", "Marco Aurelio Reyes"]],
    ["Storytelling & Oratoria", ["Sofía Valenzuela", "Dra. Camila Morales", "Carlos Mendoza"]],
    ["Coaches & Mentores", ["Sofía Valenzuela", "Ana Beltrán", "Mateo Fernández"]],
    ["Costa Rica", ["Mateo Fernández"]],
    ["IA en Formación", ["Sofía Valenzuela"]],
    ["Liderazgo y Equipos", ["Sofía Valenzuela"]],
  ];
  for (const [cname, names] of memberships) {
    for (const n of names) {
      const uid = n === "Sofía Valenzuela" ? admin.id : userId[n];
      await db.communityMember.upsert({ where: { communityId_userId: { communityId: community[cname], userId: uid } }, update: {}, create: { communityId: community[cname], userId: uid, lastReadAt: days(-1) } });
    }
  }

  // Hilos destacados (Inicio + Comunidad)
  const thread1 = await db.post.upsert({
    where: { id: "seed-thread-1" }, update: {},
    create: { id: "seed-thread-1", communityId: community["Storytelling & Oratoria"], authorId: userId["Mateo Fernández"], kind: "THREAD", body: "¿Qué micrófono recomiendan para conferencias en auditorios grandes?", createdAt: days(-2) },
  });
  const thread2 = await db.post.upsert({
    where: { id: "seed-thread-2" }, update: {},
    create: { id: "seed-thread-2", communityId: community["Coaches & Mentores"], authorId: userId["Ana Beltrán"], kind: "THREAD", body: "¿Consejos para dinámicas grupales virtuales interactivas?", createdAt: days(-0.05) },
  });
  for (let i = 0; i < 18; i++) await db.post.upsert({ where: { id: `seed-reply-t1-${i}` }, update: {}, create: { id: `seed-reply-t1-${i}`, parentId: thread1.id, authorId: userId["Mateo Fernández"], kind: "THREAD", body: "Respuesta de la cohorte.", createdAt: days(-1) } });
  for (let i = 0; i < 24; i++) await db.post.upsert({ where: { id: `seed-reply-t2-${i}` }, update: {}, create: { id: `seed-reply-t2-${i}`, parentId: thread2.id, authorId: userId["Ana Beltrán"], kind: "THREAD", body: "Aporte de la comunidad.", createdAt: days(-0.02) } });

  // Publicación (tarjeta "Hoy en ICSF")
  await db.post.upsert({ where: { id: "seed-pub-1" }, update: {}, create: { id: "seed-pub-1", authorId: userId["David Chen"], kind: "PUBLICATION", title: "El Arte de la Conferencia", body: "Nuevo libro sobre oratoria escénica.", createdAt: days(-0.3) } });

  // Muro del Capítulo México con reacciones e hilo
  const wallPost = await db.post.upsert({
    where: { id: "seed-wall-1" }, update: {},
    create: { id: "seed-wall-1", communityId: community["Capítulo México"], authorId: userId["Dra. Claudia Morales"], kind: "CHAPTER_WALL",
      body: "Estimados ponentes del Capítulo México, les comparto que hemos confirmado la sede oficial de nuestro Symposium Iberoamericano 2026 en el Museo Soumaya. Contaremos con sala plenaria acústica para 450 líderes de opinión.",
      createdAt: days(-3) },
  });
  const wallReply1 = await db.post.upsert({
    where: { id: "seed-wall-2" }, update: {},
    create: { id: "seed-wall-2", communityId: community["Capítulo México"], authorId: userId["Rodrigo Palacios"], parentId: wallPost.id, kind: "CHAPTER_WALL",
      body: "Una sede inmejorable, Claudia. ¿Tendremos panel dedicado a la integración de IA en conferencias de liderazgo transformacional? Me gustaría postular un caso práctico con métricas de retención de audiencia.", createdAt: days(-2.7) },
  });
  await db.post.upsert({
    where: { id: "seed-wall-3" }, update: {},
    create: { id: "seed-wall-3", communityId: community["Capítulo México"], authorId: userId["Lucía Benítez"], parentId: wallPost.id, kind: "CHAPTER_WALL",
      body: "¡Excelente iniciativa Rodrigo! Sugiero que abramos un documento colaborativo antes del viernes para registrar los módulos técnicos y requerimientos audiovisuales de cada ponente.", createdAt: days(-2.5) },
  });
  const wallReactions: [string, string, string][] = [[wallPost.id, "Rodrigo Palacios", "👏"], [wallPost.id, "Lucía Benítez", "🇲🇽"], [wallPost.id, "Marco Aurelio Reyes", "💡"], [wallReply1.id, "Lucía Benítez", "🔥"], [wallReply1.id, "Dra. Claudia Morales", "🎯"]];
  for (const [postId, name, emoji] of wallReactions) await db.postReaction.upsert({ where: { postId_userId: { postId, userId: userId[name] } }, update: { emoji }, create: { postId, userId: userId[name], emoji } });

  // Preguntar a la comunidad (2 preguntas de ejemplo con alcance y temas)
  const q1 = await db.post.upsert({ where: { id: "seed-q1" }, update: {}, create: { id: "seed-q1", authorId: userId["Carlos Mendoza"], kind: "QUESTION", scopeId: scope.global, body: "¿Recomendaciones de ejercicios de calentamiento vocal antes de una keynote de 45 minutos?", createdAt: days(-1) } });
  await db.postTopic.upsert({ where: { postId_topicId: { postId: q1.id, topicId: topic["Oratoria de Alto Impacto"] } }, update: {}, create: { postId: q1.id, topicId: topic["Oratoria de Alto Impacto"] } });
  for (let i = 0; i < 6; i++) await db.post.upsert({ where: { id: `seed-q1-r${i}` }, update: {}, create: { id: `seed-q1-r${i}`, parentId: q1.id, authorId: userId["Julián Sotomayor"], kind: "QUESTION", body: "Sugerencia de la red.", createdAt: days(-0.8) } });

  // ── 6. Mensajería ────────────────────────────────────────────────────
  async function directConversation(otherName: string, title?: string, kind = "DIRECT") {
    const id = `seed-conv-${slugify(otherName)}`;
    const conv = await db.conversation.upsert({ where: { id }, update: {}, create: { id, kind, title } });
    for (const uid of [admin.id, userId[otherName]]) await db.conversationMember.upsert({ where: { conversationId_userId: { conversationId: conv.id, userId: uid } }, update: {}, create: { conversationId: conv.id, userId: uid } });
    return conv.id;
  }
  const convRodrigo = await directConversation("Rodrigo Palacios");
  await db.conversationMember.update({ where: { conversationId_userId: { conversationId: convRodrigo, userId: admin.id } }, data: { pinned: true } });
  const rodrigoMsgs: { sender: string; body?: string; kind?: string; dur?: number; url?: string; name?: string; size?: number; mins: number; read?: boolean }[] = [
    { sender: "Rodrigo Palacios", body: "Hola Sofía, un gusto saludarte. Revisé la agenda preliminar para el simposio de liderazgo ético en Bogotá. ¿Pudiste contrastar el orden de los paneles magistrales?", mins: 120 },
    { sender: "Sofía Valenzuela", body: "¡Hola Rodrigo! Sí, justo terminamos de consolidar las observaciones con el comité directivo. Quedamos fascinados con el enfoque de tu ponencia de apertura.", mins: 117 },
    { sender: "Rodrigo Palacios", kind: "VOICE", dur: 48, mins: 114, read: true },
    { sender: "Rodrigo Palacios", body: "Perfecto, me parece ideal reservar los últimos 15 minutos para la ronda de preguntas vivas con el auditorio.", mins: 112 },
    { sender: "Rodrigo Palacios", kind: "FILE", url: "/files/keynote-bogota.pdf", name: "Keynote_Bogota_2026_V4.pdf", size: 2411724, mins: 110 },
    { sender: "Rodrigo Palacios", body: "¿Nos vemos el jueves en el lobby del hotel a las 8:00 AM para la prueba de sonido?", mins: 109 },
  ];
  const uidOf = (n: string) => (n === "Sofía Valenzuela" ? admin.id : userId[n]);
  for (const [i, m] of rodrigoMsgs.entries()) {
    await db.message.upsert({ where: { id: `seed-msg-rodrigo-${i}` }, update: {}, create: { id: `seed-msg-rodrigo-${i}`, conversationId: convRodrigo, senderId: uidOf(m.sender), body: m.body, kind: m.kind ?? "TEXT", durationSec: m.dur, attachmentUrl: m.url, attachmentName: m.name, attachmentSize: m.size, createdAt: days(-m.mins / 1440), readAt: m.read || m.sender === "Sofía Valenzuela" ? days(-m.mins / 1440 + 0.001) : undefined } });
  }
  await db.messageReaction.upsert({ where: { messageId_userId_emoji: { messageId: "seed-msg-rodrigo-4", userId: admin.id, emoji: "👏" } }, update: {}, create: { messageId: "seed-msg-rodrigo-4", userId: admin.id, emoji: "👏" } });
  await db.messageReaction.upsert({ where: { messageId_userId_emoji: { messageId: "seed-msg-rodrigo-4", userId: admin.id, emoji: "💡" } }, update: {}, create: { messageId: "seed-msg-rodrigo-4", userId: admin.id, emoji: "💡" } });

  const convValentina = await directConversation("Valentina Arismendi");
  await db.conversationMember.update({ where: { conversationId_userId: { conversationId: convValentina, userId: admin.id } }, data: { pinned: true } });
  await db.message.upsert({ where: { id: "seed-msg-val-0" }, update: {}, create: { id: "seed-msg-val-0", conversationId: convValentina, senderId: userId["Valentina Arismendi"], kind: "VOICE", durationSec: 48, createdAt: days(-0.6) } });

  const convCarlos = await directConversation("Carlos Mendoza");
  await db.conversationMember.update({ where: { conversationId_userId: { conversationId: convCarlos, userId: admin.id } }, data: { pinned: true } });
  await db.message.upsert({ where: { id: "seed-msg-carlos-0" }, update: {}, create: { id: "seed-msg-carlos-0", conversationId: convCarlos, senderId: userId["Carlos Mendoza"], body: "Nos vemos el martes en el panel de liderazgo sistémico.", createdAt: days(-1) } });

  const convElena = await directConversation("Dra. Elena Casares");
  await db.message.upsert({ where: { id: "seed-msg-elena-0" }, update: {}, create: { id: "seed-msg-elena-0", conversationId: convElena, senderId: userId["Dra. Elena Casares"], body: "El dictamen del nuevo marco de acreditación ha sido homologado satisfactoriamente.", createdAt: days(-2.5) } });

  const convSecretaria = await directConversation("Secretaría ICSF", "Secretaría ICSF Concierge", "CONCIERGE");
  await db.message.upsert({ where: { id: "seed-msg-sec-0" }, update: {}, create: { id: "seed-msg-sec-0", conversationId: convSecretaria, senderId: userId["Secretaría ICSF"], body: "Tu credencial digital anual ha sido renovada y está disponible en tu perfil.", createdAt: days(-4) } });

  const convJulian = await directConversation("Julián Sotomayor");
  await db.message.upsert({ where: { id: "seed-msg-julian-0" }, update: {}, create: { id: "seed-msg-julian-0", conversationId: convJulian, senderId: userId["Julián Sotomayor"], body: "Gracias por tu ponencia magistral, las evaluaciones alcanzaron el 98% de excelencia.", createdAt: days(-7) } });

  const mentores = await db.conversation.upsert({ where: { id: "seed-conv-mentores" }, update: {}, create: { id: "seed-conv-mentores", kind: "GROUP", title: "Salón de Mentores" } });
  for (const n of ["Sofía Valenzuela", "Rodrigo Palacios", "Dra. Camila Morales", "Mateo Fernández"]) {
    const uid = n === "Sofía Valenzuela" ? admin.id : userId[n];
    await db.conversationMember.upsert({ where: { conversationId_userId: { conversationId: mentores.id, userId: uid } }, update: {}, create: { conversationId: mentores.id, userId: uid } });
  }

  // ── 7. Eventos ───────────────────────────────────────────────────────
  const eventDefs = [
    { title: "Cumbre Internacional de Speakers & Coaches 2026", catKey: "cumbre", kind: "HYBRID", start: days(48), location: "Ciudad de México & Online", chapter: "México", capacity: 60, credits: 6, desc: "El encuentro cumbre de conferencistas globales, oratoria de impacto y nuevas pedagogías de liderazgo transformacional." },
    { title: "Masterclass de Storytelling Ejecutivo", catKey: "masterclass", kind: "IN_PERSON", start: days(62), location: "Bogotá, Presencial", chapter: "Colombia", capacity: 8, credits: 3, desc: "Estructuración de discursos de alta influencia para juntas directivas y presentaciones plenarias de alto calibre." },
    { title: "Simposio de Neurocoaching Aplicado", catKey: "cumbre", kind: "HYBRID", start: days(69), location: "Madrid & Live Streaming", chapter: "España", capacity: 200, credits: 4.5, desc: "Evidencia científica sobre hábitos de pensamiento y regulación biológica en líderes corporativos sometidos a alta presión." },
    { title: "Masterclass: Estructura de Discurso para Cumbres", catKey: "masterclass", kind: "ONLINE", start: days(2), location: "Online", chapter: "", capacity: 300, credits: 1.5, desc: "Estrategias avanzadas de síntesis, resonancia de audiencia y modulación escénica internacional." },
    { title: "Encuentro ICSF Bogotá", catKey: "encuentro", kind: "IN_PERSON", start: days(20), location: "Bogotá, Colombia", chapter: "Colombia", capacity: 40, credits: 2, desc: "Encuentro trimestral del nodo andino." },
    { title: "Symposium Iberoamericano 2026", catKey: "cumbre", kind: "IN_PERSON", start: days(35), location: "Museo Soumaya, CDMX", chapter: "México", capacity: 450, credits: 5, desc: "Sala plenaria acústica para 450 líderes de opinión del Capítulo México." },
    { title: "Panel de Liderazgo Sistémico", catKey: "keynote", kind: "IN_PERSON", start: days(-6), location: "Ciudad de México", chapter: "México", capacity: 100, credits: 2, desc: "Panel ya realizado — sirve de historial para créditos CCEU." },
  ];
  const eventId: Record<string, string> = {};
  for (const e of eventDefs) {
    const rec = await db.event.upsert({ where: { slug: slugify(e.title) }, update: {}, create: { slug: slugify(e.title), title: e.title, description: e.desc, kind: e.kind, categoryId: cat[e.catKey], startsAt: e.start, location: e.location, chapterId: e.chapter ? chapter[e.chapter] : null, capacity: e.capacity, ceuCredits: e.credits } });
    eventId[e.title] = rec.id;
  }
  const rsvps: [string, string, string][] = [
    ["Cumbre Internacional de Speakers & Coaches 2026", "Sofía Valenzuela", "GOING"], ["Cumbre Internacional de Speakers & Coaches 2026", "Rodrigo Palacios", "GOING"], ["Cumbre Internacional de Speakers & Coaches 2026", "Valentina Arismendi", "INTERESTED"],
    ["Masterclass de Storytelling Ejecutivo", "Sofía Valenzuela", "INTERESTED"], ["Simposio de Neurocoaching Aplicado", "Sofía Valenzuela", "INTERESTED"],
    ["Panel de Liderazgo Sistémico", "Sofía Valenzuela", "GOING"], ["Panel de Liderazgo Sistémico", "Carlos Mendoza", "GOING"],
  ];
  for (const [title, name, status] of rsvps) {
    const uid = name === "Sofía Valenzuela" ? admin.id : userId[name];
    await db.eventRsvp.upsert({ where: { eventId_userId: { eventId: eventId[title], userId: uid } }, update: { status }, create: { eventId: eventId[title], userId: uid, status, checkedInAt: status === "GOING" && eventDefs.find((e) => e.title === title)!.start < new Date() ? eventDefs.find((e) => e.title === title)!.start : undefined } });
  }
  // Créditos CCEU otorgados por el evento ya realizado
  await db.creditLedger.upsert({ where: { userId_eventId: { userId: admin.id, eventId: eventId["Panel de Liderazgo Sistémico"] } }, update: {}, create: { userId: admin.id, eventId: eventId["Panel de Liderazgo Sistémico"], credits: 2 } });

  await db.eventProposal.upsert({ where: { id: "seed-proposal-1" }, update: {}, create: { id: "seed-proposal-1", userId: userId["Rodrigo Palacios"], title: "IA en conferencias de liderazgo transformacional", description: "Caso práctico con métricas de retención de audiencia.", categoryId: cat.keynote, proposedDate: days(90), status: "PENDING" } });

  // ── 8. Academy ───────────────────────────────────────────────────────
  const prog = await db.program.upsert({ where: { slug: "master-speaker" }, update: {}, create: { slug: "master-speaker", title: "Master Speaker", description: "Acreditación de Excelencia en Oratoria & Liderazgo.", status: "OPEN", modality: "Híbrida", weeks: 12 } });
  await db.program.upsert({ where: { slug: "coaching-ejecutivo" }, update: {}, create: { slug: "coaching-ejecutivo", title: "Coaching Ejecutivo de Alto Impacto", description: "Metodologías transformacionales para juntas directivas y alta dirección.", status: "OPEN", modality: "Híbrida", weeks: 10, validity: "Acreditación ICSF Nivel 3" } });
  await db.program.upsert({ where: { slug: "facilitador-dialogos-eticos" }, update: {}, create: { slug: "facilitador-dialogos-eticos", title: "Facilitador Internacional de Diálogos Éticos", description: "Protocolos de consenso y mediación en entornos corporativos globales.", status: "OPEN", modality: "Virtual", weeks: 8, validity: "Validez Multirregional" } });

  const cohort = await db.cohort.upsert({ where: { id: "seed-cohort-otono" }, update: {}, create: { id: "seed-cohort-otono", programId: prog.id, name: "Cohorte Otoño 2026", startsAt: days(-40) } });

  const moduleDefs = [
    { title: "Fundamentos de Oratoria y Código Ético", summary: "Principios éticos y bases de la oratoria federativa.", lessons: 4 },
    { title: "Comunicación Asertiva y Manejo del Pánico Escénico", summary: "Fisiología vocal y reprogramación escénica.", lessons: 3 },
    { title: "Presencia Escénica y Conexión Corporal", summary: "Lenguaje no verbal en audiencias plenarias.", lessons: 3 },
    { title: "Storytelling & Narrativa Transformacional", summary: "Estructuración de arcos narrativos para auditorios de alta dirección.", lessons: 4 },
    { title: "Diseño de Conferencia Magistral y Ayudas Visuales", summary: "Apertura estimada tras el módulo 4.", lessons: 3 },
    { title: "Práctica Plenaria y Presentación de Evidencia", summary: "Grabación en escenario y simulacro de crisis.", lessons: 2 },
  ];
  const moduleId: string[] = [];
  const lessonId: Record<string, string> = {};
  for (const [i, m] of moduleDefs.entries()) {
    const mod = await db.module.upsert({ where: { id: `seed-mod-${i}` }, update: {}, create: { id: `seed-mod-${i}`, programId: prog.id, position: i + 1, title: m.title, summary: m.summary } });
    moduleId.push(mod.id);
    for (let l = 1; l <= m.lessons; l++) {
      const lid = `seed-mod-${i}-lesson-${l}`;
      await db.lesson.upsert({
        where: { id: lid },
        update: i === 3 && l === 2 ? { videoUrl: "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" } : {},
        create: {
          id: lid, moduleId: mod.id, position: l, title: `${m.title} · Lección ${l}`,
          summary: l === 2 && i === 3 ? "En esta lección aprenderás cómo guiar a tu audiencia a través de los tres actos del discurso de liderazgo, transformando conceptos técnicos en una experiencia memorable y emocionalmente articulada." : undefined,
          minutes: 12 + l * 3,
          videoUrl: i === 3 && l === 2 ? "https://commondatastorage.googleapis.com/gtv-videos-library/sample/BigBuckBunny.mp4" : undefined,
        },
      });
      lessonId[`${i}-${l}`] = lid;
    }
  }
  await db.lessonDownload.upsert({ where: { id: "seed-dl-1" }, update: { url: "/material/arco-narrativo.html" }, create: { id: "seed-dl-1", lessonId: lessonId["3-2"], title: "Plantilla de Arco Narrativo en 3 Actos", kind: "HTML", sizeKb: 12, url: "/material/arco-narrativo.html" } });
  await db.lessonDownload.upsert({ where: { id: "seed-dl-2" }, update: { url: "/material/discurso-ejemplo.html" }, create: { id: "seed-dl-2", lessonId: lessonId["3-2"], title: "Ejemplo de Discurso TEDx Transcrito", kind: "HTML", sizeKb: 8, url: "/material/discurso-ejemplo.html" } });

  const enrollment = await db.academyEnrollment.upsert({ where: { userId_programId: { userId: admin.id, programId: prog.id } }, update: {}, create: { userId: admin.id, programId: prog.id, cohortId: cohort.id, tutorId: userId["Rodrigo Palacios"], startedAt: days(-40) } });
  for (const [i] of moduleDefs.entries()) {
    const status = i < 3 ? "DONE" : i === 3 ? "IN_PROGRESS" : "LOCKED";
    await db.moduleProgress.upsert({ where: { enrollmentId_moduleId: { enrollmentId: enrollment.id, moduleId: moduleId[i] } }, update: { status }, create: { enrollmentId: enrollment.id, moduleId: moduleId[i], status, completedAt: status === "DONE" ? days(-10 * (3 - i)) : null } });
  }
  for (const [i, l] of [[3, 1], [3, 2]]) await db.lessonProgress.upsert({ where: { lessonId_userId: { lessonId: lessonId[`${i}-${l}`], userId: admin.id } }, update: {}, create: { lessonId: lessonId[`${i}-${l}`], userId: admin.id, completedAt: days(-2), lastSecond: 422 } });
  await db.lessonProgress.upsert({ where: { lessonId_userId: { lessonId: lessonId["3-2"], userId: admin.id } }, update: { lastSecond: 422 }, create: { lessonId: lessonId["3-2"], userId: admin.id, lastSecond: 422 } });
  await db.submission.upsert({ where: { id: "seed-sub-1" }, update: {}, create: { id: "seed-sub-1", enrollmentId: enrollment.id, moduleId: moduleId[3], status: "PENDING" } });

  // Debate de la cohorte sobre la lección de storytelling
  const discussion = await db.post.upsert({ where: { id: "seed-lesson-discussion" }, update: {}, create: { id: "seed-lesson-discussion", lessonId: lessonId["3-2"], authorId: userId["Ana Beltrán"], kind: "LESSON_DISCUSSION", body: "El Acto II me costó más: ¿cómo evitar que la tensión se sienta forzada?", createdAt: days(-1) } });
  for (let i = 0; i < 13; i++) await db.post.upsert({ where: { id: `seed-lesson-r${i}` }, update: {}, create: { id: `seed-lesson-r${i}`, parentId: discussion.id, lessonId: lessonId["3-2"], authorId: userId["Carlos Mendoza"], kind: "LESSON_DISCUSSION", body: "Aporte de la cohorte.", createdAt: days(-0.5) } });

  // ── 9. Logros y credencial ───────────────────────────────────────────
  const familyDefs = [
    { slug: "explorador", name: "Explorador", icon: "travel_explore", description: "Viajes, ciudades y países", n: 8, unlocked: 4 },
    { slug: "speaker", name: "Speaker", icon: "podium", description: "Conferencias y escenarios magistrales", n: 10, unlocked: 3 },
    { slug: "conector", name: "Conector", icon: "diversity_3", description: "Networking y relaciones globales", n: 8, unlocked: 5 },
    { slug: "mentor", name: "Mentor", icon: "school", description: "Orientación y transferencia de saber", n: 6, unlocked: 2 },
    { slug: "comunidad", name: "Comunidad", icon: "groups", description: "Bienvenidas, foros y celebraciones", n: 7, unlocked: 4 },
    { slug: "colaborador", name: "Colaborador", icon: "handshake", description: "Proyectos, sinergias y duplas ICSF", n: 6, unlocked: 2 },
  ];
  const exploradorNames = ["Speaker Viajero I", "Pasaporte ICSF", "Orador Internacional", "Speaker en Ruta", "Speaker Viajero II", "Speaker Global", "Trotamundos ICSF", "Rango Honorífico Maestro"];
  for (const f of familyDefs) {
    const fam = await db.achievementFamily.upsert({ where: { slug: f.slug }, update: { name: f.name, icon: f.icon, description: f.description }, create: { slug: f.slug, name: f.name, icon: f.icon, description: f.description } });
    for (let i = 1; i <= f.n; i++) {
      const key = `${f.slug}-${i}`;
      const name = f.slug === "explorador" ? exploradorNames[i - 1] : `${f.name} · Nivel ${i}`;
      const ach = await db.achievement.upsert({ where: { key }, update: { name, tier: i, goal: i }, create: { key, familyId: fam.id, name, tier: i, goal: i } });
      if (i <= f.unlocked) await db.userAchievement.upsert({ where: { userId_achievementId: { userId: admin.id, achievementId: ach.id } }, update: {}, create: { userId: admin.id, achievementId: ach.id, unlockedAt: days(-30 + i * 5) } });
    }
  }

  const travelDefs = [
    { city: "Monterrey", country: "México", act: "Conferencia Magistral (Keynote)", status: "VERIFIED", offset: -300 },
    { city: "Bogotá", country: "Colombia", act: "Conferencia Magistral (Keynote)", status: "VERIFIED", offset: -260 },
    { city: "San José", country: "Costa Rica", act: "Reunión Capitular ICSF", status: "VERIFIED", offset: -200 },
    { city: "Medellín", country: "Colombia", act: "Taller o Masterclass Especializada", status: "VERIFIED", offset: -120 },
    { city: "Lima", country: "Perú", act: "Programa de Mentoría In Situ", status: "PENDING", offset: -3 },
  ];
  for (const [i, t] of travelDefs.entries()) {
    await db.travelLog.upsert({ where: { id: `seed-travel-${i}` }, update: {}, create: { id: `seed-travel-${i}`, userId: admin.id, city: t.city, country: t.country, activityTypeId: activity[t.act], status: t.status, happenedAt: days(t.offset), createdAt: days(t.offset) } });
  }

  const credential = await db.credential.upsert({
    where: { number: "ICSF-CERT-2026-8841" }, update: {},
    create: { userId: admin.id, number: "ICSF-CERT-2026-8841", title: "Master Speaker", status: "ACTIVE", issuedAt: days(-220), expiresAt: days(880), signedByName: "Dr. Arthur Pendelton", signedByRole: "Presidente Consejo Académico ICSF", verifyCode: "ICSF-VERIFY-8841", blockNumber: "19,402" },
  });
  for (const name of Object.keys(comp)) await db.credentialCompetency.upsert({ where: { credentialId_competencyId: { credentialId: credential.id, competencyId: comp[name] } }, update: {}, create: { credentialId: credential.id, competencyId: comp[name] } });

  // ── 10. Notificaciones (campana) ──────────────────────────────────────
  const notifDefs: [string, string, string | undefined, string][] = [
    ["MESSAGE", "Rodrigo Palacios te escribió", "Prueba de sonido el jueves 8:00 AM.", "/mensajes/" + convRodrigo],
    ["EVENT_REMINDER", "Tu evento es en 2 días", "Masterclass: Estructura de Discurso para Cumbres.", "/eventos"],
    ["CREDENTIAL", "Credencial renovada", "Tu credencial digital anual está disponible.", "/yo/credencial"],
    ["ACHIEVEMENT", "¡Logro obtenido!", "Speaker Viajero II — Familia Explorador.", "/yo/logros/explorador"],
    ["COMMUNITY", "Nueva respuesta en tu hilo", "18 respuestas en tu pregunta sobre auditorios grandes.", "/comunidad"],
  ];
  for (const [i, [type, title, body, link]] of notifDefs.entries()) {
    await db.notification.upsert({ where: { id: `seed-notif-${i}` }, update: {}, create: { id: `seed-notif-${i}`, userId: admin.id, type, title, body, link, readAt: i > 2 ? null : days(-1) } });
  }

  console.log(`Seed OK · admin: ${adminEmail} · ${people.length + 1} perfiles · ${eventDefs.length} eventos · ${moduleDefs.length} módulos Master Speaker`);
}
main().finally(() => db.$disconnect());
