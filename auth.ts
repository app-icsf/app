import NextAuth, { type NextAuthConfig } from "next-auth";
import Credentials from "next-auth/providers/credentials";
import Google from "next-auth/providers/google";
import Apple from "next-auth/providers/apple";
import bcrypt from "bcryptjs";
import { z } from "zod";
import authConfig from "./auth.config";
import { db } from "./lib/db";
import { checkAccess, loadPermissions } from "./lib/access";

// ── Capa de autenticación reemplazable ──
// Fase 1: Auth.js + Prisma local. Fase 2: Supabase Auth (signups deshabilitados). La app solo consume
// `auth()` / `getSession()`; nada más importa next-auth directamente.
const REVALIDATE_MS = 5 * 60 * 1000;

const providers: NextAuthConfig["providers"] = [
  Credentials({
    credentials: { email: {}, password: {} },
    async authorize(raw) {
      const p = z.object({ email: z.string().email(), password: z.string().min(1) }).safeParse(raw);
      if (!p.success) return null;
      const u = await db.user.findUnique({ where: { email: p.data.email.toLowerCase() } });
      if (!u?.passwordHash || !(await bcrypt.compare(p.data.password, u.passwordHash))) return null;
      const access = await checkAccess(u.email);
      return access.ok ? { id: u.id, email: u.email, name: u.name } : null;
    },
  }),
];
if (process.env.AUTH_GOOGLE_ID) providers.push(Google);
if (process.env.AUTH_APPLE_ID) providers.push(Apple);

export const { handlers, auth, signIn, signOut } = NextAuth({
  ...authConfig,
  providers,
  callbacks: {
    ...authConfig.callbacks,
    // Google / Apple NO crean usuarios: el correo debe existir, estar activo y vigente.
    async signIn({ user }) {
      if (!user.email) return false;
      const access = await checkAccess(user.email);
      if (!access.ok) return `/login?error=${access.reason}`;
      await db.user.update({ where: { email: user.email.toLowerCase() }, data: { lastLoginAt: new Date() } });
      return true;
    },
    async jwt({ token, user }) {
      const now = Date.now();
      if (user?.email || (token.checkedAt as number | undefined ?? 0) + REVALIDATE_MS < now) {
        const access = await checkAccess((user?.email ?? token.email) as string);
        if (!access.ok) return null; // acceso revocado / vencido → se cierra la sesión
        token.uid = access.user.id;
        token.role = access.user.roleKey;
        token.perms = await loadPermissions(access.user.id);
        token.checkedAt = now;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        (session.user as any).id = token.uid;
        (session.user as any).role = token.role;
        (session.user as any).perms = token.perms;
      }
      return session;
    },
  },
});
