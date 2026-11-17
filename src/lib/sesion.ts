import "server-only";
import { cookies, headers } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";
import { borrarIntentos, leerIntentos, sumarIntento } from "./store";

const COOKIE = "taller";
const dev = process.env.NODE_ENV === "development";
// Si en el servidor falta el PIN o el secreto, el taller queda cerrado (salvo en la compu, para desarrollar).
const secreto = () => process.env.SESSION_SECRET || (dev ? "dev-secret" : "");
const pin = () => process.env.ADMIN_PIN || (dev ? "1234" : "");

/** Después de 5 intentos mal, hay que esperar 15 minutos. Así nadie puede probar los 10.000 PIN. */
export const MAX_INTENTOS = 5;
const ESPERA = 15 * 60;

function firma() {
  return createHmac("sha256", secreto()).update(`norma:${pin()}`).digest("hex");
}

/** La conexión desde donde se intenta entrar (Vercel la completa y no se puede falsear). */
async function quien() {
  const h = await headers();
  return (h.get("x-forwarded-for")?.split(",")[0] || h.get("x-real-ip") || "local").trim();
}

export type Ingreso = { ok: true } | { ok: false; restantes: number; minutos: number };

export async function entrar(intento: string): Promise<Ingreso> {
  const clave = await quien();
  const { n, segundos } = await leerIntentos(clave);
  if (n >= MAX_INTENTOS) return { ok: false, restantes: 0, minutos: Math.max(1, Math.ceil(segundos / 60)) };

  const a = Buffer.from(intento.padEnd(16));
  const b = Buffer.from(pin().padEnd(16));
  const correcto = !!pin() && !!secreto() && a.length === b.length && timingSafeEqual(a, b);

  if (!correcto) {
    const fallados = await sumarIntento(clave, ESPERA);
    return { ok: false, restantes: Math.max(0, MAX_INTENTOS - fallados), minutos: ESPERA / 60 };
  }

  await borrarIntentos(clave);
  // Queda abierta un año: Norma no tiene que volver a poner el PIN.
  (await cookies()).set(COOKIE, firma(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return { ok: true };
}

export async function esNorma() {
  if (!pin() || !secreto()) return false;
  return (await cookies()).get(COOKIE)?.value === firma();
}
