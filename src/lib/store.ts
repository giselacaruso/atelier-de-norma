import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { randomUUID } from "crypto";

export type Estado = "disponible" | "reservada" | "sin-stock";

export type Pieza = {
  id: string;
  nombre: string;
  precio: number;
  foto: string;
  estado: Estado;
  creada: number;
};

export type Reserva = {
  id: string;
  piezaId: string;
  nombre: string;
  telefono: string;
  creada: number;
  estado: "pendiente" | "pagada" | "cancelada";
  recordada?: boolean;
};

export type Suscripcion = {
  endpoint: string;
  keys: { p256dh: string; auth: string };
};

export type DB = {
  piezas: Pieza[];
  reservas: Reserva[];
  suscripciones: Suscripcion[];
  ultimaActividad: number;
};

/*
 * Dónde se guardan los datos:
 * - En Vercel, con Upstash Redis (KV_REST_API_URL / KV_REST_API_TOKEN) desde el Marketplace.
 * - En local, en un archivo .data/db.json.
 * Para una tienda de ~50 piezas, un solo documento JSON alcanza y sobra.
 */
const KV_URL = process.env.KV_REST_API_URL;
const KV_TOKEN = process.env.KV_REST_API_TOKEN;
const KEY = "atelier:db";
// En Vercel el disco es de solo lectura: sin Redis, se usa /tmp (sirve para probar, se borra solo).
const DIR = process.env.VERCEL ? "/tmp/atelier" : path.join(process.cwd(), ".data");
const ARCHIVO = path.join(DIR, "db.json");

const dia = 24 * 60 * 60 * 1000;
export const HORA = 60 * 60 * 1000;

function semilla(): DB {
  const ahora = Date.now();
  const muestras: [string, number, Estado][] = [
    ["Taza Moñitos", 9500, "disponible"],
    ["Taza Picnic", 9800, "disponible"],
    ["Taza Tulipanes", 9500, "disponible"],
    ["Taza Rombos", 9000, "disponible"],
    ["Taza Nube", 12000, "sin-stock"],
    ["Taza Solcito", 10500, "disponible"],
  ];
  return {
    piezas: muestras.map(([nombre, precio, estado], i) => ({
      id: `muestra-${i + 1}`,
      nombre,
      precio,
      foto: `/muestras/tazas/${i + 1}.webp`,
      estado,
      creada: ahora - (i + 1) * dia,
    })),
    reservas: [],
    suscripciones: [],
    ultimaActividad: ahora,
  };
}

async function kv(comando: unknown[]) {
  const res = await fetch(KV_URL!, {
    method: "POST",
    headers: { Authorization: `Bearer ${KV_TOKEN}` },
    body: JSON.stringify(comando),
    cache: "no-store",
  });
  if (!res.ok) throw new Error(`Redis: ${res.status}`);
  return (await res.json()).result;
}

export async function leer(): Promise<DB> {
  if (KV_URL && KV_TOKEN) {
    const raw = await kv(["GET", KEY]);
    if (raw) return JSON.parse(raw);
  } else {
    try {
      return JSON.parse(await fs.readFile(ARCHIVO, "utf8"));
    } catch {}
  }
  const db = semilla();
  await guardar(db);
  return db;
}

async function guardar(db: DB) {
  if (KV_URL && KV_TOKEN) {
    await kv(["SET", KEY, JSON.stringify(db)]);
  } else {
    await fs.mkdir(DIR, { recursive: true });
    await fs.writeFile(ARCHIVO, JSON.stringify(db, null, 2));
  }
}

/** Lee, aplica un cambio y guarda. */
export async function cambiar<T>(fn: (db: DB) => T): Promise<T> {
  const db = await leer();
  const r = fn(db);
  await guardar(db);
  return r;
}

export const nuevoId = () => randomUUID().slice(0, 8);
