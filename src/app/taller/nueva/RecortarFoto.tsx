"use client";

import { useEffect, useRef, useState } from "react";
import { Check } from "lucide-react";

type Punto = { x: number; y: number }; // 0..1 sobre la foto
type Caja = { x0: number; y0: number; x1: number; y1: number };

/** Caja que encierra lo que pintó, con un margen para no comerle los bordes a la pieza. */
function cajaDe(puntos: Punto[]): Caja | null {
  if (puntos.length < 2) return null;
  let x0 = 1, y0 = 1, x1 = 0, y1 = 0;
  for (const p of puntos) {
    x0 = Math.min(x0, p.x);
    y0 = Math.min(y0, p.y);
    x1 = Math.max(x1, p.x);
    y1 = Math.max(y1, p.y);
  }
  const mx = (x1 - x0) * 0.15 + 0.03;
  const my = (y1 - y0) * 0.15 + 0.03;
  const c = { x0: Math.max(0, x0 - mx), y0: Math.max(0, y0 - my), x1: Math.min(1, x1 + mx), y1: Math.min(1, y1 + my) };
  // Si pintó muy poquito (un toque), no alcanza para saber dónde está la pieza.
  return c.x1 - c.x0 < 0.12 || c.y1 - c.y0 < 0.12 ? null : c;
}

/** Recorta la foto a la caja elegida y la devuelve como un archivo nuevo. */
async function recortar(archivo: File, c: Caja): Promise<File> {
  const img = await createImageBitmap(archivo);
  const sx = Math.round(c.x0 * img.width);
  const sy = Math.round(c.y0 * img.height);
  const sw = Math.round((c.x1 - c.x0) * img.width);
  const sh = Math.round((c.y1 - c.y0) * img.height);
  const lienzo = document.createElement("canvas");
  lienzo.width = sw;
  lienzo.height = sh;
  lienzo.getContext("2d")!.drawImage(img, sx, sy, sw, sh, 0, 0, sw, sh);
  const blob = await new Promise<Blob>((ok) => lienzo.toBlob((b) => ok(b!), "image/jpeg", 0.92));
  return new File([blob], "recorte.jpg", { type: "image/jpeg" });
}

export function RecortarFoto({
  archivo,
  onListo,
  onVolver,
}: {
  archivo: File;
  onListo: (recorte: File) => void;
  onVolver: () => void;
}) {
  const [url, setUrl] = useState("");
  useEffect(() => {
    const u = URL.createObjectURL(archivo);
    setUrl(u);
    return () => URL.revokeObjectURL(u);
  }, [archivo]);
  const [puntos, setPuntos] = useState<Punto[]>([]);
  const [trabajando, setTrabajando] = useState(false);
  const pintando = useRef(false);
  const zona = useRef<HTMLDivElement>(null);
  const titulo = useRef<HTMLHeadingElement>(null);
  useEffect(() => titulo.current?.focus(), []);

  const caja = cajaDe(puntos);

  function punto(e: React.PointerEvent): Punto {
    const r = zona.current!.getBoundingClientRect();
    return {
      x: Math.min(1, Math.max(0, (e.clientX - r.left) / r.width)),
      y: Math.min(1, Math.max(0, (e.clientY - r.top) / r.height)),
    };
  }

  const trazo = puntos.map((p, i) => `${i ? "L" : "M"}${p.x * 100} ${p.y * 100}`).join(" ");

  return (
    <section className="mt-8">
      <p className="text-lg font-bold uppercase tracking-wide text-rojo-oscuro">Paso 1 de 3</p>
      <h1 ref={titulo} tabIndex={-1} className="titulo text-[2rem] leading-tight text-rojo outline-none">
        Pintá con el dedo encima de la pieza
      </h1>
      <p className="mt-3 text-xl">
        Pasá el dedo por arriba de la pieza, como si la pintaras. <strong>Lo que quede afuera del marco no se va a ver.</strong>
      </p>

      <div
        ref={zona}
        className="relative mt-6 touch-none select-none overflow-hidden rounded-[28px] border-4 border-rojo"
        onPointerDown={(e) => {
          (e.target as Element).setPointerCapture?.(e.pointerId);
          pintando.current = true;
          // Cada vez que vuelve a apoyar el dedo, suma a lo que ya pintó.
          setPuntos((ps) => [...ps, punto(e)]);
        }}
        onPointerMove={(e) => {
          if (pintando.current) setPuntos((ps) => [...ps, punto(e)]);
        }}
        onPointerUp={() => (pintando.current = false)}
        onPointerCancel={() => (pintando.current = false)}
      >
        {/* eslint-disable-next-line @next/next/no-img-element */}
        {url && <img src={url} alt="Tu foto" className="block w-full" draggable={false} />}
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="pointer-events-none absolute inset-0 h-full w-full" aria-hidden="true">
          {caja && (
            <>
              {/* Oscurece lo que queda afuera */}
              <path
                fillRule="evenodd"
                fill="rgba(30,15,30,0.55)"
                d={`M0 0H100V100H0Z M${caja.x0 * 100} ${caja.y0 * 100}V${caja.y1 * 100}H${caja.x1 * 100}V${caja.y0 * 100}Z`}
              />
              <rect
                x={caja.x0 * 100}
                y={caja.y0 * 100}
                width={(caja.x1 - caja.x0) * 100}
                height={(caja.y1 - caja.y0) * 100}
                fill="none"
                stroke="#fff"
                strokeWidth="1.2"
                vectorEffect="non-scaling-stroke"
                style={{ strokeWidth: 5 }}
              />
            </>
          )}
          {trazo && (
            <path
              d={trazo}
              fill="none"
              stroke="rgba(232,120,60,0.75)"
              strokeLinecap="round"
              strokeLinejoin="round"
              vectorEffect="non-scaling-stroke"
              style={{ strokeWidth: 22 }}
            />
          )}
        </svg>
      </div>

      <p className="mt-3 text-lg" aria-live="polite">
        {caja ? "¿Quedó la pieza adentro del marco blanco?" : "Todavía no pintaste la pieza."}
      </p>

      <button
        type="button"
        disabled={!caja || trabajando}
        onClick={async () => {
          setTrabajando(true);
          onListo(await recortar(archivo, caja!));
        }}
        className="boton boton-rojo mt-4 w-full !min-h-20 text-[1.4rem]"
      >
        <Check aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} /> Usar esta parte
      </button>
      {puntos.length > 0 && (
        <button type="button" onClick={() => setPuntos([])} className="boton boton-borde mt-4 w-full text-xl">
          Borrar y pintar de nuevo
        </button>
      )}
      <button type="button" onClick={onVolver} className="mt-4 w-full text-lg text-rojo underline">
        Volver a las fotos de antes
      </button>
    </section>
  );
}
