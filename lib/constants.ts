// Catálogo de permisos. El portal admin (fase 3) los asigna por rol y por usuario.
// El rol "admin" recibe TODOS automáticamente (ver prisma/seed.ts y lib/access.ts).
export const PERMISSIONS = {
  // Portal admin
  "users.read": "Ver usuarios",
  "users.write": "Crear / editar usuarios y vigencias",
  "users.suspend": "Suspender / revocar accesos",
  "roles.manage": "Gestionar roles y permisos",
  "audit.read": "Ver bitácora de auditoría",
  // App
  "community.post": "Publicar en comunidad",
  "community.moderate": "Moderar comunidad",
  "events.read": "Ver eventos",
  "events.manage": "Crear / editar eventos",
  "messages.send": "Enviar mensajes",
  "directory.read": "Ver directorio y mapa",
  "academy.access": "Acceder a Academy",
  "academy.manage": "Gestionar contenido de Academy",
  "credentials.issue": "Emitir credenciales",
  "travel.review": "Verificar registros de viaje",
} as const;

export type PermissionKey = keyof typeof PERMISSIONS;
export const ALL_PERMISSIONS = Object.keys(PERMISSIONS) as PermissionKey[];

// Permisos base del rol "member"
export const MEMBER_PERMISSIONS: PermissionKey[] = [
  "community.post", "events.read", "messages.send", "directory.read", "academy.access",
];

/** Representante por país: operación local (altas, grupos, agenda, verificación). */
export const COUNTRY_REP_PERMISSIONS: PermissionKey[] = [
  "users.read", "users.write", "community.post", "community.moderate",
  "events.read", "events.manage", "messages.send", "directory.read",
  "academy.access", "travel.review",
];

export const USER_STATUS = ["ACTIVE", "SUSPENDED", "REVOKED"] as const;
export type UserStatus = (typeof USER_STATUS)[number];
