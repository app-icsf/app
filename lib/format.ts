// Utilidades de formato compartidas por todas las pantallas (nada de textos calculados a mano en TSX).
export function initials(name: string, max = 2) {
  return name
    .replace(/^(Dra?\.|Sr\.|Sra\.|Mtro\.|Lic\.)\s+/i, "")
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, max)
    .map((w) => w[0]?.toUpperCase())
    .join("");
}

const RTF = new Intl.RelativeTimeFormat("es", { numeric: "auto" });
export function timeAgo(date: Date) {
  const diffMs = date.getTime() - Date.now();
  const abs = Math.abs(diffMs);
  const min = 60000, hr = 3600000, day = 86400000;
  if (abs < min) return "Ahora";
  if (abs < hr) return RTF.format(Math.round(diffMs / min), "minute");
  if (abs < day) return RTF.format(Math.round(diffMs / hr), "hour");
  if (abs < day * 30) return RTF.format(Math.round(diffMs / day), "day");
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "short", year: diffMs < -300 * day ? "numeric" : undefined });
}

export function clockTime(date: Date) {
  return date.toLocaleTimeString("es-MX", { hour: "numeric", minute: "2-digit" });
}

export function dayMonth(date: Date) {
  return { day: date.toLocaleDateString("es-MX", { day: "2-digit" }), month: date.toLocaleDateString("es-MX", { month: "short" }).replace(".", "").toUpperCase() };
}

export function longDate(date: Date) {
  return date.toLocaleDateString("es-MX", { day: "numeric", month: "long", year: "numeric" });
}

export function fileSize(bytes?: number | null) {
  if (!bytes) return "";
  const mb = bytes / (1024 * 1024);
  return mb >= 1 ? `${mb.toFixed(1)} MB` : `${Math.round(bytes / 1024)} KB`;
}

export function pct(n: number, total: number) {
  return total > 0 ? Math.round((n / total) * 100) : 0;
}

export function isBirthdayToday(mmdd: string | null | undefined) {
  if (!mmdd) return false;
  const now = new Date();
  return mmdd === `${String(now.getMonth() + 1).padStart(2, "0")}-${String(now.getDate()).padStart(2, "0")}`;
}
