import { cambiar, leer, respaldar, HORA } from "@/lib/store";
import { avisarANorma } from "@/lib/push";

/*
 * Recordatorio diario (Vercel Cron, 10 h de Argentina).
 * Las ventas pasan por WhatsApp, así que el único aviso es para que la tienda no quede vieja:
 * una semana sin tocar nada → "¿Sigue todo igual en el taller?"
 * Antes de eso, la copia de seguridad del día (ver /api/respaldos).
 */
export async function GET(req: Request) {
  const secreto = process.env.CRON_SECRET;
  if (secreto && req.headers.get("authorization") !== `Bearer ${secreto}`)
    return new Response("No autorizado", { status: 401 });

  // La copia va primero y aparte: si falla el aviso, igual queda hecha.
  const copia = await respaldar().catch((e) => ({ error: String(e) }));

  const db = await leer();
  const ahora = Date.now();
  if (ahora - db.ultimaActividad > 7 * 24 * HORA) {
    await avisarANorma("¿Sigue todo igual en el taller?", "Si hiciste tazas nuevas o se vendió alguna, tocá acá.");
    await cambiar((d) => (d.ultimaActividad = ahora));
    return Response.json({ copia, aviso: true });
  }
  return Response.json({ copia, aviso: false });
}
