import Image from "next/image";
import type { Pieza } from "@/lib/store";
import { formatoPrecio, linkCompra, linkWhatsApp } from "@/config";

/** Círculo negro en el lateral derecho de la foto. La foto no se apaga: la taza se ve con su color real. */
export function Etiqueta({ estado, chica = false }: { estado: Pieza["estado"]; chica?: boolean }) {
  if (estado === "disponible") return null;
  return (
    <span
      className={`absolute grid rotate-[-8deg] place-items-center rounded-full bg-black text-center font-bold uppercase leading-[1.05] tracking-wide text-white shadow-md ${
        chica ? "-right-2 top-4 h-[4.2rem] w-[4.2rem] text-[0.62rem]" : "-right-3 top-5 h-[5.6rem] w-[5.6rem] text-[0.8rem]"
      }`}
    >
      Sin
      <br />
      stock
    </span>
  );
}

/** Una pieza del catálogo: foto, nombre, precio y el botón que abre WhatsApp con el pedido listo. */
export function TarjetaPieza({ pieza, sitio }: { pieza: Pieza; sitio: string }) {
  const disponible = pieza.estado === "disponible";
  return (
    <li className="group flex flex-col items-center text-center">
      <div className="relative w-full max-w-[22rem]">
        {/* Al pasar el mouse (o llegar con el teclado) la foto se acerca apenas, dentro de su marco */}
        <div className="overflow-hidden rounded-[1.5rem]">
          <Image
            src={pieza.foto}
            alt={pieza.nombre}
            width={700}
            height={700}
            sizes="(min-width: 1024px) 30vw, (min-width: 640px) 45vw, 90vw"
            className="aspect-square w-full object-cover transition-transform duration-500 ease-[var(--ease-out-expo)] motion-safe:group-hover:scale-[1.03] motion-safe:group-focus-within:scale-[1.03]"
          />
        </div>
        <Etiqueta estado={pieza.estado} />
      </div>
      <h3 className="mt-5 text-[1.3rem] font-medium leading-tight text-rojo">{pieza.nombre}</h3>
      <p className="mt-1 text-[1.15rem] font-bold text-rojo">{formatoPrecio(pieza.precio)}</p>
      <div className="mt-4 w-full max-w-[16rem]">
        {disponible ? (
          <a
            href={linkCompra(pieza, sitio)}
            target="_blank"
            rel="noopener noreferrer"
            className="boton boton-rojo w-full"
          >
            La quiero
          </a>
        ) : (
          <a
            href={linkWhatsApp(`Hola Norma, ¿vas a volver a hacer la ${pieza.nombre}?`)}
            target="_blank"
            rel="noopener noreferrer"
            className="boton boton-borde w-full"
          >
            Preguntar si vuelve
          </a>
        )}
      </div>
    </li>
  );
}
