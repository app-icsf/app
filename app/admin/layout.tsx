import Link from "next/link";
import { requirePermission } from "@/lib/session";

const LINKS = [
  { href: "/admin", label: "Resumen" },
  { href: "/admin/usuarios", label: "Usuarios" },
  { href: "/admin/grupos", label: "Grupos" },
  { href: "/admin/propuestas", label: "Propuestas" },
  { href: "/admin/viajes", label: "Viajes" },
  { href: "/admin/eventos", label: "Eventos" },
  { href: "/admin/auditoria", label: "Bitácora" },
];

export default async function AdminLayout({ children }: { children: React.ReactNode }) {
  await requirePermission("users.read");
  return (
    <div className="min-h-screen bg-surface">
      <header className="wide sticky top-0 z-40 bg-primary-container text-on-primary">
        <div className="max-w-5xl mx-auto px-4 h-14 flex items-center justify-between gap-3">
          <p className="font-label-lg">ICSF Admin</p>
          <Link href="/" className="text-label-sm opacity-90">Volver a la app</Link>
        </div>
        <nav className="wide bg-primary-container/80 border-t border-white/10">
          <div className="max-w-5xl mx-auto px-4 flex gap-1 overflow-x-auto">
            {LINKS.map((l) => (
              <Link key={l.href} href={l.href} className="h-10 px-3 flex items-center text-label-sm whitespace-nowrap hover:bg-white/10">
                {l.label}
              </Link>
            ))}
          </div>
        </nav>
      </header>
      <div className="max-w-5xl mx-auto px-4 py-6">{children}</div>
    </div>
  );
}
