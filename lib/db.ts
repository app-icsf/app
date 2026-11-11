import { PrismaClient } from "@prisma/client";

function databaseUrl() {
  const url = process.env.DATABASE_URL;
  if (!url) return url;
  const u = new URL(url);
  // El pooler de sesión (5432) reserva un cliente por conexión y Supabase lo corta en 15.
  // Next abre varias a la vez; el pooler de transacción (6543) las comparte.
  if (u.port === "5432" && u.hostname.includes("pooler.supabase.com")) {
    u.port = "6543";
    u.searchParams.set("pgbouncer", "true");
  }
  if (!u.searchParams.has("connection_limit")) u.searchParams.set("connection_limit", "8");
  return u.toString();
}

const g = globalThis as unknown as { prisma?: PrismaClient };
export const db = g.prisma ?? new PrismaClient({ datasources: { db: { url: databaseUrl() } } });
if (process.env.NODE_ENV !== "production") g.prisma = db;
