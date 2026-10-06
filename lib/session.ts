import { auth } from "@/auth";
import { redirect } from "next/navigation";
import type { PermissionKey } from "./constants";

/** Único punto de entrada a la sesión. En fase 2 se reimplementa sobre Supabase Auth sin tocar las pantallas. */
export async function getSession() {
  const s = await auth();
  return s?.user ?? null;
}
export async function requireUser() {
  const u = await getSession();
  if (!u) redirect("/login");
  return u;
}
export async function requirePermission(p: PermissionKey) {
  const u = await requireUser();
  if (!u.perms.includes(p)) redirect("/?error=forbidden");
  return u;
}
