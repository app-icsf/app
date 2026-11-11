import { readSocials, SOCIAL_LABEL, type SocialNetwork } from "@/lib/socials";

function Glyph({ network }: { network: SocialNetwork }) {
  const common = { viewBox: "0 0 24 24", width: 18, height: 18, fill: "currentColor", "aria-hidden": true as const };
  if (network === "linkedin") {
    return (
      <svg {...common}>
        <path d="M6.5 9.5H4V20h2.5V9.5zM5.2 4C4.3 4 3.6 4.7 3.6 5.6s.7 1.6 1.6 1.6 1.6-.7 1.6-1.6S6.2 4 5.2 4zM20 20h-2.5v-5.6c0-1.6-.6-2.6-2-2.6-1 0-1.6.7-1.9 1.4-.1.2-.1.6-.1.9V20H11V9.5h2.4v1.4c.4-.7 1.3-1.7 3.2-1.7 2.3 0 4 1.5 4 4.8V20z" />
      </svg>
    );
  }
  if (network === "instagram") {
    return (
      <svg {...common}>
        <path d="M8 3.5h8A4.5 4.5 0 0 1 20.5 8v8a4.5 4.5 0 0 1-4.5 4.5H8A4.5 4.5 0 0 1 3.5 16V8A4.5 4.5 0 0 1 8 3.5zm8 1.8H8A2.7 2.7 0 0 0 5.3 8v8A2.7 2.7 0 0 0 8 18.7h8a2.7 2.7 0 0 0 2.7-2.7V8A2.7 2.7 0 0 0 16 5.3zM12 8.2A3.8 3.8 0 1 1 8.2 12 3.8 3.8 0 0 1 12 8.2zm0 1.7a2.1 2.1 0 1 0 2.1 2.1A2.1 2.1 0 0 0 12 9.9zM17.2 7.1a.9.9 0 1 1-.9-.9.9.9 0 0 1 .9.9z" />
      </svg>
    );
  }
  if (network === "facebook") {
    return (
      <svg {...common}>
        <path d="M14.2 20v-6.2h2.1l.3-2.4h-2.4V9.9c0-.7.2-1.2 1.2-1.2H16.7V6.6c-.3 0-1.1-.1-2.1-.1-2.1 0-3.5 1.3-3.5 3.6v1.3H9v2.4h2.1V20h3.1z" />
      </svg>
    );
  }
  if (network === "youtube") {
    return (
      <svg {...common}>
        <path d="M21.2 8.2a2.5 2.5 0 0 0-1.8-1.8C17.8 6 12 6 12 6s-5.8 0-7.4.4a2.5 2.5 0 0 0-1.8 1.8A26 26 0 0 0 2.4 12a26 26 0 0 0 .4 3.8 2.5 2.5 0 0 0 1.8 1.8C6.2 18 12 18 12 18s5.8 0 7.4-.4a2.5 2.5 0 0 0 1.8-1.8 26 26 0 0 0 .4-3.8 26 26 0 0 0-.4-3.8zM10.2 14.8V9.2L15.2 12l-5 2.8z" />
      </svg>
    );
  }
  if (network === "tiktok") {
    return (
      <svg {...common}>
        <path d="M14.2 4c.4 2.3 1.7 3.8 3.9 4.1v2.2a6.6 6.6 0 0 1-3.8-1.2v5.6a5.5 5.5 0 1 1-5.5-5.5c.3 0 .6 0 .9.1v2.4a3.2 3.2 0 1 0 2.2 3V4h2.3z" />
      </svg>
    );
  }
  if (network === "x") {
    return (
      <svg {...common}>
        <path d="M16.8 4h2.6l-5.7 6.5L20.5 20h-5.2l-4.1-5.3L6.6 20H4l6.1-7L3.7 4h5.3l3.7 4.9L16.8 4zm-.9 14.4h1.4L8.2 5.5H6.7l9.2 12.9z" />
      </svg>
    );
  }
  return (
    <svg {...common}>
      <path d="M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17zm6.3 5.2h-2.4a13.6 13.6 0 0 0-1.2-3.1 6.7 6.7 0 0 1 3.6 3.1zM12 5.2c.5.7 1.2 2 1.6 3.5H10.4C10.8 7.2 11.5 5.9 12 5.2zM5.7 8.7a6.7 6.7 0 0 1 3.6-3.1 13.6 13.6 0 0 0-1.2 3.1H5.7zM4.8 10.5h2.6a16 16 0 0 0 0 3H4.8a6.8 6.8 0 0 1 0-3zm.9 4.8h2.4a13.6 13.6 0 0 0 1.2 3.1 6.7 6.7 0 0 1-3.6-3.1zM12 18.8c-.5-.7-1.2-2-1.6-3.5h3.2c-.4 1.5-1.1 2.8-1.6 3.5zm3.9-1.6a13.6 13.6 0 0 0 1.2-3.1h2.4a6.7 6.7 0 0 1-3.6 3.1zM16.6 13.5a16 16 0 0 0 0-3h2.6a6.8 6.8 0 0 1 0 3h-2.6z" />
    </svg>
  );
}

export default function SocialLinks({ value }: { value: unknown }) {
  const links = readSocials(value);
  if (links.length === 0) return null;
  return (
    <nav aria-label="Redes profesionales" className="flex flex-wrap items-center justify-center gap-2.5 pt-1">
      {links.map((link) => (
        <a
          key={link.network}
          href={link.url}
          target="_blank"
          rel="noopener noreferrer"
          aria-label={`${SOCIAL_LABEL[link.network]} (abre en otra pestaña)`}
          title={SOCIAL_LABEL[link.network]}
          className="h-10 w-10 rounded-full bg-surface-container-lowest border border-outline-variant/80 text-primary-container shadow-[0_8px_16px_-12px_rgba(14,28,47,0.85)] flex items-center justify-center hover:border-ambassador-gold hover:text-secondary"
        >
          <Glyph network={link.network} />
        </a>
      ))}
    </nav>
  );
}
