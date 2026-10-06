import { initials } from "@/lib/format";

export default function Avatar({ name, size = 40, className = "" }: { name: string; size?: number; className?: string }) {
  return (
    <div style={{ width: size, height: size, fontSize: Math.max(11, size * 0.34) }}
      className={`rounded-full bg-primary-fixed text-on-primary-fixed flex items-center justify-center font-bold shrink-0 ${className}`}>
      {initials(name)}
    </div>
  );
}
