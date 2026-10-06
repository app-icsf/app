"use client";
import { useRouter } from "next/navigation";

export default function BackLink({ label }: { label?: string }) {
  const router = useRouter();
  return (
    <button aria-label="Volver" onClick={() => router.back()} className="w-10 h-10 -ml-2 flex items-center justify-center rounded-full text-inverse-primary hover:text-on-primary transition-colors">
      <span className="material-symbols-outlined text-[22px]">arrow_back</span>
      {label && <span className="sr-only">{label}</span>}
    </button>
  );
}
