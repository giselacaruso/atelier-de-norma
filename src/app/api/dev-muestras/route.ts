// Solo desarrollo: pasa las fotos "como las saca Norma" (fotos-originales/) por el mismo
// procesamiento del panel y guarda el resultado como piezas de ejemplo en public/muestras/.
import { promises as fs } from "fs";
import path from "path";

const dev = process.env.NODE_ENV === "development";
const ORIG = path.join(process.cwd(), "fotos-originales");
const DEST = path.join(process.cwd(), "public", "muestras");

export async function GET(req: Request) {
  if (!dev) return new Response("No", { status: 404 });
  const n = new URL(req.url).searchParams.get("n");
  if (!n) return Response.json((await fs.readdir(ORIG)).filter((f) => /^\d+\.jpg$/.test(f)).map((f) => f.split(".")[0]));
  if (!/^\d+$/.test(n)) return new Response("No", { status: 400 });
  return new Response(await fs.readFile(path.join(ORIG, `${n}.jpg`)), { headers: { "Content-Type": "image/jpeg" } });
}

export async function POST(req: Request) {
  if (!dev) return new Response("No", { status: 404 });
  const form = await req.formData();
  const n = String(form.get("n"));
  if (!/^\d+$/.test(n)) return new Response("No", { status: 400 });
  await fs.mkdir(DEST, { recursive: true });
  for (const [campo, sufijo] of [["final", ""], ["antes", "-antes"]] as const) {
    const f = form.get(campo);
    if (f instanceof Blob) await fs.writeFile(path.join(DEST, `${n}${sufijo}.webp`), Buffer.from(await f.arrayBuffer()));
  }
  return new Response("ok");
}
