import { requireUser } from "@/lib/session";
import { getCredential } from "@/lib/data";
import DetailHeader from "@/components/DetailHeader";
import SectionLabel from "@/components/SectionLabel";
import PrintButton from "@/components/PrintButton";
import { longDate } from "@/lib/format";

export default async function CredencialDigital() {
  const user = await requireUser();
  const credential = await getCredential(user.id);

  if (!credential) {
    return (
      <>
        <DetailHeader title="Credencial Digital" />
        <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-10 text-center"><p className="text-body-md text-on-surface-variant">Aún no tienes una credencial emitida. Se genera al completar un programa de ICSF Academy.</p></main>
      </>
    );
  }

  return (
    <>
      <DetailHeader title="Credencial Digital" right={<span className="material-symbols-outlined text-inverse-primary text-[20px] pr-1">ios_share</span>} />
      <main className="flex-1 w-full bg-surface pt-16 pb-safe px-margin py-5 space-y-5">
        <div className="flex items-center gap-2 text-body-sm text-on-surface-variant">
          <span className="w-2 h-2 rounded-full bg-emerald-500" />Registro {credential.status === "ACTIVE" ? "Activo" : credential.status}
          <span className="ml-auto px-2 py-0.5 rounded-full bg-surface-container text-label-sm">Folio federado</span>
        </div>

        <div className="relative overflow-hidden rounded-2xl bg-primary-container p-6 text-center space-y-3 text-on-primary">
          <div className="absolute -top-10 -right-8 w-36 h-36 rounded-full bg-stage-electric-blue/25 blur-2xl pointer-events-none" />
          <div className="w-14 h-14 mx-auto rounded-full bg-honor-amber-soft flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined filled text-[28px] text-ambassador-gold">workspace_premium</span>
          </div>
          <p className="font-label-sm uppercase tracking-widest text-inverse-primary relative z-10">International Coaching &amp; Speaker Federation</p>
          <p className="inline-flex items-center gap-1 text-label-sm text-tertiary-fixed relative z-10">
            <span className="material-symbols-outlined filled text-[14px]">verified</span>Certificación Internacional Verificada
          </p>
          <div className="pt-2 relative z-10">
            <p className="text-body-sm text-inverse-primary">Por cuanto acredita la maestría a</p>
            <h1 className="font-headline-lg text-on-primary mt-1">{credential.user.name}</h1>
            <span className="inline-block mt-2 px-3 py-1 rounded-full bg-honor-amber-soft text-on-tertiary-container font-label-md">{credential.title}</span>
          </div>
          <p className="text-body-sm text-inverse-primary leading-relaxed max-w-xs mx-auto relative z-10">Habiendo cumplimentado los estándares pedagógicos, de oratoria avanzada y el canon de rigor dictado por el Consejo Global ICSF.</p>
          <div className="w-28 h-28 mx-auto bg-white rounded-lg flex items-center justify-center relative z-10">
            <span className="material-symbols-outlined text-[64px] text-on-surface">qr_code_2</span>
          </div>
          <p className="font-label-sm text-inverse-primary tracking-wider relative z-10">REG: {credential.number}</p>
          {credential.signedByName && <p className="text-body-sm text-inverse-primary pt-2 relative z-10">{credential.signedByName}<br /><span className="text-label-sm">{credential.signedByRole}</span></p>}
        </div>

        <div className="grid grid-cols-2 gap-2.5 text-center">
          <div className="bg-surface-card rounded-xl p-3 card-elevated"><p className="text-label-sm text-on-surface-variant uppercase">Fecha Expedición</p><p className="font-label-lg text-on-surface">{longDate(credential.issuedAt)}</p></div>
          <div className="bg-surface-card rounded-xl p-3 card-elevated"><p className="text-label-sm text-on-surface-variant uppercase">Vigencia Oficial</p><p className="font-label-lg text-on-surface">{credential.expiresAt ? longDate(credential.expiresAt) : "Sin vencimiento"}</p></div>
        </div>

        {credential.competencies.length > 0 && (
          <section className="space-y-2">
            <SectionLabel>Competencias Avaladas</SectionLabel>
            {credential.competencies.map((c) => (
              <div key={c.competencyId} className="bg-surface-card rounded-xl p-3.5 card-elevated"><p className="font-label-lg text-on-surface">{c.competency.name}</p>{c.competency.description && <p className="text-body-sm text-on-surface-variant mt-0.5">{c.competency.description}</p>}</div>
            ))}
          </section>
        )}

        {credential.blockNumber && (
          <div className="bg-surface-container-low rounded-xl p-3.5 text-body-sm text-on-surface-variant"><span className="font-medium text-on-surface">Registro Público ICSF:</span> inscrito en el folio #{credential.blockNumber} del registro federado de acreditaciones.</div>
        )}

        <a href={`/credencial/verificar/${credential.verifyCode}`} className="block text-center h-11 rounded-lg bg-surface-container text-on-surface font-label-md flex items-center justify-center">Verificar Validez Pública</a>
        <PrintButton label="Imprimir / guardar como PDF" />
      </main>
    </>
  );
}
