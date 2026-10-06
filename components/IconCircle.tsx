// Círculo con ícono centrado, reutilizado como avatar de comunidad/capítulo, familia de logros, etc.
// (distinto de <Avatar/>, que muestra iniciales de una persona).
const TONES: Record<string, string> = {
  primary: "bg-primary-container text-inverse-on-surface",
  secondary: "bg-secondary-container/15 text-secondary",
  neutral: "bg-surface-container-high text-on-surface",
};

export default function IconCircle({ icon, tone = "secondary", size = 44 }: { icon: string; tone?: keyof typeof TONES; size?: number }) {
  return (
    <div style={{ width: size, height: size }} className={`rounded-full flex items-center justify-center shrink-0 ${TONES[tone]}`}>
      <span className="material-symbols-outlined" style={{ fontSize: size * 0.45 }}>{icon}</span>
    </div>
  );
}
