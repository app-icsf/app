import Image from "next/image";
import Link from "next/link";
import HeaderBell from "./HeaderBell";
import HeaderChat from "./HeaderChat";

export default function RootHeader({ userId, label, showSearch = false }: { userId: string; label: string; showSearch?: boolean }) {
  return (
    <header className="fixed top-0 inset-x-0 z-50 bg-primary-container/95 backdrop-blur-xl pt-safe">
      <div className="h-16 px-margin flex items-center justify-between gap-space-sm">
        <div className="flex items-center gap-space-sm min-w-0">
          <Image src="/logo-icsf.png" alt="ICSF" width={96} height={32} className="h-10 w-auto object-contain rounded-lg shrink-0" priority />
          <span className="text-inverse-primary font-label-sm text-label-sm truncate tracking-wider uppercase">{label}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          {showSearch && (
            <Link href="/buscar" aria-label="Buscar" className="w-11 h-11 flex items-center justify-center rounded-full text-inverse-primary hover:text-on-primary transition-colors">
              <span className="material-symbols-outlined text-[22px]">search</span>
            </Link>
          )}
          <HeaderChat userId={userId} />
          <HeaderBell userId={userId} />
          <Link href="/yo" className="w-8 h-8 rounded-full bg-honor-amber-soft flex items-center justify-center shrink-0 ml-1 ring-1 ring-ambassador-gold/30" aria-label="Mi perfil">
            <span className="material-symbols-outlined filled text-ambassador-gold text-[18px]">person</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
