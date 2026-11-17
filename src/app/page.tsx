import Image from "next/image";
import { Gift, Heart, MessageCircleHeart } from "lucide-react";
import Link from "next/link";
import { leer } from "@/lib/store";
import { sitio } from "@/lib/sitio";
import { tienda } from "@/config";
import { Logo } from "@/components/Marca";
import { BotonLetra } from "@/components/BotonLetra";
import { TarjetaPieza } from "@/components/TarjetaPieza";
import { NormaBot, BotonHablar } from "@/components/NormaBot";

export const dynamic = "force-dynamic";

// Fotos del taller para el hero, en marco de Polaroid y sin texto. Son de muestra: en producción van las de Norma.
const fotos = [
  { src: "/norma/jarron.webp", alt: "Norma con un jarrón recién terminado en la mano.", clase: "-rotate-[4deg] translate-y-2 z-10" },
  { src: "/norma/manos.webp", alt: "Las manos de Norma pintando florcitas en una taza.", clase: "rotate-[3deg] -translate-y-1 z-20" },
  { src: "/norma/mate.webp", alt: "Un mate de cerámica de Norma, listo para la primera cebada.", clase: "-rotate-[2deg] translate-y-3 z-10" },
  { src: "/norma/torno.webp", alt: "Norma trabajando una pieza en el torno.", clase: "rotate-[4deg] z-20" },
];

// Con la voz de Norma: cálida, simple, sin palabras de internet.
const pasos = [
  { Icono: Heart, titulo: "Elegí la que más te guste", texto: "Mirá tranquila y tocá “La quiero” en la tuya." },
  { Icono: MessageCircleHeart, titulo: "Mandame el mensajito", texto: "Se abre WhatsApp con todo escrito. Vos solo tocás enviar y yo te contesto enseguida." },
  { Icono: Gift, titulo: "Me transferís y es tuya", texto: "Te paso mi alias y vemos si la venís a buscar al taller o te la mando." },
];

const orden = { disponible: 0, reservada: 1, "sin-stock": 2 } as const;

