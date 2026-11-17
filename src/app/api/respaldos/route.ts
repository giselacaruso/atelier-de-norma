import { revalidatePath } from "next/cache";
import { listarRespaldos, respaldar, restaurar } from "@/lib/store";

/*
 * Copias de seguridad de la tienda. Solo con la clave CRON_SECRET (no es para Norma).
 *   GET                          → lista las copias que hay
 *   POST {"accion":"respaldar"}  → hace una copia ahora
 *   POST {"restaurar":"2026-11-17"} → vuelve la tienda a esa copia
 * La copia diaria automática la hace /api/recordatorios.
 */
function autorizado(req: Request) {
  const secreto = process.env.CRON_SECRET;
  return !!secreto && req.headers.get("authorization") === `Bearer ${secreto}`;
}

export async function GET(req: Request) {
  if (!autorizado(req)) return new Response("No autorizado", { status: 401 });
  return Response.json({ copias: await listarRespaldos() });
}

export async function POST(req: Request) {
  if (!autorizado(req)) return new Response("No autorizado", { status: 401 });
  const cuerpo = await req.json().catch(() => ({}));
  try {
    if (typeof cuerpo.restaurar === "string") {
      const r = await restaurar(cuerpo.restaurar);
      revalidatePath("/", "layout");
      return Response.json(r);
    }
    if (cuerpo.accion === "respaldar") return Response.json(await respaldar());
  } catch (e) {
    return Response.json({ error: (e as Error).message }, { status: 400 });
  }
  return Response.json({ error: 'Mandá {"accion":"respaldar"} o {"restaurar":"AAAA-MM-DD"}' }, { status: 400 });
}
