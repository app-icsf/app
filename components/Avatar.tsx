import { initials } from "@/lib/format";

export default function Avatar({ name, src, size = 40, className = "" }: { name: string; src?: string | null; size?: number; className?: string }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element
      <img src={src} alt={name} style={{ width: size, height: size }}
        className={`rounded-full object-cover object-top shrink-0 ${className}`} />
    );
  }
  return (
    <div style={{ width: size, height: size, fontSize: Math.max(11, size * 0.34) }}
      className={`rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold shrink-0 ${className}`}>
      {initials(name)}
    </div>
  );
}
