import { getCredentialByVerifyCode } from "@/lib/data";
import { longDate } from "@/lib/format";

// Página pública (sin sesión): a esto apunta el QR de la credencial. Registro firmado propio, sin
// dependencia de una blockchain real (ver docs/MATRIZ_FUNCIONAL.md, duda D37).
export default async function VerificarCredencial({ params }: { params: Promise<{ code: string }> }) {
  const { code } = await params;
  const credential = await getCredentialByVerifyCode(code);

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-surface px-margin py-10 text-center gap-4 mx-auto w-full max-w-[480px]">
      {credential ? (
        <>
          <span className="material-symbols-outlined text-[56px] text-secondary">verified</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Credencial válida</h1>
          <p className="text-body-md text-body-md text-on-surface-variant">{credential.user.name} · {credential.title}</p>
          <p className="text-label-sm text-label-sm text-outline">REG: {credential.number} · Vigente {credential.expiresAt ? `hasta ${longDate(credential.expiresAt)}` : "sin vencimiento"}</p>
          <span className={`px-3 py-1 rounded-full text-label-md text-label-md ${credential.status === "ACTIVE" ? "bg-secondary-container/15 text-secondary" : "bg-error-container text-on-error-container"}`}>{credential.status === "ACTIVE" ? "Activa" : credential.status}</span>
        </>
      ) : (
        <>
          <span className="material-symbols-outlined text-[56px] text-error">gpp_bad</span>
          <h1 className="font-headline-lg text-headline-lg text-on-surface">Código no encontrado</h1>
          <p className="text-body-md text-body-md text-on-surface-variant">No existe una credencial ICSF con este código de verificación.</p>
        </>
      )}
    </main>
  );
}
