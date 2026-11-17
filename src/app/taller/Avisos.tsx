"use client";

import { useEffect, useState } from "react";
import { Bell, ChevronDown, Share, Smartphone } from "lucide-react";
import { guardarSuscripcion, probarAviso } from "@/app/acciones";

type Estado = "cargando" | "no-soportado" | "instalar-iphone" | "pedir" | "bloqueado" | "activo";

const CLAVE = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY!;

function aUint8(base64: string) {
  const pad = "=".repeat((4 - (base64.length % 4)) % 4);
  const raw = atob((base64 + pad).replace(/-/g, "+").replace(/_/g, "/"));
  return Uint8Array.from(raw, (c) => c.charCodeAt(0));
}

/**
 * Activa las notificaciones en el celular de Norma.
 * - Android: funciona directo desde Chrome.
 * - iPhone: primero hay que "Agregar a inicio" (iOS 16.4+). Se lo explicamos con dibujitos.
 */
export function Avisos() {
  const [estado, setEstado] = useState<Estado>("cargando");
  const [mensaje, setMensaje] = useState("");

  useEffect(() => {
    const ios = /iphone|ipad|ipod/i.test(navigator.userAgent);
    const instalada = window.matchMedia("(display-mode: standalone)").matches;
    if (!("serviceWorker" in navigator) || !("PushManager" in window)) {
      setEstado(ios && !instalada ? "instalar-iphone" : "no-soportado");
      return;
    }
    navigator.serviceWorker.register("/sw.js").then(async (reg) => {
      if (Notification.permission === "denied") return setEstado("bloqueado");
      const sub = await reg.pushManager.getSubscription();
      if (sub && Notification.permission === "granted") {
        await guardarSuscripcion(sub.toJSON() as never);
        setEstado("activo");
      } else setEstado("pedir");
    });
  }, []);

  async function activar() {
    const permiso = await Notification.requestPermission();
    if (permiso !== "granted") return setEstado("bloqueado");
    const reg = await navigator.serviceWorker.ready;
    const sub = await reg.pushManager.subscribe({ userVisibleOnly: true, applicationServerKey: aUint8(CLAVE) });
    await guardarSuscripcion(sub.toJSON() as never);
    setEstado("activo");
    await probarAviso();
  }

  if (estado === "cargando") return null;

  const textos: Record<Exclude<Estado, "cargando">, string> = {
    activo: "Están prendidos en este celular.",
    pedir: "Si pasa una semana sin cambios, te recuerdo revisar la tienda.",
    "instalar-iphone": "En iPhone primero hay que poner “Mi taller” en la pantalla de inicio.",
    bloqueado: "Están apagados en este celular.",
    "no-soportado": "Este navegador no los permite. Probá desde Chrome (Android) o Safari (iPhone).",
  };

  return (
    <section aria-labelledby="avisos" className="mt-14 rounded-2xl bg-crema-2 p-5 text-tinta">
      <div className="flex items-start gap-3">
        <Bell aria-hidden="true" className="mt-0.5 h-5 w-5 shrink-0 text-rojo" strokeWidth={2} />
        <div className="min-w-0 flex-1">
          <h2 id="avisos" className="text-[1.05rem] font-bold leading-snug">Avisos en el celular</h2>
          <p className="mt-0.5 text-[0.85rem]">{textos[estado]}</p>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-2 pl-8">
        {estado === "pedir" && (
          <button type="button" onClick={activar} className="boton boton-rojo !min-h-11 !px-4 text-[0.8rem]">
            Prender avisos
          </button>
        )}
        {estado === "activo" && (
          <button
            type="button"
            className="boton boton-borde !min-h-11 !px-4 text-[0.8rem]"
            onClick={async () => setMensaje((await probarAviso()) ? "Te mandé uno de prueba." : "No pude mandarlo.")}
          >
            Mandarme uno de prueba
          </button>
        )}
      </div>
      {mensaje && (
        <p className="mt-2 pl-8 text-[0.85rem]" aria-live="polite">
          {mensaje}
        </p>
      )}

      {/* Siempre a mano: cómo se prenden, paso a paso, en Android y en iPhone. */}
      <details className="group mt-4 border-t border-crema-3 pt-3 pl-8" open={estado === "bloqueado" || estado === "instalar-iphone"}>
        <summary className="flex min-h-11 cursor-pointer list-none items-center gap-2 text-[0.85rem] font-bold text-rojo [&::-webkit-details-marker]:hidden">
          ¿Cómo se prenden?
          <ChevronDown aria-hidden="true" className="h-4 w-4 transition-transform duration-200 ease-[var(--ease-out-quad)] motion-reduce:transition-none group-open:rotate-180" strokeWidth={2.25} />
        </summary>
        <div className="mt-2 grid gap-5 text-[0.85rem] sm:grid-cols-2">
          <div>
            <p className="flex items-center gap-2 font-bold">
              <Smartphone aria-hidden="true" className="h-4 w-4" strokeWidth={2} /> Android (Chrome)
            </p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5">
              <li>Abrí “Mi taller” en Chrome.</li>
              <li>Tocá <strong>Prender avisos</strong> y después <strong>Permitir</strong>.</li>
              <li>
                Si dice que están apagados: tocá el candadito al lado de la dirección, entrá a <strong>Permisos</strong> y
                prendé <strong>Notificaciones</strong>.
              </li>
            </ol>
          </div>
          <div>
            <p className="flex items-center gap-2 font-bold">
              <Smartphone aria-hidden="true" className="h-4 w-4" strokeWidth={2} /> iPhone (Safari)
            </p>
            <ol className="mt-1.5 list-decimal space-y-1 pl-5">
              <li>
                Tocá <Share aria-label="Compartir" className="inline h-4 w-4 align-[-2px]" strokeWidth={2} />{" "}
                <strong>Compartir</strong> y elegí <strong>Agregar a inicio</strong>.
              </li>
              <li>Abrí “Mi taller” desde el ícono nuevo de la pantalla.</li>
              <li>
                Tocá <strong>Prender avisos</strong> y <strong>Permitir</strong>. Si dice que están apagados: Ajustes →
                Notificaciones → Mi taller.
              </li>
            </ol>
          </div>
        </div>
      </details>
    </section>
  );
}
