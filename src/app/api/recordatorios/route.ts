import { cambiar, leer, HORA } from "@/lib/store";
import { avisarANorma } from "@/lib/push";

/*
 * Recordatorio diario (Vercel Cron, 10 h de Argentina).
 * Las ventas pasan por WhatsApp, así que el único aviso es para que la tienda no quede vieja:
 * una semana sin tocar nada → "¿Sigue todo igual en el taller?"
 */
export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`)
    return new Response("No autorizado", { status: 401 });

  const db = await leer();
  const ahora = Date.now();
  if (ahora - db.ultimaActividad > 7 * 24 * HORA) {
    await avisarANorma("¿Sigue todo igual en el taller?", "Si hiciste tazas nuevas o se vendió alguna, tocá acá.");
    await cambiar((d) => (d.ultimaActividad = ahora));
    return Response.json({ aviso: true });
  }
  return Response.json({ aviso: false });
}
