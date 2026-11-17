"use client";

import { useEffect, useRef, useState } from "react";
import { ArrowRight, X } from "lucide-react";
import { linkWhatsApp } from "@/config";
import { CaraNorma } from "./Marca";

/*
 * "Bot" de Norma. No es un bot de verdad: parece un chat, pero cada respuesta abre
 * WhatsApp con el mensaje ya escrito, y del otro lado contesta Norma.
 * No se abre solo: los globitos invitan, el cliente decide.
 */

const EVENTO = "abrir-norma";

/** Botón que abre el chat de Norma desde cualquier parte de la página. */
export function BotonHablar({ className = "", children }: { className?: string; children: React.ReactNode }) {
  return (
    <button type="button" onClick={() => window.dispatchEvent(new Event(EVENTO))} className={className}>
      {children}
    </button>
  );
}

export function NormaBot({ pieza, saludar = true }: { pieza?: string; saludar?: boolean }) {
  const [abierto, setAbierto] = useState(false);
  // El panel queda montado un instante después de cerrar, para que se vaya con su animación de salida.
  const [montado, setMontado] = useState(false);
  const [globos, setGlobos] = useState(false);
  if (abierto && !montado) setMontado(true);
  const panel = useRef<HTMLDivElement>(null);
  const boton = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    const t = setTimeout(() => setGlobos(saludar), 900);
    const abrir = () => setAbierto(true);
    // Los globitos saludan al llegar; cuando la persona empieza a mirar las tazas, se van
    // para no taparle nada. La carita de Norma queda siempre a mano.
    const scroll = () => {
      if (window.scrollY > 350) {
        clearTimeout(t);
        setGlobos(false);
        window.removeEventListener("scroll", scroll);
      }
    };
    window.addEventListener(EVENTO, abrir);
    window.addEventListener("scroll", scroll, { passive: true });
    return () => {
      clearTimeout(t);
      window.removeEventListener(EVENTO, abrir);
      window.removeEventListener("scroll", scroll);
    };
  }, [saludar]);

  useEffect(() => {
    if (!abierto) return;
    setGlobos(false);
    panel.current?.focus();
    const esc = (e: KeyboardEvent) => {
      if (e.key === "Escape") {
        setAbierto(false);
        boton.current?.focus();
      }
    };
    window.addEventListener("keydown", esc);
    return () => window.removeEventListener("keydown", esc);
  }, [abierto]);

  const opciones: [string, string][] = [
    pieza
      ? ["Me gustó esta taza", `Hola Norma! Me gustó la "${pieza}". ¿Me contás más?`]
      : ["Me gustó una taza", "Hola Norma! Vi tu tienda y me gustó una taza: "],
    ["¿Cómo pago?", "Hola Norma! ¿Cómo te puedo pagar?"],
    ["¿Hacés envíos?", "Hola Norma! ¿Hacés envíos o hay que retirar por el taller?"],
    ["Quiero una por encargo", "Hola Norma! Quería encargarte una taza especial."],
  ];

  return (
    <div className="fixed bottom-4 right-4 z-40 flex flex-col items-end gap-3 sm:bottom-6 sm:right-6">
      {montado && (
        <div
          ref={panel}
          role="dialog"
          aria-modal="false"
          aria-labelledby="norma-titulo"
          aria-hidden={!abierto}
          inert={!abierto}
          tabIndex={-1}
          onAnimationEnd={() => !abierto && setMontado(false)}
          // Crece desde la carita de Norma (abajo a la derecha), que es de donde sale
          className={`${abierto ? "aparecer" : "desaparecer"} w-[min(23rem,calc(100vw-2rem))] origin-bottom-right overflow-hidden rounded-[1.6rem] bg-papel shadow-[0_2px_6px_rgb(42_33_29/0.12),0_24px_48px_-16px_rgb(42_33_29/0.45)] outline-none`}
        >
          <div className="flex items-center gap-3 bg-rojo px-4 py-3 text-white">
            <CaraNorma className="h-12 w-12 shrink-0 rounded-full ring-2 ring-white" />
            <div className="min-w-0 flex-1">
              <p id="norma-titulo" className="font-bold leading-tight">Norma</p>
              <p className="text-[0.8rem] leading-tight opacity-90">Te contesto por WhatsApp</p>
            </div>
            <button
              type="button"
              onClick={() => {
                setAbierto(false);
                boton.current?.focus();
              }}
              className="grid h-12 w-12 place-items-center rounded-full text-2xl hover:bg-white/15"
              aria-label="Cerrar el chat"
            >
              <X aria-hidden="true" className="h-6 w-6" strokeWidth={2} />
            </button>
          </div>

          <div className="space-y-2 bg-crema px-4 py-4">
            <p className="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-2 shadow-sm">¡Hola! Soy Norma.</p>
            <p className="w-fit max-w-[85%] rounded-2xl rounded-tl-md bg-white px-4 py-2 shadow-sm">
              Hago cada taza a mano en mi taller. ¿En qué te ayudo?
            </p>
          </div>

          <ul className="flex flex-col gap-2 px-4 pb-3 pt-1">
            {opciones.map(([texto, mensaje]) => (
              <li key={texto}>
                <a
                  href={linkWhatsApp(mensaje)}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="group flex min-h-12 items-center justify-between gap-3 rounded-full border-2 border-rojo px-4 font-bold text-rojo transition-colors duration-200 hover:bg-rosa/50 active:bg-rosa"
                >
                  {texto}
                  <ArrowRight
                    aria-hidden="true"
                    className="h-[1.1em] w-[1.1em] shrink-0 transition-transform duration-200 ease-[var(--ease-out-quad)] motion-safe:group-hover:translate-x-1"
                    strokeWidth={2}
                  />
                </a>
              </li>
            ))}
          </ul>
          <p className="px-4 pb-4 text-[0.8rem] leading-snug text-tinta/80">
            Se abre WhatsApp con el mensaje listo. Solo tenés que enviarlo.
          </p>
        </div>
      )}

      {!abierto && globos && (
        // En el celular no entran sin tapar la página: queda solo la carita.
        <div className="hidden flex-col items-end gap-1.5 sm:flex">
          <button type="button" onClick={() => setAbierto(true)} className="globo aparecer origin-bottom-right transition-colors hover:bg-[#dfdad3]">
            Contame qué taza te gustó
          </button>
          <button
            type="button"
            onClick={() => setAbierto(true)}
            className="globo aparecer origin-bottom-right transition-colors hover:bg-[#dfdad3]"
            style={{ animationDelay: "80ms" }}
          >
            ¿Querés hablar conmigo?
          </button>
        </div>
      )}

      <button
        ref={boton}
        type="button"
        onClick={() => setAbierto((a) => !a)}
        aria-expanded={abierto}
        aria-label={abierto ? "Cerrar el chat con Norma" : "Hablar con Norma por WhatsApp"}
        className="h-16 w-16 rounded-full shadow-[0_10px_24px_-8px_rgb(42_33_29/0.55)] transition-transform duration-150 ease-[var(--ease-out-quad)] motion-safe:hover:scale-[1.04] motion-safe:active:scale-[0.96]"
      >
        <CaraNorma className="h-full w-full" />
      </button>
    </div>
  );
}
