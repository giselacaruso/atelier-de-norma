// Pista del video del ícono (13,8 s). Entra la batería cuando aparece la pantalla de inicio.
// Uso: node musica/acceso.mjs  →  public/musica-acceso.wav
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { barridoLP, campanita, golpe, Mezcla, mtof, subida, SR, toque } from "./motor.mjs";
import { Groove } from "./groove.mjs";

const T = JSON.parse(fs.readFileSync(new URL("../src/tiempos.json", import.meta.url), "utf8"));
const A = T.acceso;
const FPS = 30;
const DUR = (A.escenas.telefono + A.escenas.cierre - T.transicion) / FPS;
const s = (c) => c / FPS;

const m = new Mezcla(DUR);
const g = new Groove(m, 107.5);

for (let b = 0; b < 8; b += 4) g.compas(b, b / 4 + 2, { teclas: 0.8, shaker: 0.7, bajo: b >= 4 ? 0.6 : 0 });
m.poner("fx", subida(g.seg(2) + 0.03), g.seg(6), 0.55);
m.poner("fx", golpe(0.8), g.seg(8), 0.7, 0, 0.3);
for (let b = 8; b < 16; b += 4) g.compas(b, (b - 8) / 4, { bombo: 1, aplauso: 1, platos: 0.8, shaker: 0.8, bajo: 1, teclas: 0.8, marimba: b >= 12 ? 0.7 : 0 });
g.compas(16, 2, { bombo: 0.9, aplauso: 0.8, platos: 0.7, shaker: 0.7, bajo: 0.9, teclas: 0.75, marimba: 0.6 }, 1, 12);
g.acordeLargo(19, 2, 2.4, 0.85);
[79, 84, 88].forEach((n, i) => m.poner("melodia", campanita(mtof(n), 0.7), g.seg(19) + i * 0.09, 0.8, -0.2 + i * 0.2, 0.6));

for (const x of [A.compartirEn, A.agregarInicioEn, A.agregarEn, A.tocaEn]) m.poner("fx", toque(0.9), s(x), 0.8, 0.1);
[84, 88, 91, 96].forEach((n, i) => m.poner("fx", campanita(mtof(n), 0.7), s(A.iconoEn) + i * 0.06, 0.75, 0.2, 0.4));
m.poner("fx", subida(0.4), s(A.tocaEn) + 0.02, 0.5);

for (const c of m.bus.teclas) barridoLP(c, (t) => 400 * Math.pow(6000 / 400, Math.min(t / g.seg(8), 1)), 0, Math.round(g.seg(8) * SR));

m.guardar(fileURLToPath(new URL("../public/musica-acceso.wav", import.meta.url)), { fundidoFinal: 1.2, volumenes: { bateria: 0.75, bajo: 0.45, teclas: 0.95, melodia: 0.8, fx: 0.8 } });
console.log(`acceso: ${DUR.toFixed(2)} s · drop en ${g.seg(8).toFixed(2)} s (inicio ${s(A.inicioEn).toFixed(2)} s)`);
