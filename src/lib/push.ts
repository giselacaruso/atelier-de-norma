import "server-only";
import * as webpush from "web-push";
import { cambiar, leer } from "./store";

const PUB = process.env.NEXT_PUBLIC_VAPID_PUBLIC_KEY;
const PRIV = process.env.VAPID_PRIVATE_KEY;
if (PUB && PRIV) webpush.setVapidDetails("mailto:taller@example.com", PUB, PRIV);

/** Le manda una notificación al celular de Norma (a todos los dispositivos que activó). */
export async function avisarANorma(titulo: string, cuerpo: string, url = "/taller") {
  if (!PUB || !PRIV) return 0;
  const { suscripciones } = await leer();
  const vencidas: string[] = [];
  let enviadas = 0;
  await Promise.all(
    suscripciones.map(async (s) => {
      try {
        await webpush.sendNotification(s, JSON.stringify({ titulo, cuerpo, url }), { TTL: 60 * 60 * 24 });
        enviadas++;
      } catch (e) {
        const code = (e as { statusCode?: number }).statusCode;
        if (code === 404 || code === 410) vencidas.push(s.endpoint);
      }
    }),
  );
  if (vencidas.length) {
    await cambiar((db) => {
      db.suscripciones = db.suscripciones.filter((s) => !vencidas.includes(s.endpoint));
    });
  }
  return enviadas;
}
