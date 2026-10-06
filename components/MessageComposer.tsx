// Barra de envío de texto compartida por el muro de comunidad y el chat directo — misma pieza de UI,
// la acción de servidor (qué hace al enviar) la decide quien la usa.
export default function MessageComposer({ action, placeholder, showMic = false }: { action: (formData: FormData) => void | Promise<void>; placeholder: string; showMic?: boolean }) {
  return (
    <form action={action} className="sticky bottom-0 bg-surface border-t border-border-subtle px-margin py-3 flex items-center gap-2 pb-safe">
      <button type="button" aria-label="Adjuntar archivo o imagen" className="w-10 h-10 flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">attach_file</span></button>
      <input name="body" placeholder={placeholder} className="flex-1 h-11 rounded-full bg-surface-container-low px-4 text-body-md text-body-md outline-none focus:ring-2 focus:ring-primary-container" />
      {showMic && <button type="button" aria-label="Grabar nota de voz" className="w-10 h-10 flex items-center justify-center text-on-surface-variant"><span className="material-symbols-outlined text-[20px]">mic</span></button>}
      <button type="submit" aria-label="Enviar mensaje" className="w-10 h-10 rounded-full bg-primary-container text-on-primary flex items-center justify-center shrink-0"><span className="material-symbols-outlined text-[18px]">send</span></button>
    </form>
  );
}
