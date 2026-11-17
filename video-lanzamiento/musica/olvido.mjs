// Pista del video "Me olvidé la clave" (22,6 s). Se corta cuando abre la llamada,
// suena el teléfono y vuelve con todo cuando atiende Goncy.
// Uso: node musica/olvido.mjs  →  public/musica-olvido.wav
import { fileURLToPath } from "node:url";
import fs from "node:fs";
import { barridoLP, campanita, golpe, marimba, Mezcla, mtof, subida, SR, timbre, toque } from "./motor.mjs";
import { Groove } from "./groove.mjs";

const T = JSON.parse(fs.readFileSync(new URL("../src/tiempos.json", import.meta.url), "utf8"));
const O = T.olvido;
const FPS = 30;
const tr = T.transicion;
const INI_LLAMADA = O.escenas.intro - tr;
const INI_CIERRE = INI_LLAMADA + O.escenas.llamada - tr;
const DUR = (INI_CIERRE + O.escenas.cierre) / FPS;
const s = (cuadroLlamada) => (INI_LLAMADA + cuadroLlamada) / FPS;

const m = new Mezcla(DUR);
const g = new Groove(m, 107.5);

// 0-4: piano filtrado que se abre. 4-12: groove liviano.
g.compas(0, 2, { teclas: 0.8, shaker: 0.5 }, 1, 16);
for (let b = 4; b < 12; b += 4) g.compas(b, (b - 4) / 4, { bombo: 0.7, shaker: 0.8, bajo: 0.85, teclas: 0.8, platos: b >= 8 ? 0.5 : 0 });
// Un pulso más y se corta justo cuando se abre la llamada.
g.compas(12, 2, { bombo: 0.7, shaker: 0.8, bajo: 0.85, teclas: 0.8, platos: 0.5 }, 1, 4);

// Suspenso: acorde largo filtrado y el teléfono sonando.
const CORTE = 13, VUELVE = 20;
g.acordeLargo(CORTE, 3, g.seg(VUELVE - CORTE), 0.6);
for (let r = 0; r < 3; r++) m.poner("fx", timbre(0.9), g.seg(CORTE) + 0.1 + r * 1.5, 0.75, 0.15, 0.25);
m.poner("fx", subida(g.seg(2) + 0.03), g.seg(VUELVE - 2), 0.6);

// Atiende Goncy: golpe y groove completo con la marimba.
m.poner("fx", golpe(1), g.seg(VUELVE), 0.8, 0, 0.3);
for (let b = VUELVE; b < 32; b += 4) g.compas(b, (b - VUELVE) / 4, { bombo: 1, aplauso: 1, platos: 0.9, shaker: 0.8, bajo: 1, teclas: 0.8, marimba: 0.8 });
g.compas(32, 2, { bombo: 0.8, platos: 0.6, shaker: 0.7, bajo: 0.9, teclas: 0.75, marimba: 0.6 });
g.acordeLargo(36, 2, 2.4, 0.85);
[79, 84, 88].forEach((n, i) => m.poner("melodia", campanita(mtof(n), 0.7), g.seg(36) + i * 0.09, 0.8, -0.2 + i * 0.2, 0.6));

// Efectos sobre la pantalla.
for (const x of [...O.error.toques, ...O.nuevo.toques, O.olvideEn, O.graciasEn]) m.poner("fx", toque(0.9), s(x), 0.8, 0.1);
m.poner("fx", marimba(mtof(74), 0.8), s(O.error.en), 0.8, -0.1, 0.2);
m.poner("fx", marimba(mtof(68), 0.8), s(O.error.en) + 0.11, 0.8, -0.1, 0.2);
[84, 88, 91].forEach((n, i) => m.poner("fx", campanita(mtof(n), 0.75), s(O.nuevo.en) + i * 0.07, 0.75, 0.2, 0.4));

// Filtros: intro que se abre y suspenso cerrado.
for (const c of m.bus.teclas) {
  barridoLP(c, (t) => 350 * Math.pow(7000 / 350, Math.min(t / g.seg(4), 1)), 0, Math.round(g.seg(4) * SR));
  barridoLP(c, () => 800, Math.round(g.seg(CORTE) * SR), Math.round(g.seg(VUELVE) * SR));
}

m.guardar(fileURLToPath(new URL("../public/musica-olvido.wav", import.meta.url)), { fundidoFinal: 1.2, volumenes: { bateria: 0.75, bajo: 0.45, teclas: 0.95, melodia: 0.8, fx: 0.8 } });
console.log(`olvido: ${DUR.toFixed(2)} s · atiende en ${s(O.atiendeEn).toFixed(2)} s, groove vuelve en ${g.seg(VUELVE).toFixed(2)} s`);
