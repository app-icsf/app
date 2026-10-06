"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

const TABS = [
  { href: "/", icon: "home", label: "Inicio" },
  { href: "/comunidad", icon: "groups", label: "Comunidad" },
  { href: "/mapa", icon: "explore", label: "Mapa" },
  { href: "/descubrir", icon: "category", label: "Descubrir" },
  { href: "/yo", icon: "account_circle", label: "Yo" },
];
const ROOTS = ["/", "/comunidad", "/mapa", "/descubrir", "/yo", "/eventos", "/mensajes", "/academy"];

export default function BottomNav() {
  const path = usePathname();
  if (!ROOTS.includes(path)) return null;
  const active = (h: string) => (h === "/" ? path === "/" : path === h || path.startsWith(h + "/"));
  return (
    <nav className="fixed bottom-0 z-50 pb-safe bg-primary-container/95 backdrop-blur-xl shadow-[0_-2px_12px_rgba(0,0,0,0.18)]">
      <div className="flex justify-around items-center h-20 px-space-xs">
        {TABS.map((t) => {
          const on = active(t.href);
          return (
            <Link key={t.href} href={t.href} aria-current={on ? "page" : undefined}
              className={`flex flex-col items-center justify-center gap-space-xs w-16 h-16 rounded-xl transition-all active:scale-95 ${on ? "text-white bg-[#3C6AFF]" : "text-on-primary-container hover:text-inverse-primary"}`}>
              <span className={`material-symbols-outlined text-[24px] ${on ? "filled" : ""}`}>{t.icon}</span>
              <span className="font-label-sm text-label-sm">{t.label}</span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
