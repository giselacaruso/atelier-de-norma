import Link from "next/link";
import { Plus, Store } from "lucide-react";
import { leer } from "@/lib/store";
import { esNorma } from "@/lib/sesion";
import { Logo, CaraNorma } from "@/components/Marca";
import { IngresoPin } from "./IngresoPin";
import { Avisos } from "./Avisos";
import { ListaPiezas } from "./ListaPiezas";

export const dynamic = "force-dynamic";

function saludo() {
  const h = Number(new Date().toLocaleString("en-US", { hour: "numeric", hour12: false, timeZone: "America/Argentina/Buenos_Aires" }));
  return h < 13 ? "Buen día" : h < 20 ? "Buenas tardes" : "Buenas noches";
}

export default async function Taller() {
  if (!(await esNorma())) return <IngresoPin />;

  const { piezas } = await leer();

  return (
    <>
      <header className="flex items-center justify-between gap-4 border-b-2 border-crema-2 pb-5">
        <Logo className="text-[1.3rem] text-rojo" />
        <Link
          href="/"
          className="inline-flex min-h-11 items-center gap-2 rounded-full px-1 text-[0.9rem] font-bold text-rojo transition-colors hover:text-rojo-oscuro"
        >
          <Store aria-hidden="true" className="h-5 w-5" strokeWidth={2} />
          Ver la tienda
        </Link>
      </header>

      <div className="mt-8 flex items-center gap-4">
        <CaraNorma className="h-16 w-16 shrink-0" />
        <div>
          <h1 className="titulo text-[1.6rem] text-rojo">{saludo()}, Norma</h1>
        </div>
      </div>

      <Link href="/taller/nueva" className="boton boton-rojo mt-8 w-full !min-h-16">
        <Plus aria-hidden="true" className="h-6 w-6" strokeWidth={2.25} /> Nuevo producto
      </Link>

      <section aria-labelledby="mis-piezas" className="mt-12">
        <h2 id="mis-piezas" className="titulo text-[1.5rem] text-rojo">
          Tus piezas en venta
        </h2>
        <ListaPiezas piezas={piezas} />
      </section>

      <Avisos />
    </>
  );
}
