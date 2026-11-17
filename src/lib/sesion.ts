import "server-only";
import { cookies } from "next/headers";
import { createHmac, timingSafeEqual } from "crypto";

const COOKIE = "taller";
const secreto = () => process.env.SESSION_SECRET || "dev-secret";
const pin = () => process.env.ADMIN_PIN || "1234";

function firma() {
  return createHmac("sha256", secreto()).update(`norma:${pin()}`).digest("hex");
}

export async function entrar(intento: string) {
  const a = Buffer.from(intento.padEnd(16));
  const b = Buffer.from(pin().padEnd(16));
  if (a.length !== b.length || !timingSafeEqual(a, b)) return false;
  // Queda abierta un año: Norma no tiene que volver a poner el PIN.
  (await cookies()).set(COOKIE, firma(), {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: 60 * 60 * 24 * 365,
    path: "/",
  });
  return true;
}

export async function esNorma() {
  return (await cookies()).get(COOKIE)?.value === firma();
}
