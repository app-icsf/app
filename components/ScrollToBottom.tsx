"use client";
import { useEffect, useRef } from "react";

// Ancla invisible al final del hilo de mensajes: al montar (cada mensaje nuevo re-renderiza la página
// completa vía revalidatePath) desplaza el contenedor para mostrar el último mensaje.
export default function ScrollToBottom({ dep }: { dep: string | number }) {
  const ref = useRef<HTMLDivElement>(null);
  useEffect(() => { ref.current?.scrollIntoView({ block: "end" }); }, [dep]);
  return <div ref={ref} />;
}
