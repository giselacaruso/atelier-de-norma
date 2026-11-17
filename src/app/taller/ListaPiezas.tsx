"use client";

import Image from "next/image";
import { Trash2 } from "lucide-react";
import { useState, useTransition } from "react";
import { borrarPieza, cambiarEstado, cambiarPrecio } from "@/app/acciones";
import { formatoPrecio } from "@/config";
import type { Pieza } from "@/lib/store";
import { Etiqueta } from "@/components/TarjetaPieza";

/* Botones del taller: chicos y prolijos, pero con área de toque de 44 px. */
const chico = "boton min-h-11 whitespace-nowrap px-4 py-1.5 text-[0.8rem]";

function TarjetaTaller({ pieza }: { pieza: Pieza }) {
  const [editando, setEditando] = useState(false);
  const [borrando, setBorrando] = useState(false);
  const [precio, setPrecio] = useState(String(pieza.precio));
  const [pendiente, start] = useTransition();
  const sinStock = pieza.estado !== "disponible";

  return (
    <li className="flex flex-col">
      <div className="relative">
        <Image
          src={pieza.foto}
          alt=""
          width={600}
          height={600}
          sizes="(min-width: 640px) 320px, 90vw"
          className="aspect-square w-full rounded-[1.5rem] object-cover"
        />
        <Etiqueta estado={pieza.estado} chica />
      </div>

      {/* Renglones: nombre y precio arriba, estado y borrar abajo, separados por líneas finas */}
      <div className="mt-4 divide-y divide-crema-3 border-y border-crema-3">
        <div className="flex items-baseline justify-between gap-3 py-3">
          <p className="text-[1.05rem] font-bold leading-snug">
            {pieza.nombre}
          </p>
          <p className="shrink-0 text-[1.05rem] font-bold text-rojo">
            {formatoPrecio(pieza.precio)}
          </p>
        </div>
        <div className="flex min-h-12 items-center justify-between gap-3">
          <p
            className={`flex items-center gap-2 text-[0.85rem] font-bold ${sinStock ? "text-tinta/70" : "text-verde"}`}
          >
            <span
              aria-hidden="true"
              className={`h-2.5 w-2.5 rounded-full ${sinStock ? "bg-tinta/70" : "bg-verde"}`}
            />
            {sinStock ? "Sin stock" : "A la venta"}
          </p>
          {!borrando && (
            <button
              type="button"
              onClick={() => setBorrando(true)}
              className="-mr-1 inline-flex min-h-11 shrink-0 items-center gap-1 px-1 text-[0.8rem] font-bold text-tinta/70 transition-colors hover:text-rojo"
            >
              <Trash2
                aria-hidden="true"
                className="h-[1.15em] w-[1.15em]"
                strokeWidth={2}
              />{" "}
              Borrar
            </button>
          )}
        </div>
      </div>

      {borrando ? (
        <div
          role="alertdialog"
          aria-labelledby={`borrar-${pieza.id}`}
          className="aparecer mt-3 origin-top rounded-2xl bg-crema-2 p-4"
        >
          <p id={`borrar-${pieza.id}`} className="font-bold leading-snug">
            ¿Borrar la {pieza.nombre} de la tienda para siempre?
          </p>
          <p className="mt-1 text-[0.85rem]">No se puede deshacer.</p>
          <div className="mt-3 flex flex-wrap gap-2">
            <button
              type="button"
              disabled={pendiente}
              onClick={() => start(() => borrarPieza(pieza.id))}
              className={`${chico} boton-rojo`}
            >
              Sí, borrarla
            </button>
            <button
              type="button"
              onClick={() => setBorrando(false)}
              className={`${chico} boton-borde`}
              autoFocus
            >
              No
            </button>
          </div>
        </div>
      ) : editando ? (
        <form
          className="aparecer mt-3 origin-top rounded-2xl bg-crema-2 p-4"
          action={() =>
            start(async () => {
              await cambiarPrecio(pieza.id, Number(precio.replace(/\D/g, "")));
              setEditando(false);
            })
          }
        >
          <label
            htmlFor={`precio-${pieza.id}`}
            className="block text-[0.85rem] font-bold"
          >
            Precio nuevo
          </label>
          {/* El $ va adentro del campo y el número se muestra con puntos, como se escribe a mano */}
          <div className="mt-1.5 flex min-h-14 items-center gap-1 rounded-2xl border-2 border-crema-3 bg-white px-4 transition-[border-color,box-shadow] duration-200 focus-within:border-rojo focus-within:shadow-[0_0_0_4px_var(--color-rosa)]">
            <span
              aria-hidden="true"
              className="text-[1.3rem] font-bold text-rojo"
            >
              $
            </span>
            <input
              id={`precio-${pieza.id}`}
              inputMode="numeric"
              autoComplete="off"
              value={precio ? Number(precio).toLocaleString("es-AR") : ""}
              onChange={(e) =>
                setPrecio(e.target.value.replace(/\D/g, "").slice(0, 9))
              }
              onFocus={(e) => e.target.select()}
              aria-describedby={`antes-${pieza.id}`}
              data-foco-marco
              className="w-full min-w-0 bg-transparent py-2 text-[1.3rem] font-bold text-tinta"
              autoFocus
            />
          </div>
          <p
            id={`antes-${pieza.id}`}
            className="mt-1.5 text-[0.8rem] text-tinta/70"
          >
            Antes: {formatoPrecio(pieza.precio)}
          </p>
          <div className="mt-4 flex items-center gap-2">
            <button
              className={`${chico} boton-rojo flex-1`}
              disabled={pendiente || !precio || Number(precio) === pieza.precio}
            >
              {pendiente ? "Guardando…" : "Guardar"}
            </button>
            <button
              type="button"
              className="min-h-11 rounded-full px-4 text-[0.8rem] font-bold text-tinta/70 transition-colors hover:text-rojo"
              onClick={() => {
                setPrecio(String(pieza.precio));
                setEditando(false);
              }}
            >
              Cancelar
            </button>
          </div>
        </form>
      ) : (
        <div className="mt-3 flex flex-wrap items-center gap-2">
          <button
            type="button"
            disabled={pendiente}
            onClick={() =>
              start(() =>
                cambiarEstado(pieza.id, sinStock ? "disponible" : "sin-stock"),
              )
            }
            className={`${chico} ${sinStock ? "boton-borde" : "boton-rojo"}`}
          >
            {sinStock ? "Volví a tener" : "La vendí"}
          </button>
          <button
            type="button"
            onClick={() => setEditando(true)}
            className={`${chico} boton-borde`}
          >
            Cambiar precio
          </button>
        </div>
      )}
    </li>
  );
}

export function ListaPiezas({ piezas }: { piezas: Pieza[] }) {
  return (
    <ul className="mt-6 grid gap-x-6 gap-y-10 sm:grid-cols-2">
      {piezas.map((p) => (
        <TarjetaTaller key={p.id} pieza={p} />
      ))}
    </ul>
  );
}
