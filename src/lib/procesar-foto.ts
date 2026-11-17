/*
 * Procesa la foto que saca Norma, directo en el navegador del celular:
 * 1. Le quita el fondo (modelo de IA que corre en el dispositivo: gratis, sin APIs).
 * 2. Encuentra dónde está la pieza, la centra y la lleva a un tamaño parejo.
 *    Así no importa si el encuadre salió torcido o la pieza quedó chiquita.
 * 3. La apoya sobre fondo crema con sombra suave y un filtro cálido con grano.
 * Si el recorte sale mal, queda la "foto como la saqué" con el mismo filtro.
 */

export const LADO = 1200;
const FONDO = "#EFE6D6";
const FILTRO = "brightness(1.04) contrast(1.05) saturate(1.04) sepia(0.06)";

export type Resultado = {
  sinFondo: Blob | null; // null si el recorte no salió bien
  original: Blob;
};

async function aBitmap(archivo: Blob, max = 1600) {
  const img = await createImageBitmap(archivo);
  const escala = Math.min(1, max / Math.max(img.width, img.height));
  if (escala === 1) return img;
  const c = new OffscreenCanvas(Math.round(img.width * escala), Math.round(img.height * escala));
  c.getContext("2d")!.drawImage(img, 0, 0, c.width, c.height);
  return createImageBitmap(c);
}

function lienzo() {
  const c = document.createElement("canvas");
  c.width = c.height = LADO;
  const ctx = c.getContext("2d")!;
  ctx.fillStyle = FONDO;
  ctx.fillRect(0, 0, LADO, LADO);
  return { c, ctx };
}

function grano(ctx: CanvasRenderingContext2D, intensidad = 10) {
  const d = ctx.getImageData(0, 0, LADO, LADO);
  const p = d.data;
  for (let i = 0; i < p.length; i += 4) {
    const n = (Math.random() - 0.5) * intensidad;
    p[i] += n;
    p[i + 1] += n;
    p[i + 2] += n;
  }
  ctx.putImageData(d, 0, 0);
}

function viñeta(ctx: CanvasRenderingContext2D) {
  const g = ctx.createRadialGradient(LADO / 2, LADO / 2, LADO * 0.35, LADO / 2, LADO / 2, LADO * 0.75);
  g.addColorStop(0, "rgba(255,248,235,0)");
  g.addColorStop(1, "rgba(120,80,50,0.10)");
  ctx.fillStyle = g;
  ctx.fillRect(0, 0, LADO, LADO);
}

const aBlob = (c: HTMLCanvasElement) =>
  new Promise<Blob>((ok) => c.toBlob((b) => ok(b!), "image/webp", 0.86));

/** Caja que encierra los píxeles visibles (alfa > umbral). */
function caja(img: ImageBitmap) {
  const c = new OffscreenCanvas(img.width, img.height);
  const ctx = c.getContext("2d")!;
  ctx.drawImage(img, 0, 0);
  const { data, width, height } = ctx.getImageData(0, 0, img.width, img.height);
  let x0 = width, y0 = height, x1 = -1, y1 = -1, visibles = 0;
  for (let y = 0; y < height; y++)
    for (let x = 0; x < width; x++)
      if (data[(y * width + x) * 4 + 3] > 40) {
        visibles++;
        if (x < x0) x0 = x;
        if (x > x1) x1 = x;
        if (y < y0) y0 = y;
        if (y > y1) y1 = y;
      }
  return { x0, y0, x1, y1, proporcion: visibles / (width * height) };
}

/**
 * Si quedaron varios objetos (la pieza y, por ejemplo, el celular que estaba al lado),
 * se queda solo con el más grande. Trabaja sobre una máscara chica para ser rápido.
 */
