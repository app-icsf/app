"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useState } from "react";

const ROOTS = ["/", "/comunidad", "/mapa", "/descubrir", "/yo", "/eventos", "/mensajes", "/academy"];
const ITEMS = [
  { href: "/comunidad/publicar", icon: "edit_note", label: "Publicar" },
  { href: "/preguntar", icon: "help", label: "Preguntar" },
  { href: "/eventos/proponer", icon: "event", label: "Proponer evento" },
  { href: "/yo/logros/explorador", icon: "add_location_alt", label: "Check-in de viaje" },
];

export default function CreateFab() {
  const path = usePathname();
  const [open, setOpen] = useState(false);
  if (!ROOTS.includes(path)) return null;
  return (
    <div className="fixed bottom-24 z-40 flex flex-col items-end gap-2" style={{ right: "max(1.25rem, calc((100vw - 480px) / 2 + 1.25rem))" }}>
      {open && (
        <div className="mb-1 flex flex-col gap-1.5 items-end">
          {ITEMS.map((it) => (
            <Link key={it.href + it.label} href={it.href} onClick={() => setOpen(false)}
              className="flex items-center gap-2 h-10 pl-3 pr-4 rounded-full bg-surface-card border border-border-subtle text-on-surface font-label-md text-label-md card-elevated">
              <span className="material-symbols-outlined text-[18px] text-secondary">{it.icon}</span>{it.label}
            </Link>
          ))}
        </div>
      )}
      <button type="button" aria-label="Crear" aria-expanded={open} onClick={() => setOpen((v) => !v)}
        className="w-14 h-14 rounded-full bg-secondary text-on-secondary flex items-center justify-center shadow-[0_10px_25px_-4px_rgba(0,72,225,0.45)] active:scale-95 transition-transform">
        <span className="material-symbols-outlined text-[26px]">{open ? "close" : "add"}</span>
      </button>
    </div>
  );
}
