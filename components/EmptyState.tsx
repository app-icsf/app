// Estado vacío reutilizado (comunidad, mensajes, descubrir, búsqueda, notificaciones, eventos...).
export default function EmptyState({ children }: { children: React.ReactNode }) {
  return <p className="text-body-sm text-body-sm text-outline text-center py-10">{children}</p>;
}