async function soloLaPieza(recorte: ImageBitmap): Promise<ImageBitmap> {
  const M = 256;
  const k = M / Math.max(recorte.width, recorte.height);
  const w = Math.max(1, Math.round(recorte.width * k));
  const h = Math.max(1, Math.round(recorte.height * k));
  const chica = new OffscreenCanvas(w, h);
  const cx = chica.getContext("2d")!;
  cx.drawImage(recorte, 0, 0, w, h);
  const alfa = cx.getImageData(0, 0, w, h).data;
  const etiqueta = new Int32Array(w * h).fill(-1);
  const tamaños: number[] = [];
  for (let i = 0; i < w * h; i++) {
    if (alfa[i * 4 + 3] <= 40 || etiqueta[i] !== -1) continue;
    const id = tamaños.length;
    let n = 0;
    const pila = [i];
    etiqueta[i] = id;
    while (pila.length) {
      const p = pila.pop()!;
      n++;
      const x = p % w, y = (p - x) / w;
      for (const q of [x > 0 ? p - 1 : -1, x < w - 1 ? p + 1 : -1, y > 0 ? p - w : -1, y < h - 1 ? p + w : -1])
        if (q >= 0 && etiqueta[q] === -1 && alfa[q * 4 + 3] > 40) {
          etiqueta[q] = id;
          pila.push(q);
        }
    }
    tamaños.push(n);
  }
  if (tamaños.length <= 1) return recorte;
  const mayor = tamaños.indexOf(Math.max(...tamaños));
  // Máscara del objeto más grande, un poquito engordada para no comerle los bordes.
  const mascara = cx.createImageData(w, h);
  for (let i = 0; i < w * h; i++) {
    const x = i % w, y = (i - x) / w;
    let dentro = etiqueta[i] === mayor;
    for (let dy = -1; !dentro && dy <= 1; dy++)
      for (let dx = -1; !dentro && dx <= 1; dx++) {
        const xx = x + dx, yy = y + dy;
        if (xx >= 0 && yy >= 0 && xx < w && yy < h && etiqueta[yy * w + xx] === mayor) dentro = true;
      }
    if (dentro) mascara.data[i * 4 + 3] = 255;
  }
  cx.clearRect(0, 0, w, h);
  cx.putImageData(mascara, 0, 0);
  const salida = new OffscreenCanvas(recorte.width, recorte.height);
  const sx = salida.getContext("2d")!;
  sx.drawImage(recorte, 0, 0);
  sx.globalCompositeOperation = "destination-in";
  sx.imageSmoothingEnabled = true;
  sx.drawImage(chica, 0, 0, recorte.width, recorte.height);
  return createImageBitmap(salida);
}

async function componerSinFondo(entrada: ImageBitmap) {
  const recorte = await soloLaPieza(entrada);
  const b = caja(recorte);
  // Si casi no quedó nada, o no quitó casi nada, el recorte salió mal.
  if (b.x1 < 0 || b.proporcion < 0.02 || b.proporcion > 0.92) return null;
  const w = b.x1 - b.x0 + 1;
  const h = b.y1 - b.y0 + 1;
  const escala = (LADO * 0.7) / Math.max(w, h);
  const dw = w * escala;
  const dh = h * escala;
  const dx = (LADO - dw) / 2;
  const dy = (LADO - dh) / 2 + LADO * 0.02;

  const { c, ctx } = lienzo();
  // Sombra suave apoyada en la "mesa"
  const sombra = ctx.createRadialGradient(LADO / 2, dy + dh, 0, LADO / 2, dy + dh, dw * 0.55);
  sombra.addColorStop(0, "rgba(70,40,30,0.28)");
  sombra.addColorStop(1, "rgba(70,40,30,0)");
  ctx.save();
  ctx.translate(0, dy + dh);
  ctx.scale(1, 0.16);
  ctx.translate(0, -(dy + dh));
  ctx.fillStyle = sombra;
  ctx.fillRect(0, 0, LADO, LADO * 2);
  ctx.restore();

  ctx.filter = FILTRO;
  ctx.drawImage(recorte, b.x0, b.y0, w, h, dx, dy, dw, dh);
  ctx.filter = "none";
  viñeta(ctx);
  grano(ctx);
  return aBlob(c);
}

async function componerOriginal(img: ImageBitmap) {
  const { c, ctx } = lienzo();
  const lado = Math.min(img.width, img.height);
  const sx = (img.width - lado) / 2;
  const sy = (img.height - lado) / 2;
  ctx.filter = FILTRO + " sepia(0.1)";
  ctx.drawImage(img, sx, sy, lado, lado, 0, 0, LADO, LADO);
  ctx.filter = "none";
  viñeta(ctx);
  grano(ctx, 12);
  return aBlob(c);
}

export async function procesarFoto(
  archivo: File,
  onProgreso?: (texto: string) => void,
): Promise<Resultado> {
  onProgreso?.("Mirando tu foto…");
  const img = await aBitmap(archivo);
  const original = await componerOriginal(img);

  let sinFondo: Blob | null = null;
  try {
    onProgreso?.("Sacando lo que hay alrededor de la pieza…");
    const { removeBackground } = await import("@imgly/background-removal");
    const base = document.createElement("canvas");
    base.width = img.width;
    base.height = img.height;
    base.getContext("2d")!.drawImage(img, 0, 0);
    const entrada = await new Promise<Blob>((ok) => base.toBlob((b) => ok(b!), "image/jpeg", 0.92));
    const png = await removeBackground(entrada, {
      model: "isnet_fp16",
      output: { format: "image/png" },
      progress: (clave, actual, total) => {
        if (clave.startsWith("fetch") && total)
          onProgreso?.(`Preparando la herramienta (solo la primera vez)… ${Math.round((actual / total) * 100)}%`);
      },
    });
    onProgreso?.("Acomodando la pieza en el centro…");
    sinFondo = await componerSinFondo(await createImageBitmap(png));
  } catch (e) {
    console.error("No se pudo quitar el fondo", e);
  }
  return { sinFondo, original };
}
