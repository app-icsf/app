import { redirect } from "next/navigation";

export default function VerificarInicio() {
  async function go(fd: FormData) {
    "use server";
    const code = String(fd.get("code") ?? "").trim();
    if (!code) redirect("/credencial/verificar");
    redirect(`/credencial/verificar/${encodeURIComponent(code)}`);
  }
  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-margin py-10 gap-5 mx-auto w-full max-w-[480px]">
      <div className="w-16 h-16 rounded-full bg-honor-amber-soft flex items-center justify-center">
        <span className="material-symbols-outlined filled text-ambassador-gold text-[32px]">verified_user</span>
      </div>
      <h1 className="font-headline-lg text-headline-lg text-on-surface text-center">Verificar credencial ICSF</h1>
      <p className="text-body-md text-on-surface-variant text-center">Introduce el código que aparece en la credencial digital o en el QR público.</p>
      <form action={go} className="w-full space-y-3">
        <input name="code" required placeholder="Código de verificación"
          className="w-full h-12 px-4 rounded-lg bg-surface-canvas text-on-surface font-body-md focus:outline-none focus:ring-2 focus:ring-primary-container" />
        <button className="w-full h-12 rounded-lg bg-secondary text-on-secondary font-label-lg">Verificar</button>
      </form>
    </main>
  );
}
