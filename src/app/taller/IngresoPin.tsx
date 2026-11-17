"use client";

import { useState, useTransition } from "react";
import { Delete } from "lucide-react";
import { useRouter } from "next/navigation";
import { ingresar } from "@/app/acciones";
import { Logo, CaraNorma } from "@/components/Marca";

/** Teclado grande de 4 números. Se pone una sola vez: después queda abierto. */
export function IngresoPin() {
  const [pin, setPin] = useState("");
  const [error, setError] = useState(false);
  const [pendiente, start] = useTransition();
  const router = useRouter();

  function tocar(d: string) {
    if (pendiente) return;
    setError(false);
    const nuevo = (pin + d).slice(0, 4);
    setPin(nuevo);
    if (nuevo.length === 4)
      start(async () => {
        if (await ingresar(nuevo)) router.refresh();
        else {
          setError(true);
          setPin("");
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
      {error && (
        <p role="alert" className="mt-4 text-xl font-bold text-rojo-oscuro">
          Ese no es. Probá de nuevo.
        </p>
      )}

      <div className="mt-8 grid w-full max-w-sm grid-cols-3 gap-4">
        {["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"].map((d, i) =>
          d === "" ? (
            <span key={i} />
          ) : (
            <button
              key={i}
              type="button"
              aria-label={d === "borrar" ? "Borrar" : d}
              onClick={() => (d === "borrar" ? setPin(pin.slice(0, -1)) : tocar(d))}
              className="h-20 rounded-3xl bg-crema-2 text-[2rem] font-bold text-rojo hover:bg-crema-3 active:bg-crema-3"
            >
              {d === "borrar" ? <Delete aria-hidden="true" className="mx-auto h-8 w-8" strokeWidth={1.75} /> : d}
            </button>
          ),
        )}
      </div>
    </div>
  );
}
