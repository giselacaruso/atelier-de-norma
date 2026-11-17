import "server-only";
import { headers } from "next/headers";

/** Dirección pública del sitio (para los links que van por WhatsApp y la vista previa con foto). */
export async function sitio() {
  if (process.env.NEXT_PUBLIC_SITIO) return process.env.NEXT_PUBLIC_SITIO.replace(/\/$/, "");
  const h = await headers();
  const host = h.get("x-forwarded-host") ?? h.get("host") ?? "localhost:3000";
  const proto = h.get("x-forwarded-proto") ?? (host.startsWith("localhost") ? "http" : "https");
  return `${proto}://${host}`;
}
