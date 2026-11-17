"use client";

import Link from "next/link";
import { ArrowLeft, ArrowRight, Camera, Check, Pointer } from "lucide-react";
import { useEffect, useMemo, useRef, useState, useTransition } from "react";
import { agregarPieza } from "@/app/acciones";
import { procesarFoto, type Resultado } from "@/lib/procesar-foto";
import { formatoPrecio } from "@/config";
import { RecortarFoto } from "./RecortarFoto";

type Paso = "foto" | "procesando" | "elegir" | "recortar" | "nombre" | "precio" | "listo";

export function NuevaPieza() {
  const [paso, setPaso] = useState<Paso>("foto");
  const [progreso, setProgreso] = useState("");
  const [resultado, setResultado] = useState<Resultado | null>(null);
  const [archivo, setArchivo] = useState<File | null>(null);
  const [elegida, setElegida] = useState<Blob | null>(null);
  const [nombre, setNombre] = useState("");
  const [precio, setPrecio] = useState("");
  const [error, setError] = useState("");
  const [guardando, start] = useTransition();
  const titulo = useRef<HTMLHeadingElement>(null);
  const campo = useRef<HTMLInputElement>(null);

  // En los pasos con texto, abre el teclado directo en el campo.
  // En los demás, lleva el foco al título (para lectores de pantalla).
  useEffect(() => (campo.current ?? titulo.current)?.focus(), [paso]);

  const urlSinFondo = useMemo(() => resultado?.sinFondo && URL.createObjectURL(resultado.sinFondo), [resultado]);
  const urlOriginal = useMemo(() => resultado && URL.createObjectURL(resultado.original), [resultado]);
  const urlElegida = useMemo(() => elegida && URL.createObjectURL(elegida), [elegida]);

  async function alElegirFoto(e: React.ChangeEvent<HTMLInputElement>) {
    const elegido = e.target.files?.[0];
    e.target.value = "";
    if (!elegido) return;
    setArchivo(elegido);
    await procesar(elegido);
  }

  async function procesar(archivo: File) {
    setPaso("procesando");
    const r = await procesarFoto(archivo, setProgreso);
    setResultado(r);
    if (r.sinFondo) setPaso("elegir");
    else {
      setElegida(r.original);
      setPaso("nombre");
    }
  }

  function guardar() {
    setError("");
    const form = new FormData();
    form.set("foto", elegida!, "pieza.webp");
    form.set("nombre", nombre);
    form.set("precio", precio);
    start(async () => {
      try {
        await agregarPieza(form);
        setPaso("listo");
      } catch {
        setError("Uy, no se pudo guardar. Revisá que tengas internet y probá de nuevo.");
      }
    });
  }

  const h = "titulo text-[2rem] leading-tight text-rojo outline-none";
  const numero = (n: number) => (
    <p className="text-lg font-bold uppercase tracking-wide text-rojo-oscuro">Paso {n} de 3</p>
  );

  return (
    <div>
      {paso !== "listo" && (
        <Link href="/taller" className="boton boton-borde">
          <ArrowLeft aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} /> Volver
        </Link>
      )}

      {paso === "foto" && (
        <section className="mt-8">
          {numero(1)}
          <h1 ref={titulo} tabIndex={-1} className={h}>Sacale una foto a la pieza</h1>
          <p className="mt-3 text-xl">
            No te preocupes por el fondo ni por el encuadre: <strong>yo la acomodo</strong>.
            Solo tratá de que haya buena luz.
          </p>
          <label className="boton boton-rojo mt-8 w-full !min-h-28 !rounded-[28px] text-[1.5rem]">
            <Camera aria-hidden="true" className="h-9 w-9" strokeWidth={1.75} /> Abrir la cámara
            <input type="file" accept="image/*" capture="environment" className="sr-only" onChange={alElegirFoto} />
          </label>
          <label className="boton boton-borde mt-4 w-full !min-h-16 text-xl">
            Elegir una foto que ya tengo
            <input type="file" accept="image/*" className="sr-only" onChange={alElegirFoto} />
          </label>
        </section>
      )}

      {paso === "procesando" && (
        <section className="mt-16 flex flex-col items-center text-center" aria-live="polite">
          <div className="h-20 w-20 animate-spin rounded-full border-8 border-crema-3 border-t-rojo" aria-hidden="true" />
          <h1 ref={titulo} tabIndex={-1} className={`${h} mt-8`}>Un momentito…</h1>
          <p className="mt-3 text-xl">{progreso}</p>
        </section>
      )}

      {paso === "elegir" && resultado && (
        <section className="mt-8">
          {numero(1)}
          <h1 ref={titulo} tabIndex={-1} className={h}>¿Cuál te gusta más?</h1>
          <div className="mt-6 grid gap-6 sm:grid-cols-2">
            <button
              type="button"
              onClick={() => {
                setElegida(resultado.sinFondo);
                setPaso("nombre");
              }}
              className="rounded-[28px] border-4 border-rojo bg-crema-2 p-3 text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlSinFondo!} alt="La pieza acomodada sobre fondo crema" className="w-full rounded-2xl" />
              <span className="boton boton-rojo mt-3 w-full"><Check aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} /> Así está bien</span>
            </button>
            <button
              type="button"
              onClick={() => {
                setElegida(resultado.original);
                setPaso("nombre");
              }}
              className="rounded-[28px] border-4 border-crema-3 bg-crema-2 p-3 text-left"
            >
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src={urlOriginal!} alt="Tu foto como la sacaste" className="w-full rounded-2xl" />
              <span className="boton boton-borde mt-3 w-full">Dejar mi foto como la saqué</span>
            </button>
          </div>
          {archivo && (
            <div className="mt-8 rounded-[28px] bg-crema-2 p-5">
              <p className="text-xl font-bold">¿Quedaron otras cosas al lado de la pieza?</p>
              <p className="mt-1 text-lg">Mostrame dónde está y la acomodo de nuevo.</p>
              <button type="button" onClick={() => setPaso("recortar")} className="boton boton-borde mt-4 w-full text-xl">
                <Pointer aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} /> Mostrar dónde está la pieza
              </button>
            </div>
          )}
        </section>
      )}

      {paso === "recortar" && archivo && (
        <RecortarFoto archivo={archivo} onListo={procesar} onVolver={() => setPaso("elegir")} />
      )}

      {paso === "nombre" && (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (nombre.trim()) setPaso("precio");
          }}
        >
          {numero(2)}
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {urlElegida && <img src={urlElegida} alt="" className="mb-6 w-40 rounded-2xl" />}
          <h1 ref={titulo} tabIndex={-1} className={h}>
            <label htmlFor="nombre">¿Cómo se llama la pieza?</label>
          </h1>
          <p className="mt-2 text-lg">Por ejemplo: “Taza con florcitas”. Podés tocar el micrófono del teclado y decirlo.</p>
          <input
            ref={campo}
            id="nombre"
            value={nombre}
            onChange={(e) => setNombre(e.target.value)}
            className="campo mt-4 text-2xl"
            autoComplete="off"
            enterKeyHint="next"
          />
          <button className="boton boton-rojo mt-6 w-full text-xl" disabled={!nombre.trim()}>
            Seguir <ArrowRight aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} />
          </button>
          {resultado && (
            <button type="button" className="mt-4 w-full text-lg text-rojo underline" onClick={() => setPaso("foto")}>
              Sacar otra foto
            </button>
          )}
        </form>
      )}

      {paso === "precio" && (
        <form
          className="mt-8"
          onSubmit={(e) => {
            e.preventDefault();
            if (Number(precio) > 0) guardar();
          }}
        >
          {numero(3)}
          <h1 ref={titulo} tabIndex={-1} className={h}>
            <label htmlFor="precio">¿Cuánto sale?</label>
          </h1>
          <div className="mt-4 flex items-center gap-3">
            <span className="text-[2.4rem] font-bold">$</span>
            <input
              ref={campo}
              id="precio"
              inputMode="numeric"
              value={precio}
              onChange={(e) => setPrecio(e.target.value.replace(/\D/g, ""))}
              className="campo !min-h-20 text-[2.2rem]"
              enterKeyHint="done"
            />
          </div>
          {Number(precio) > 0 && <p className="mt-2 text-xl">Se va a ver así: <strong>{formatoPrecio(Number(precio))}</strong></p>}
          {error && (
            <p role="alert" className="mt-4 text-xl font-bold text-rojo-oscuro">
              {error}
            </p>
          )}
          <button className="boton boton-rojo mt-6 w-full !min-h-20 text-[1.4rem]" disabled={!(Number(precio) > 0) || guardando}>
            {guardando ? "Subiendo…" : "Subir a la tienda"}
          </button>
          <button type="button" className="mt-4 w-full text-lg text-rojo underline" onClick={() => setPaso("nombre")}>
            Volver a cambiar el nombre
          </button>
        </form>
      )}

      {paso === "listo" && (
        <section className="mt-12 flex flex-col items-center text-center" aria-live="polite">
          {/* eslint-disable-next-line @next/next/no-img-element */}
          {urlElegida && <img src={urlElegida} alt="" className="w-64 rounded-[28px]" />}
          <h1 ref={titulo} tabIndex={-1} className={`${h} mt-6`}>¡Listo, Norma!</h1>
          <p className="mt-2 text-xl">
            <strong>{nombre}</strong> ya está en tu tienda a <strong>{formatoPrecio(Number(precio))}</strong>.
          </p>
          <button
            type="button"
            className="boton boton-rojo mt-8 w-full text-xl"
            onClick={() => {
              setResultado(null);
              setArchivo(null);
              setElegida(null);
              setNombre("");
              setPrecio("");
              setPaso("foto");
            }}
          >
            <Camera aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} /> Agregar otra
          </button>
          <Link href="/taller" className="boton boton-borde mt-4 w-full text-xl">
            Volver a mi taller
          </Link>
        </section>
      )}
    </div>
  );
}
