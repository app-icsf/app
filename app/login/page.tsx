import { signIn } from "@/auth";
import { AuthError } from "next-auth";
import { redirect } from "next/navigation";

const MESSAGES: Record<string, string> = {
  not_found: "Tu correo no está dado de alta. Contacta a la Secretaría ICSF.",
  inactive: "Tu acceso está suspendido. Contacta a la Secretaría ICSF.",
  not_started: "Tu acceso aún no está vigente.",
  expired: "Tu vigencia ha terminado. Contacta a la Secretaría ICSF para renovarla.",
  credentials: "Correo o contraseña incorrectos, o acceso no vigente.",
};

// Splash y acceso (rediseño "Global Luminary"). Sin registro: solo correos dados de alta por la Secretaría / portal admin.
export default async function LoginPage({ searchParams }: { searchParams: Promise<{ error?: string }> }) {
  const { error } = await searchParams;
  const hasGoogle = !!process.env.AUTH_GOOGLE_ID;
  const hasApple = !!process.env.AUTH_APPLE_ID;

  async function credentials(fd: FormData) {
    "use server";
    try {
      await signIn("credentials", {
        email: fd.get("email"),
        password: fd.get("password"),
        redirectTo: "/",
      });
    } catch (e) {
      if (e instanceof AuthError) redirect("/login?error=credentials");
      throw e;
    }
    redirect("/");
  }
  const social = (provider: "google" | "apple") => async () => { "use server"; await signIn(provider, { redirectTo: "/" }); };

  return (
    <main className="flex flex-col relative w-full bg-surface flex-grow min-h-screen overflow-hidden mx-auto max-w-[480px]">
      <div className="flex flex-col w-full relative px-margin pb-10 pt-safe">
        <div className="absolute -top-24 left-1/2 -translate-x-1/2 w-96 h-96 bg-stage-electric-blue/10 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute top-80 -right-20 w-64 h-64 bg-honor-amber-soft/40 rounded-full blur-3xl pointer-events-none" />

        <div className="flex flex-col items-center text-center mt-6 relative z-10">
          <div className="relative w-36 h-36 my-2">
            <div className="absolute inset-0 rounded-full bg-secondary-container/20 blur-xl scale-95" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src="/emblema-icsf.png" alt="Emblema oficial ICSF" className="relative w-full h-full object-contain drop-shadow-xl rounded-2xl" />
          </div>
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-honor-amber-soft text-on-tertiary-fixed-variant font-label-sm text-label-sm tracking-widest uppercase mb-2 shadow-sm">
            <span className="material-symbols-outlined text-[14px] text-ambassador-gold" style={{ fontVariationSettings: "'FILL' 1" }}>verified</span>
            Acreditación Global
          </span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface tracking-tight uppercase max-w-xs leading-snug">International Coaching &amp; Speaker Federation</h1>
          <p className="font-body-sm text-body-sm text-text-muted mt-1 max-w-[280px]">Portal Oficial de Miembros y Claustro Académico</p>
        </div>

        <div className="mt-6 w-full max-w-md mx-auto bg-surface-card rounded-xl p-5 shadow-xl relative z-10 space-y-4">
          {error && <p role="alert" className="rounded-lg bg-error-container text-on-error-container text-body-sm p-3">{MESSAGES[error] ?? MESSAGES.credentials}</p>}

          <form action={credentials} className="space-y-4">
            <div className="flex flex-col gap-1.5">
              <label htmlFor="email" className="font-label-md text-label-md text-on-surface-variant">Correo electrónico</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-primary-container pointer-events-none text-[20px]">badge</span>
                <input id="email" name="email" type="email" required autoComplete="email" placeholder="colegiado@icsfederation.org"
                  className="w-full h-12 pl-11 pr-4 rounded-lg bg-surface-canvas text-on-surface font-body-md text-body-md placeholder:text-outline-variant focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all" />
              </div>
            </div>
            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="font-label-md text-label-md text-on-surface-variant">Contraseña de acceso</label>
              <div className="relative flex items-center">
                <span className="material-symbols-outlined absolute left-3.5 text-on-primary-container pointer-events-none text-[20px]">lock</span>
                <input id="password" name="password" type="password" required autoComplete="current-password" placeholder="••••••••••••"
                  className="w-full h-12 pl-11 pr-4 rounded-lg bg-surface-canvas text-on-surface font-body-md text-body-md placeholder:text-outline-variant focus:bg-surface-card focus:outline-none focus:ring-2 focus:ring-primary-container transition-all" />
              </div>
            </div>
            <div className="flex justify-end">
              <span className="inline-flex items-center gap-1 font-label-sm text-label-sm text-on-primary-container"><span className="material-symbols-outlined text-[14px]">shield</span> SSL 256-bit</span>
            </div>
            <button className="w-full h-[50px] bg-secondary hover:bg-secondary-container active:scale-[0.98] text-on-secondary font-label-lg text-label-lg rounded-lg flex items-center justify-center gap-2 shadow-lg shadow-secondary/25 transition-all">
              <span>Ingresar al Portal</span><span className="material-symbols-outlined text-[20px]">arrow_forward</span>
            </button>
          </form>

          <div className="relative flex items-center justify-center my-3">
            <div className="w-full h-[1px] bg-surface-container-high" />
            <span className="px-3 bg-surface-card text-outline font-label-sm text-label-sm uppercase tracking-wider whitespace-nowrap">o autenticar con</span>
            <div className="w-full h-[1px] bg-surface-container-high" />
          </div>

          <div className="grid grid-cols-2 gap-3">
            <form action={social("apple")}>
              <button disabled={!hasApple} className="w-full h-12 rounded-lg bg-primary-container text-on-primary font-label-md text-label-md flex items-center justify-center gap-2 disabled:opacity-40">
                <span className="text-lg leading-none"></span> Apple
              </button>
            </form>
            <form action={social("google")}>
              <button disabled={!hasGoogle} className="w-full h-12 rounded-lg bg-surface-container text-on-surface font-label-md text-label-md flex items-center justify-center gap-2 disabled:opacity-40">
                <span className="font-bold text-lg leading-none">G</span> Google
              </button>
            </form>
          </div>
          {(!hasApple || !hasGoogle) && <p className="text-center font-label-sm text-label-sm text-outline normal-case tracking-normal">Apple y Google se activan al configurar sus claves.</p>}
        </div>

        <div className="mt-6 flex flex-col items-center text-center relative z-10 space-y-3">
          <a href="/credencial/verificar" className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-surface-container-low text-on-surface-variant hover:text-secondary font-label-md text-label-md shadow-sm">
            <span className="material-symbols-outlined text-ambassador-gold text-[18px]">verified_user</span>
            Verificar credencial pública
            <span className="material-symbols-outlined text-[16px]">chevron_right</span>
          </a>
          <p className="font-body-sm text-body-sm text-text-muted">¿No tienes acceso? Las altas las gestiona la Secretaría ICSF.</p>
          <p className="font-label-sm text-label-sm text-outline tracking-wider"><span className="text-ambassador-gold">●</span> Certificación internacional bajo estándares ICSF Global</p>
        </div>
      </div>
    </main>
  );
}
