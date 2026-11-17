"use client";

import { useState } from "react";
import { procesarFoto } from "@/lib/procesar-foto";

type Fila = { n: string; antes: string; sinFondo?: string; original?: string; estado: string };

/** Herramienta interna (solo desarrollo) para generar las piezas de ejemplo. */
export default function Muestras() {
  const [filas, setFilas] = useState<Fila[]>([]);

  async function correr() {
    const nums: string[] = await (await fetch("/api/dev-muestras")).json();
    for (const n of nums) {
      const url = `/api/dev-muestras?n=${n}`;
      setFilas((f) => [...f, { n, antes: url, estado: "procesando…" }]);
      const blob = await (await fetch(url)).blob();
      const r = await procesarFoto(new File([blob], `${n}.jpg`, { type: "image/jpeg" }), (t) =>
        setFilas((f) => f.map((x) => (x.n === n ? { ...x, estado: t } : x))),
      );
      const form = new FormData();
      form.set("n", n);
      form.set("final", r.sinFondo ?? r.original);
      // "antes": la foto tal cual, en cuadrado, para mostrar la comparación
      const bmp = await createImageBitmap(blob);
      const c = document.createElement("canvas");
      c.width = c.height = 800;
      const lado = Math.min(bmp.width, bmp.height);
      c.getContext("2d")!.drawImage(bmp, (bmp.width - lado) / 2, (bmp.height - lado) / 2, lado, lado, 0, 0, 800, 800);
      form.set("antes", await new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), "image/webp", 0.82)));
      await fetch("/api/dev-muestras", { method: "POST", body: form });
      setFilas((f) =>
        f.map((x) =>
          x.n === n
            ? {
                ...x,
                sinFondo: r.sinFondo ? URL.createObjectURL(r.sinFondo) : undefined,
                original: URL.createObjectURL(r.original),
                estado: r.sinFondo ? "listo (sin fondo)" : "listo (foto original con filtro)",
              }
            : x,
        ),
      );
    }
  }

  return (
    <div className="p-6">
      <button className="boton boton-rojo" onClick={correr} id="correr">
        Procesar muestras
      </button>
      <ul className="mt-6 space-y-6">
        {filas.map((f) => (
          <li key={f.n} className="grid grid-cols-3 gap-4">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img src={f.antes} alt="" className="w-full" />
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {f.sinFondo ? <img src={f.sinFondo} alt="" className="w-full" /> : <p>{f.estado}</p>}
            {/* eslint-disable-next-line @next/next/no-img-element */}
            {f.original && <img src={f.original} alt="" className="w-full" />}
          </li>
        ))}
      </ul>
    </div>
  );
}
