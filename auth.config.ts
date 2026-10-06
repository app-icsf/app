import type { NextAuthConfig } from "next-auth";

export default {
  pages: { signIn: "/login", error: "/login" },
  session: { strategy: "jwt" },
  providers: [],
  callbacks: {
    authorized({ auth, request }) {
      const { pathname } = request.nextUrl;
      if (pathname.startsWith("/login")) return true;
      if (pathname.startsWith("/credencial/verificar")) return true;
      if (pathname === "/manifest.webmanifest" || pathname === "/sw.js") return true;
      if (pathname.startsWith("/material/")) return true;
      if (/\.(?:png|jpe?g|gif|webp|svg|ico|woff2?|webmanifest)$/i.test(pathname)) return true;
      return !!auth?.user;
    },
    // Tras ingresar, siempre Inicio — no reabrir /mapa ni el callbackUrl previo.
    redirect({ url, baseUrl }) {
      try {
        const u = new URL(url, baseUrl);
        if (u.origin !== new URL(baseUrl).origin) return `${baseUrl}/`;
        if (u.pathname.startsWith("/login") || u.pathname.startsWith("/api/auth")) return u.toString();
      } catch {
        /* ignore */
      }
      return `${baseUrl}/`;
    },
  },
} satisfies NextAuthConfig;
