import "server-only";
import { promises as fs } from "fs";
import path from "path";
import { put } from "@vercel/blob";
import { nuevoId } from "./store";

export const DIR_FOTOS = process.env.VERCEL ? "/tmp/atelier/fotos" : path.join(process.cwd(), ".data", "fotos");

/** Guarda la foto ya procesada y devuelve la URL pública. */
export async function guardarFoto(archivo: Blob): Promise<string> {
  const nombre = `${Date.now()}-${nuevoId()}.webp`;
  if (process.env.BLOB_READ_WRITE_TOKEN) {
    const { url } = await put(`piezas/${nombre}`, archivo, {
      access: "public",
      contentType: "image/webp",
    });
    return url;
  }
  await fs.mkdir(DIR_FOTOS, { recursive: true });
  await fs.writeFile(path.join(DIR_FOTOS, nombre), Buffer.from(await archivo.arrayBuffer()));
  return `/fotos/${nombre}`;
}
