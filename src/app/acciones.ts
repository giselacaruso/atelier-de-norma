"use server";

import { revalidatePath } from "next/cache";
import { cambiar, nuevoId, type Estado, type Suscripcion } from "@/lib/store";
import { guardarFoto } from "@/lib/fotos";
import { entrar, esNorma } from "@/lib/sesion";
import { avisarANorma } from "@/lib/push";

function refrescar() {
  revalidatePath("/");
  revalidatePath("/taller");
}

async function soloNorma() {
  if (!(await esNorma())) throw new Error("No autorizado");
}

/* ---------- Norma ---------- */

export async function ingresar(pin: string) {
  return entrar(String(pin).slice(0, 16));
}

export async function agregarPieza(form: FormData) {
  await soloNorma();
  const foto = form.get("foto");
  const nombre = String(form.get("nombre") || "").trim().slice(0, 80);
  const precio = Math.round(Number(String(form.get("precio") || "").replace(/\D/g, "")));
  if (!(foto instanceof Blob) || !nombre || !precio) throw new Error("Faltan datos");
  const url = await guardarFoto(foto);
  const id = nuevoId();
  await cambiar((db) => {
    db.piezas.unshift({ id, nombre, precio, foto: url, estado: "disponible", creada: Date.now() });
    db.ultimaActividad = Date.now();
  });
  refrescar();
  return id;
}

export async function cambiarEstado(piezaId: string, estado: Estado) {
  await soloNorma();
  await cambiar((db) => {
    const p = db.piezas.find((p) => p.id === piezaId);
    if (!p) return;
    p.estado = estado;
    db.ultimaActividad = Date.now();
  });
  refrescar();
}

export async function cambiarPrecio(piezaId: string, precio: number) {
  await soloNorma();
  if (!Number.isFinite(precio) || precio <= 0) return;
  await cambiar((db) => {
    const p = db.piezas.find((p) => p.id === piezaId);
    if (p) p.precio = Math.round(precio);
    db.ultimaActividad = Date.now();
  });
  refrescar();
}

export async function borrarPieza(piezaId: string) {
  await soloNorma();
  await cambiar((db) => {
    db.piezas = db.piezas.filter((p) => p.id !== piezaId);
    db.ultimaActividad = Date.now();
  });
  refrescar();
}

export async function guardarSuscripcion(s: Suscripcion) {
  await soloNorma();
  await cambiar((db) => {
    db.suscripciones = db.suscripciones.filter((x) => x.endpoint !== s.endpoint);
    db.suscripciones.push({ endpoint: s.endpoint, keys: s.keys });
  });
}

export async function probarAviso() {
  await soloNorma();
  return avisarANorma("¡Hola Norma!", "Así te van a llegar los avisos de la tienda.");
}
