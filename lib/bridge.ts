export type BridgeKind = "ios" | "android" | "web";

async function native() {
  const { Capacitor } = await import("@capacitor/core");
  return {
    kind: Capacitor.getPlatform() as BridgeKind,
    onPhone: Capacitor.isNativePlatform(),
  };
}

export async function bridgeKind(): Promise<{ kind: BridgeKind; onPhone: boolean }> {
  return native();
}

export async function readLocation() {
  const { Geolocation } = await import("@capacitor/geolocation");
  try {
    const pos = await Geolocation.getCurrentPosition({ enableHighAccuracy: false, timeout: 12000 });
    return {
      lat: pos.coords.latitude,
      lng: pos.coords.longitude,
      accuracy: Math.round(pos.coords.accuracy),
    };
  } catch (error) {
    const code = error && typeof error === "object" && "code" in error ? Number((error as { code: unknown }).code) : 0;
    if (code === 1) throw new Error("Permiso de ubicación bloqueado. Actívalo en el candado de la barra de direcciones.");
    if (code === 3) throw new Error("La ubicación tardó demasiado.");
    const message = error instanceof Error ? error.message : "";
    throw new Error(message || "No se pudo leer la ubicación.");
  }
}

export async function showNotice() {
  const { LocalNotifications } = await import("@capacitor/local-notifications");
  const perm = await LocalNotifications.requestPermissions();
  if (perm.display !== "granted") {
    throw new Error("No hay permiso para mostrar avisos.");
  }
  await LocalNotifications.schedule({
    notifications: [
      {
        id: Date.now() % 100000,
        title: "ICSF",
        body: "El puente entregó este aviso.",
      },
    ],
  });
}

export async function saveProof() {
  const { Filesystem, Directory, Encoding } = await import("@capacitor/filesystem");
  const where = await native();
  const name = `icsf-puente-${new Date().toISOString().slice(0, 19).replace(/[:T]/g, "-")}.txt`;
  const body = `ICSF\nPrueba del puente\n${new Date().toISOString()}\nplataforma: ${where.kind}\n`;
  if (where.onPhone) {
    await Filesystem.writeFile({ path: name, data: body, directory: Directory.Documents, encoding: Encoding.UTF8 });
    const saved = await Filesystem.readFile({ path: name, directory: Directory.Documents, encoding: Encoding.UTF8 });
    if (typeof saved.data !== "string" || !saved.data.includes("ICSF")) {
      throw new Error("El teléfono no devolvió el archivo.");
    }
    return { name, where: "Documentos del teléfono" };
  }
  await Filesystem.writeFile({ path: name, data: body, directory: Directory.Cache, encoding: Encoding.UTF8 });
  const saved = await Filesystem.readFile({ path: name, directory: Directory.Cache, encoding: Encoding.UTF8 });
  if (typeof saved.data !== "string" || !saved.data.includes("ICSF")) {
    throw new Error("No se pudo leer el archivo guardado.");
  }
  const blob = new Blob([saved.data], { type: "text/plain;charset=utf-8" });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  link.click();
  URL.revokeObjectURL(url);
  return { name, where: "Descargas de esta Mac" };
}
