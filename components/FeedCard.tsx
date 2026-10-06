import Link from "next/link";
import Avatar from "./Avatar";

// Tarjeta del carrusel "Hoy en ICSF" (cumpleaños, nuevo miembro, publicación) — misma estructura visual,
// solo cambian el emblema, el texto y la acción.
type Action = { label: string } & ({ href: string } | { formAction: (fd: FormData) => void | Promise<void> });

export default function FeedCard({ name, badge, title, subtitle, action }: { name: string; badge?: string; title: string; subtitle: string; action: Action }) {
  const buttonClass = "w-full h-9 rounded-lg bg-surface-container hover:bg-surface-container-high text-on-surface text-label-md font-label-md flex items-center justify-center gap-1.5 transition-all active:scale-[0.98]";
  return (
    <div className="snap-start shrink-0 w-[270px] bg-surface-card rounded-xl p-space-md card-elevated flex flex-col justify-between">
      <div className="flex items-start gap-3">
        <div className="relative">
          <Avatar name={name} size={48} />
          {badge && <span className="absolute -bottom-1 -right-1 w-5 h-5 rounded-full bg-surface-container-lowest shadow-sm flex items-center justify-center text-[10px]">{badge}</span>}
        </div>
        <div className="min-w-0 flex-1"><p className="text-body-md font-body-md font-semibold text-on-surface truncate">{title}</p><p className="text-body-sm font-body-sm text-on-surface-variant mt-0.5 line-clamp-2">{subtitle}</p></div>
      </div>
      <div className="mt-4 pt-3">
        {"href" in action ? (
          <Link href={action.href} className={buttonClass}>{action.label}</Link>
        ) : (
          <form action={action.formAction}><button className={buttonClass}><span>{action.label}</span></button></form>
        )}
      </div>
    </div>
  );
}
