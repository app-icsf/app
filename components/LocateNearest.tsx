"use client";
import { useRouter } from "next/navigation";
import { haversineKm } from "@/lib/geo";

type Chapter = { slug: string; lat: number | null; lng: number | null };

export default function LocateNearest({ chapters }: { chapters: Chapter[] }) {
  const router = useRouter();
  return (
    <button
      type="button"
      aria-label="Centrar en mi ubicación"
      className="w-9 h-9 rounded-full bg-surface-container-lowest/95 backdrop-blur-md shadow-sm text-on-surface flex items-center justify-center"
      onClick={() => {
        if (!navigator.geolocation) return;
        navigator.geolocation.getCurrentPosition((pos) => {
          const here = { lat: pos.coords.latitude, lng: pos.coords.longitude };
          const withCoords = chapters.filter((c): c is Chapter & { lat: number; lng: number } => c.lat != null && c.lng != null);
          if (!withCoords.length) return;
          const nearest = withCoords.reduce((best, c) =>
            haversineKm(here, c) < haversineKm(here, best) ? c : best
          );
          router.push(`/mapa?ciudad=${nearest.slug}`);
        });
      }}
    >
      <span className="material-symbols-outlined text-[19px]">my_location</span>
    </button>
  );
}
