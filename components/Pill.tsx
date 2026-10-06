// Insignia de píldora genérica (estado, distinción, categoría). TierBadge y los chips de estado la reutilizan
// para que todos los "badges" de la app compartan una sola definición visual.
const TONES = {
  secondary: "bg-secondary-container/15 text-secondary",
  amber: "bg-honor-amber-soft text-on-tertiary-fixed-variant",
  neutral: "bg-surface-container text-on-surface-variant",
  error: "bg-error-container text-on-error-container",
} as const;

export default function Pill({ children, tone = "secondary", icon, className = "" }: { children: React.ReactNode; tone?: keyof typeof TONES; icon?: string; className?: string }) {
  return (
    <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full font-label-sm text-label-sm shrink-0 ${TONES[tone]} ${className}`}>
      {icon && <span className="material-symbols-outlined text-[13px]" style={{ fontVariationSettings: "'FILL' 1" }}>{icon}</span>}
      {children}
    </span>
  );
}
