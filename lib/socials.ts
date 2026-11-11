export const SOCIAL_ORDER = ["linkedin", "instagram", "facebook", "youtube", "tiktok", "x", "website"] as const;

export type SocialNetwork = (typeof SOCIAL_ORDER)[number];

export type SocialLink = { network: SocialNetwork; url: string };

export const SOCIAL_LABEL: Record<SocialNetwork, string> = {
  linkedin: "LinkedIn",
  instagram: "Instagram",
  facebook: "Facebook",
  youtube: "YouTube",
  tiktok: "TikTok",
  x: "X",
  website: "Sitio web",
};

function decode(value: string) {
  return value
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#0?39;|&apos;/g, "'")
    .trim();
}

function networkOf(hostname: string): SocialNetwork {
  const host = hostname.replace(/^www\./, "").toLowerCase();
  if (host === "instagram.com" || host.endsWith(".instagram.com")) return "instagram";
  if (host === "facebook.com" || host.endsWith(".facebook.com") || host === "fb.com" || host.endsWith(".fb.com") || host === "fb.me") return "facebook";
  if (host.endsWith("linkedin.com")) return "linkedin";
  if (host === "tiktok.com" || host.endsWith(".tiktok.com")) return "tiktok";
  if (host === "youtube.com" || host.endsWith(".youtube.com") || host === "youtu.be") return "youtube";
  if (host === "x.com" || host === "twitter.com" || host.endsWith(".twitter.com")) return "x";
  return "website";
}

/** Lee el bloque «Redes profesionales» de una ficha del directorio público. */
export function socialsFromHtml(html: string): SocialLink[] {
  const block = html.match(/REDES PROFESIONALES<\/div>([\s\S]*?)<\/aside>/)?.[1] ?? "";
  const found = new Map<SocialNetwork, string>();
  for (const match of block.matchAll(/<a href="([^"]+)"[^>]*>/g)) {
    let url: URL;
    try {
      url = new URL(decode(match[1]));
    } catch {
      continue;
    }
    if (url.protocol !== "http:" && url.protocol !== "https:") continue;
    const network = networkOf(url.hostname);
    if (found.has(network)) continue;
    found.set(network, url.toString());
  }
  return SOCIAL_ORDER.filter((network) => found.has(network)).map((network) => ({ network, url: found.get(network)! }));
}

export function readSocials(value: unknown): SocialLink[] {
  if (!Array.isArray(value)) return [];
  const found = new Map<SocialNetwork, string>();
  for (const item of value) {
    if (!item || typeof item !== "object") continue;
    const network = (item as { network?: unknown }).network;
    const url = (item as { url?: unknown }).url;
    if (typeof network !== "string" || typeof url !== "string") continue;
    if (!SOCIAL_ORDER.includes(network as SocialNetwork)) continue;
    try {
      const parsed = new URL(url);
      if (parsed.protocol !== "http:" && parsed.protocol !== "https:") continue;
      if (!found.has(network as SocialNetwork)) found.set(network as SocialNetwork, parsed.toString());
    } catch {
      continue;
    }
  }
  return SOCIAL_ORDER.filter((network) => found.has(network)).map((network) => ({ network, url: found.get(network)! }));
}
