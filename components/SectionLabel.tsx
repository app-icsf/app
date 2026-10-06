// Encabezado de sección reutilizado en casi todas las pantallas (p.ej. "HOY EN ICSF", "CONVERSACIONES").
export default function SectionLabel({ children, right }: { children: React.ReactNode; right?: React.ReactNode }) {
  return (
    <div className="flex items-center justify-between">
      <h2 className="text-label-md font-label-md uppercase tracking-wider text-on-surface-variant">{children}</h2>
      {right}
    </div>
  );
}
