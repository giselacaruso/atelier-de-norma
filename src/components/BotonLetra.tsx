"use client";

import { useEffect, useState } from "react";
import { AArrowDown, AArrowUp } from "lucide-react";

/** Botón para agrandar toda la letra de la página. Se recuerda en este dispositivo. */
export function BotonLetra() {
  const [grande, setGrande] = useState(false);
  useEffect(() => setGrande(document.documentElement.dataset.letra === "grande"), []);

  function alternar() {
    const nuevo = !grande;
    setGrande(nuevo);
    if (nuevo) document.documentElement.dataset.letra = "grande";
    else delete document.documentElement.dataset.letra;
    try {
      localStorage.setItem("letra", nuevo ? "grande" : "normal");
    } catch {}
  }

  return (
    // Discreto: solo el ícono. El nombre lo leen los lectores de pantalla y aparece al pasar el mouse.
    <button
      type="button"
      onClick={alternar}
      aria-pressed={grande}
      aria-label={grande ? "Letra normal" : "Letra más grande"}
      title={grande ? "Letra normal" : "Letra más grande"}
      className="grid h-11 w-11 place-items-center rounded-full text-rojo/70 transition-colors hover:bg-crema-2 hover:text-rojo"
    >
      {grande ? (
        <AArrowDown aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
      ) : (
        <AArrowUp aria-hidden="true" className="h-6 w-6" strokeWidth={1.75} />
      )}
    </button>
  );
}
