"use client";

import { useEffect, useState } from "react";
import { bridgeKind, readLocation, saveProof, showNotice, type BridgeKind } from "@/lib/bridge";

type Row = { title: string; detail: string; ok: boolean };

export default function BridgePanel() {
  const [kind, setKind] = useState<BridgeKind | null>(null);
  const [onPhone, setOnPhone] = useState(false);
  const [busy, setBusy] = useState<string | null>(null);
  const [rows, setRows] = useState<Row[]>([]);

  useEffect(() => {
    bridgeKind().then((info) => {
      setKind(info.kind);
      setOnPhone(info.onPhone);
    }).catch(() => setKind("web"));
  }, []);

  async function run(key: string, task: () => Promise<string>) {
    setBusy(key);
    try {
      const detail = await task();
      setRows((prev) => [{ title: key, detail, ok: true }, ...prev.filter((row) => row.title !== key)]);
    } catch (error) {
      const detail = error instanceof Error ? error.message : "No se pudo completar.";
      setRows((prev) => [{ title: key, detail, ok: false }, ...prev.filter((row) => row.title !== key)]);
    } finally {
      setBusy(null);
    }
  }

  const platform = kind == null ? "Conectando…" : onPhone ? (kind === "ios" ? "iPhone" : "Android") : "Navegador";

  return (
    <div className="space-y-4">
      <section className="rounded-2xl bg-surface-container-lowest border border-border-subtle p-5">
        <p className="font-label-sm text-label-sm uppercase tracking-wider text-on-surface-variant">Dónde está corriendo</p>
        <p className="font-headline-sm text-headline-sm text-on-surface mt-1">{platform}</p>
        <p className="text-body-sm text-body-sm text-on-surface-variant mt-2 leading-relaxed">
          {kind == null
            ? "Revisando si esta pantalla está dentro del teléfono."
            : onPhone
              ? "La página está hablando con el teléfono. Un aviso, la ubicación y un archivo pasan por el puente."
              : "Esta Mac no tiene Xcode, así que no hay simulador de iPhone. Los botones usan el mismo código del puente; aquí responde Chrome."}
        </p>
      </section>

      <div className="grid gap-2.5">
        <button
          disabled={busy != null}
          onClick={() => run("Ubicación", async () => {
            const fix = await readLocation();
            return `${fix.lat.toFixed(5)}, ${fix.lng.toFixed(5)} · precisión ${fix.accuracy} m`;
          })}
          className="h-12 rounded-xl bg-secondary text-on-secondary font-label-md text-label-md disabled:opacity-50"
        >
          {busy === "Ubicación" ? "Leyendo ubicación…" : "Leer ubicación"}
        </button>
        <button
          disabled={busy != null}
          onClick={() => run("Aviso", async () => {
            await showNotice();
            return onPhone ? "El teléfono mostró el aviso." : "Chrome mostró el aviso de ICSF.";
          })}
          className="h-12 rounded-xl bg-primary-container text-on-primary font-label-md text-label-md disabled:opacity-50"
        >
          {busy === "Aviso" ? "Pidiendo permiso…" : "Mostrar aviso"}
        </button>
        <button
          disabled={busy != null}
          onClick={() => run("Archivo", async () => {
            const file = await saveProof();
            return `${file.name} quedó en ${file.where}.`;
          })}
          className="h-12 rounded-xl bg-surface-container text-on-surface font-label-md text-label-md disabled:opacity-50"
        >
          {busy === "Archivo" ? "Guardando…" : "Guardar archivo"}
        </button>
      </div>

      {rows.map((row) => (
        <p key={row.title} className={`rounded-xl px-4 py-3 text-body-sm text-body-sm leading-relaxed ${row.ok ? "bg-surface-container-low text-on-surface" : "bg-error-container text-error"}`}>
          <b>{row.title}. </b>{row.detail}
        </p>
      ))}
    </div>
  );
}
