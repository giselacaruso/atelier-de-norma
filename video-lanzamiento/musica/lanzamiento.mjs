// Pista del video de lanzamiento (59,9 s). El "drop" cae justo cuando aparece el logo.
import { fileURLToPath } from "node:url";
// Uso: node musica/lanzamiento.mjs  →  public/musica-lanzamiento.wav
import { barridoLP, golpe, Mezcla, piano, mtof, subida, campanita, SR } from "./motor.mjs";
import { Groove } from "./groove.mjs";

const FPS = 30;
const DUR = 1798 / FPS;
// 107,5 BPM: 8 pulsos = 4,465 s = el cuadro 134, cuando entra el logo.
const BPM = 107.5;
const m = new Mezcla(DUR);
const g = new Groove(m, BPM);
const pulso = (cuadro) => cuadro / FPS / g.negra;

const DROP = 8; // entra el logo
const RESPIRO = Math.round(pulso(889)); // "Del otro lado…" (53)
const VUELVE = Math.round(pulso(958)); // entra el PIN (57)
const CIERRE = 98; // logo final
const FINAL = 104;

// Intro: piano filtrado que se va abriendo + shaker; subida al logo.
for (let b = 0; b < DROP; b += 4) g.compas(b, b / 4 + 2, { teclas: 0.8, shaker: b >= 4 ? 0.7 : 0 });
m.poner("fx", subida(g.seg(4) + 0.05), g.seg(4), 0.7);
m.poner("fx", golpe(1), g.seg(DROP), 0.8, 0, 0.3);

// Parte A: groove completo; los platos abiertos entran a los 2 compases.
for (let b = DROP; b < RESPIRO; b += 4) {
  const n = (b - DROP) / 4;
  g.compas(b, n, { bombo: 1, aplauso: n >= 1 ? 1 : 0, platos: n >= 2 ? 0.9 : 0, shaker: 0.8, bajo: 1, teclas: 0.8, marimba: n >= 6 ? 0.55 : 0 }, 1);
}

// Respiro: se va la batería, queda el piano filtrado y una subida.
g.acordeLargo(RESPIRO, 3, g.seg(VUELVE - RESPIRO), 0.75);
m.poner("fx", subida(g.seg(VUELVE - RESPIRO) + 0.03), g.seg(RESPIRO), 0.75);
m.poner("fx", golpe(1), g.seg(VUELVE), 0.85, 0, 0.3);

// Parte B: todo + la marimba con el motivo.
for (let b = VUELVE; b < CIERRE; b += 4) {
  const n = (b - VUELVE) / 4;
  g.compas(b, n, { bombo: 1, aplauso: 1, platos: 0.9, shaker: 0.8, bajo: 1, teclas: 0.8, marimba: 0.8 });
}

// Cierre: golpe con el logo, groove sin aplauso y acorde final con campanita.
m.poner("fx", golpe(0.9), g.seg(CIERRE), 0.75, 0, 0.3);
for (let b = CIERRE; b < FINAL; b += 4) g.compas(b, 2, { bombo: 0.8, platos: 0.5, shaker: 0.6, bajo: 0.9, teclas: 0.7 });
g.acordeLargo(FINAL, 2, 2.2, 0.85);
[79, 84, 88].forEach((n, i) => m.poner("melodia", campanita(mtof(n), 0.7), g.seg(FINAL) + i * 0.09, 0.8, -0.2 + i * 0.2, 0.6));

// Intro con filtro que se abre; respiro con filtro cerrado.
for (const c of m.bus.teclas) {
  barridoLP(c, (t) => 350 * Math.pow(7000 / 350, Math.min(t / g.seg(DROP), 1)), 0, Math.round(g.seg(DROP) * SR));
  barridoLP(c, () => 900, Math.round(g.seg(RESPIRO) * SR), Math.round(g.seg(VUELVE) * SR));
}

m.guardar(fileURLToPath(new URL("../public/musica-lanzamiento.wav", import.meta.url)), { fundidoFinal: 1.0, volumenes: { bateria: 0.75, bajo: 0.45, teclas: 0.95, melodia: 0.8 } });
console.log(`listo: ${DUR.toFixed(2)} s · respiro en pulso ${RESPIRO}, vuelve en ${VUELVE}`);
