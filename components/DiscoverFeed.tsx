"use client";

import Link from "next/link";
import { useEffect, useRef, useState } from "react";
import { sendConnectionRequest } from "@/lib/actions";
import Avatar from "@/components/Avatar";
import TierBadge from "@/components/TierBadge";
import EmptyState from "@/components/EmptyState";

export type DiscoverCard = {
  id: string;
  slug: string;
  title: string | null;
  avatarUrl: string | null;
  city: string | null;
  country: string | null;
  tier: { name: string; colorKey: string } | null;
  user: { name: string };
  topics: { topicId: string; topic: { name: string } }[];
};

export default function DiscoverFeed({ initial, nextOffset, query }: { initial: DiscoverCard[]; nextOffset: number | null; query?: string }) {
  const [items, setItems] = useState(initial);
  const [cursor, setCursor] = useState<number | null>(nextOffset);
  const [loading, setLoading] = useState(false);
  const lock = useRef(false);
  const sentinel = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const el = sentinel.current;
    if (!el || cursor == null) return;
    const observer = new IntersectionObserver((entries) => {
      if (!entries[0]?.isIntersecting || lock.current) return;
      lock.current = true;
      setLoading(true);
      const params = new URLSearchParams({ offset: String(cursor) });
      if (query) params.set("q", query);
      fetch(`/api/descubrir?${params}`)
        .then((res) => {
          if (!res.ok) throw new Error("discover");
          return res.json() as Promise<{ profiles: DiscoverCard[]; nextOffset: number | null }>;
        })
        .then((data) => {
          setItems((prev) => {
            const seen = new Set(prev.map((profile) => profile.id));
            return [...prev, ...data.profiles.filter((profile) => !seen.has(profile.id))];
          });
          setCursor(data.nextOffset);
        })
        .catch(() => setCursor(null))
        .finally(() => {
          lock.current = false;
          setLoading(false);
        });
    }, { rootMargin: "280px" });
    observer.observe(el);
    return () => observer.disconnect();
  }, [cursor, query]);

  return (
    <div className="flex flex-col gap-y-space-md mt-1">
      {items.map((profile) => (
        <article key={profile.id} className="bg-surface-container-lowest rounded-xl p-5 shadow-[0_2px_8px_-2px_rgba(11,25,44,0.06)] border border-border-subtle flex flex-col gap-4">
          <div className="flex items-start gap-3.5">
            <div className="relative flex-shrink-0">
              <Avatar name={profile.user.name} src={profile.avatarUrl} size={64} />
              <span className="absolute -bottom-1 -right-1 w-5 h-5 bg-ambassador-gold text-white rounded-full flex items-center justify-center shadow-xs"><span className="material-symbols-outlined text-[12px]">verified</span></span>
            </div>
            <div className="flex flex-col min-w-0 flex-1">
              <div className="flex items-center justify-between gap-1"><h2 className="font-headline-sm text-headline-sm text-on-surface truncate">{profile.user.name}</h2><TierBadge tier={profile.tier} /></div>
              <div className="flex items-center gap-1 text-on-surface-variant mt-0.5"><span className="material-symbols-outlined text-[14px]">location_on</span><span className="font-body-sm text-body-sm truncate">{[profile.city, profile.country].filter(Boolean).join(", ")}</span></div>
              <p className="font-label-md text-label-md text-on-surface-variant mt-1.5 font-medium leading-snug">{profile.title}</p>
            </div>
          </div>
          {profile.topics.length > 0 && (
            <div className="flex flex-wrap gap-1.5">{profile.topics.map((topic) => <span key={topic.topicId} className="bg-surface-container text-on-surface-variant px-2.5 py-1 rounded-full font-label-sm text-label-sm">#{topic.topic.name.replace(/\s+/g, "")}</span>)}</div>
          )}
          <div className="grid grid-cols-2 gap-2.5">
            <form action={sendConnectionRequest.bind(null, profile.id, "/descubrir")}>
              <button className="w-full h-11 rounded-lg bg-secondary text-on-secondary font-label-md text-label-md">Conectar</button>
            </form>
            <Link href={`/miembros/${profile.slug}`} className="h-11 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center">Ver perfil</Link>
          </div>
        </article>
      ))}
      {items.length === 0 && <EmptyState>Sin resultados para &quot;{query}&quot;.</EmptyState>}
      {cursor != null && <div ref={sentinel} className="h-8 text-center font-label-sm text-label-sm text-outline">{loading ? "Cargando más miembros…" : ""}</div>}
    </div>
  );
}
