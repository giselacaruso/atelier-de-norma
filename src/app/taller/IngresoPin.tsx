"use client";

import { useEffect, useRef, useState, useTransition } from "react";
import { Delete, Phone, PhoneOff } from "lucide-react";
import { useRouter } from "next/navigation";
import { ingresar } from "@/app/acciones";
import { Logo, CaraNorma } from "@/components/Marca";

/** Teclado grande de 4 números. Se pone una sola vez: después queda abierto. */
export function IngresoPin() {
  const [pin, setPin] = useState("");
  const [aviso, setAviso] = useState<string | null>(null);
  const [bloqueada, setBloqueada] = useState(false);
  const [llamando, setLlamando] = useState(false);
  const [pendiente, start] = useTransition();
  const router = useRouter();

  function tocar(d: string) {
    if (pendiente || bloqueada) return;
    setAviso(null);
    const nuevo = (pin + d).slice(0, 4);
    setPin(nuevo);
    if (nuevo.length === 4)
      start(async () => {
        const r = await ingresar(nuevo);
        if (r.ok) return router.refresh();
        setPin("");
        if (r.restantes > 0) {
          setAviso(`Ese no es. ${r.restantes === 1 ? "Te queda 1 intento." : `Te quedan ${r.restantes} intentos.`}`);
        } else {
          setBloqueada(true);
          setAviso(`Probaste muchas veces. Esperá ${r.minutos} minutos y volvé a intentar.`);
        }
      });
  }

  return (
    <div className="flex flex-col items-center text-center">
      <Logo className="text-[1.8rem] text-rojo" />
      <CaraNorma className="mt-8 h-24 w-24" />
      <h1 className="mt-4 titulo text-[2rem] leading-none text-rojo">Hola, Norma</h1>
      <p className="mt-3 text-xl">Poné tus 4 números para entrar.</p>
      <p className="text-base">(Para probar: 1234)</p>

      <div aria-live="polite" className="mt-6 flex gap-4" aria-label={`${pin.length} de 4 números`}>
        {[0, 1, 2, 3].map((i) => (
          <span
            key={i}
            className={`h-6 w-6 rounded-full border-4 border-rojo ${i < pin.length ? "bg-rojo" : ""}`}
          />
        ))}
      </div>
      {aviso && (
        <p role="alert" className="mt-4 max-w-sm text-xl font-bold text-rojo-oscuro">
          {aviso}
        </p>
      )}

      <div className={`mt-8 grid w-full max-w-sm grid-cols-3 gap-4 transition-opacity ${bloqueada ? "opacity-40" : ""}`}>
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"].map((d, i) =>
          d === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              disabled={bloqueada}
              aria-label={d === "borrar" ? "Borrar" : d}
              onClick={() => (d === "borrar" ? setPin(pin.slice(0, -1)) : tocar(d))}
              className="h-20 rounded-3xl bg-crema-2 text-[2rem] font-bold text-rojo hover:bg-crema-3 active:bg-crema-3 disabled:cursor-default disabled:hover:bg-crema-2"
            >
              {d === "borrar" ? <Delete aria-hidden="true" className="mx-auto h-8 w-8" strokeWidth={1.75} /> : d}
            </button>
          ),
        )}
      </div>

      <button
        type="button"
        onClick={() => setLlamando(true)}
        className="mt-8 min-h-12 px-4 text-[1.05rem] font-bold text-rojo underline decoration-rojo/40 underline-offset-4 hover:decoration-rojo"
      >
        Me olvidé la clave
      </button>

      {llamando && <LlamandoAGoncy onCerrar={() => setLlamando(false)} />}
    </div>
  );
}

/*
 * "Llamando a Goncy": simula una llamada de teléfono para la demo.
 * Suena unos segundos, Goncy atiende y tranquiliza a Norma. No llama a nadie de verdad.
 */
function LlamandoAGoncy({ onCerrar }: { onCerrar: () => void }) {
  const dialogo = useRef<HTMLDialogElement>(null);
  const [segundos, setSegundos] = useState(0);
  const atendio = segundos >= 5;

  useEffect(() => {
    dialogo.current?.showModal();
    const t = setInterval(() => setSegundos((s) => s + 1), 1000);
    return () => clearInterval(t);
  }, []);

  const reloj = `0:${String(segundos).padStart(2, "0")}`;

  return (
    <dialog
      ref={dialogo}
      onClose={onCerrar}
      aria-labelledby="goncy-titulo"
      className="aparecer m-auto w-[min(22rem,calc(100vw-2rem))] overflow-hidden rounded-[2rem] bg-tinta p-0 text-white shadow-[0_24px_48px_-16px_rgb(42_33_29/0.6)] backdrop:bg-tinta/50"
    >
      <div className="flex flex-col items-center px-6 pb-8 pt-10 text-center">
        <p className="volanta text-white/70" aria-live="polite">
          {atendio ? `En llamada · ${reloj}` : "Llamando…"}
        </p>

        {/* La foto de Goncy con ondas, como cuando suena el teléfono */}
        <div className="relative mt-8 grid h-28 w-28 place-items-center">
          {!atendio && (
            <>
              <span aria-hidden="true" className="onda absolute inset-0 rounded-full bg-rosa" />
              <span aria-hidden="true" className="onda absolute inset-0 rounded-full bg-rosa" style={{ animationDelay: "0.8s" }} />
            </>
          )}
          <span className="relative grid h-28 w-28 place-items-center rounded-full bg-rosa text-[3rem] font-bold text-rojo">G</span>
        </div>

        <h2 id="goncy-titulo" className="mt-6 text-[1.8rem] font-bold leading-none">
          Goncy
        </h2>
        <p className="mt-1 text-white/70">El que armó tu taller</p>

        <p className="mt-6 min-h-[4.5rem] text-[1.05rem] leading-snug" aria-live="polite">
          {atendio
            ? "“¡Hola, Norma! Quedate tranquila, ya te paso una clave nueva así entrás.”"
            : "Le estamos avisando que te olvidaste la clave."}
        </p>

        <form method="dialog" className="mt-6">
          {atendio ? (
            <button className="boton boton-rojo min-w-[12rem]" autoFocus>
              Gracias, Goncy
            </button>
          ) : (
            <button
              aria-label="Cortar la llamada"
              className="grid h-16 w-16 place-items-center rounded-full bg-rojo transition-[transform,background-color] duration-150 hover:bg-rojo-oscuro active:scale-95 motion-reduce:active:scale-100"
              autoFocus
            >
              <PhoneOff aria-hidden="true" className="h-7 w-7" strokeWidth={2} />
            </button>
          )}
        </form>

        <p className="mt-6 flex items-center gap-1.5 text-[0.75rem] text-white/50">
          <Phone aria-hidden="true" className="h-3.5 w-3.5" strokeWidth={2} />
          Es una simulación para la demo
        </p>
      </div>
    </dialog>
  );
}
