import type { Metadata } from "next";
import { ArrowLeft } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { leer } from "@/lib/store";
import { sitio } from "@/lib/sitio";
import { formatoPrecio, linkCompra, linkWhatsApp, tienda } from "@/config";
import { Logo } from "@/components/Marca";
import { Etiqueta } from "@/components/TarjetaPieza";
import { NormaBot } from "@/components/NormaBot";

export const dynamic = "force-dynamic";

/*
 * Esta página no es parte del recorrido de compra (el botón de la tienda va directo a WhatsApp).
 * Es el link que viaja en el mensaje: WhatsApp lee estos datos y le muestra a Norma
 * la foto de la taza, el nombre y el precio.
 */
async function buscar(id: string) {
  const { piezas } = await leer();
  return piezas.find((p) => p.id === id);
}

export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const pieza = await buscar((await params).id);
  if (!pieza) return {};
  const titulo = `${pieza.nombre} · ${formatoPrecio(pieza.precio)}`;
  return {
    title: `${pieza.nombre} · ${tienda.nombre}`,
    openGraph: {
      title: titulo,
      description: `Hecha a mano por Norma. ${tienda.nombre}.`,
      images: [{ url: pieza.foto, width: 1600, height: 1600, alt: pieza.nombre }],
    },
    twitter: { card: "summary_large_image", title: titulo, images: [pieza.foto] },
  };
}

export default async function PaginaPieza({ params }: { params: Promise<{ id: string }> }) {
  const pieza = await buscar((await params).id);
  if (!pieza) notFound();
  const disponible = pieza.estado === "disponible";
  const url = await sitio();

  return (
    <div className="mx-auto max-w-5xl px-5 pb-20 pt-6 sm:px-8">
      <nav className="flex items-center justify-between gap-4">
        <Link href="/#piezas" className="boton boton-borde !min-h-12 text-base">
          <ArrowLeft aria-hidden="true" className="h-[1.1em] w-[1.1em] shrink-0" strokeWidth={2} /> Ver todas las tazas
        </Link>
        <Link href="/" className="hidden text-rojo sm:block" aria-label="Inicio">
          <Logo className="text-[2rem]" />
        </Link>
      </nav>

      <div className="mt-10 grid gap-10 md:grid-cols-2 md:items-center">
        <div className="relative">
          <Image
            src={pieza.foto}
            alt={pieza.nombre}
            width={900}
            height={900}
            priority
            className="aspect-square w-full rounded-[2rem] object-cover"
          />
          <Etiqueta estado={pieza.estado} />
        </div>
        <div>
          <h1 className="titulo text-[2.6rem] text-rojo">{pieza.nombre}</h1>
          <p className="mt-3 text-[1.8rem] font-bold leading-none text-rojo">{formatoPrecio(pieza.precio)}</p>
          {disponible ? (
            <a
              href={linkCompra(pieza, url)}
              target="_blank"
              rel="noopener noreferrer"
              className="boton boton-rojo mt-8 w-full sm:w-auto"
            >
              La quiero
            </a>
          ) : (
            <a
              href={linkWhatsApp(`Hola Norma, ¿vas a volver a hacer la ${pieza.nombre}?`)}
              target="_blank"
              rel="noopener noreferrer"
              className="boton boton-borde mt-8 w-full sm:w-auto"
            >
              Preguntar si vuelve
            </a>
          )}
        </div>
      </div>
      <NormaBot pieza={pieza.nombre} saludar={false} />
    </div>
  );
}
