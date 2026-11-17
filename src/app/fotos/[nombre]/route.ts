import { promises as fs } from "fs";
import path from "path";
import { DIR_FOTOS } from "@/lib/fotos";

// Solo para desarrollo local: en Vercel las fotos se sirven desde Vercel Blob.
export async function GET(_: Request, { params }: { params: Promise<{ nombre: string }> }) {
  const { nombre } = await params;
  if (!/^[\w-]+\.webp$/.test(nombre)) return new Response("No encontrada", { status: 404 });
  try {
    const data = await fs.readFile(path.join(DIR_FOTOS, nombre));
    return new Response(data, {
      headers: { "Content-Type": "image/webp", "Cache-Control": "public, max-age=31536000, immutable" },
    });
  } catch {
    return new Response("No encontrada", { status: 404 });
  }
}
