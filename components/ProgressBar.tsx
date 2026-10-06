// Barra de progreso lineal reutilizada (logros, familias de acreditación, Academy).
export default function ProgressBar({ percent, height = "h-1.5", trackClassName = "bg-surface-container" }: { percent: number; height?: string; trackClassName?: string }) {
  return (
    <div className={`w-full ${height} ${trackClassName} rounded-full overflow-hidden`}>
      <div className="h-full bg-secondary rounded-full transition-all" style={{ width: `${Math.min(100, Math.max(0, percent))}%` }} />
    </div>
  );
}