export default async function Tienda() {
  const { piezas } = await leer();
  const url = await sitio();
  const lista = [...piezas].sort((a, b) => orden[a.estado] - orden[b.estado] || b.creada - a.creada);

  return (
    <>
      {/* ---------- Hero: logo rojo, Polaroids del taller y la frase ---------- */}
      {/* Ocupa todo el alto de la pantalla; el contenido queda centrado en el medio */}
      <header className="mx-auto flex min-h-svh max-w-6xl flex-col px-5 pb-10 pt-5 sm:px-8">
        <div className="flex justify-end">
          <BotonLetra />
        </div>

        <div className="flex flex-1 flex-col justify-center">

        {/* Entrada escalonada: primero el logo, después las fotos de a una, al final la frase. */}
        <h1 className="entrar mt-6 text-center text-rojo sm:mt-4">
          <Logo className="!h-auto w-[min(88%,30rem)]" />
        </h1>

        {/* En el celular: 2 filas de 2, grandes y un poco encimadas. En compu: las 4 en fila. */}
        <div className="mx-auto mt-8 grid max-w-[24rem] grid-cols-2 justify-items-center gap-x-1 gap-y-4 sm:mt-10 sm:flex sm:max-w-none sm:items-start sm:justify-center sm:gap-0">
          {fotos.map((f, i) => (
            <figure
              key={f.src}
              className={`polaroid entrar ${f.clase} ${i ? "sm:-ml-4" : ""}`}
              style={{ "--i": i + 1 } as React.CSSProperties}
            >
              <Image src={f.src} alt={f.alt} width={546} height={546} priority sizes="(min-width: 640px) 260px, 45vw" />
            </figure>
          ))}
        </div>

        <p className="entrar volanta mt-12 text-center text-rojo" style={{ "--i": 6 } as React.CSSProperties}>
          Cerámica hecha con amor. Comprá fácil y rápido.
        </p>
        </div>
      </header>

      {/* ---------- Catálogo: el bloque color horno ---------- */}
      <main id="piezas" className="px-3 sm:px-6">
        <section aria-labelledby="horno" className="horno mx-auto max-w-6xl px-5 pb-16 pt-14 sm:px-10 sm:pb-20 sm:pt-20">
          <div className="flex flex-col items-center text-center">
            <h2 id="horno" className="titulo text-[2.5rem] text-rojo sm:text-[3.6rem]">
              Recién salidito
              <br />
              del horno.
            </h2>
            <BotonHablar className="boton boton-rojo mt-6 !min-h-12">¡Hablemos!</BotonHablar>
          </div>

          {lista.length ? (
            <ul className="mt-14 grid gap-x-6 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
              {lista.map((p) => (
                <TarjetaPieza key={p.id} pieza={p} sitio={url} />
              ))}
            </ul>
          ) : (
            <p className="mt-12 text-center text-xl">Norma está preparando tazas nuevas. ¡Volvé pronto!</p>
          )}
        </section>
      </main>

      {/* ---------- Cómo comprar ---------- */}
      <section aria-labelledby="como" className="mx-auto max-w-6xl px-5 py-20 sm:px-8 sm:py-24">
        <div className="flex flex-col items-center text-center">
          <h2 id="como" className="titulo text-[2.5rem] text-rojo sm:text-[3.6rem]">
            Cómo comprar
          </h2>
        </div>

        <ol className="relative mt-14 grid gap-5 md:grid-cols-3 md:gap-6">
          {pasos.map(({ Icono, titulo, texto }, i) => (
            <li key={titulo} className="relative flex gap-5 rounded-[1.75rem] bg-papel px-0 py-4 md:flex-col md:items-center md:p-8 md:text-center">
              <span className="relative grid h-16 w-16 shrink-0 place-items-center rounded-full bg-rosa ring-8 ring-papel md:h-[5.5rem] md:w-[5.5rem]">
                <Icono aria-hidden="true" className="h-8 w-8 text-rojo md:h-10 md:w-10" strokeWidth={1.6} />
                <span className="absolute -right-1 -top-1 grid h-8 w-8 place-items-center rounded-full bg-rojo text-[0.85rem] font-bold text-white">
                  {i + 1}
                </span>
              </span>
              <span className="md:mt-1">
                <strong className="block text-[1.25rem] font-medium leading-snug text-rojo">{titulo}</strong>
                <span className="mt-1.5 block leading-snug">{texto}</span>
              </span>
            </li>
          ))}
        </ol>
      </section>

      {/* ---------- Pie ---------- */}
      <footer>
        <div className="mx-auto flex max-w-6xl flex-col px-5 sm:px-8">
          <a href="#" className="mx-auto mt-20 text-rojo sm:mt-24" aria-label="Atelier de Norma, volver arriba">
            <Logo className="!h-auto w-[min(70vw,17rem)]" />
          </a>

          {/* Abajo: copyright, la pestaña para entrar al taller pegada al borde, y el crédito */}
          {/* Celular: copyright y crédito juntos, y la pestaña pegada al borde izquierdo a la altura de la carita de Norma */}
          <div className="mt-20 grid text-[0.75rem] leading-snug text-rojo sm:mt-24 sm:grid-cols-[1fr_auto_1fr] sm:items-end sm:gap-8">
            <p className="text-center sm:pb-5 sm:text-left">
              © {new Date().getFullYear()} | {tienda.nombre}. Todos los derechos reservados.
            </p>
            {/* pr: deja lugar a la carita flotante de Norma */}
            <p className="mt-1 text-center sm:order-3 sm:mt-0 sm:pb-5 sm:pr-16 sm:text-right">
              Desarrollado por{" "}
              <a
                href="https://giselacaruso.com"
                target="_blank"
                rel="noopener noreferrer"
                className="font-bold underline decoration-rojo/40 underline-offset-4 transition-colors hover:decoration-rojo"
              >
                giselacaruso.com
              </a>
            </p>
            <Link href="/taller" className="pestana -ml-5 mb-4 mt-12 justify-self-start sm:order-2 sm:mb-0 sm:ml-0 sm:mt-0 sm:justify-self-center">
              Entrar a mi taller
            </Link>
          </div>
        </div>
      </footer>

      <NormaBot />
    </>
  );
}
