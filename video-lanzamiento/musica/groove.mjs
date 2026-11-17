// El "groove" de la marca: nu-disco tranquilo, piano eléctrico, bajo con swing y marimba.
// Se arma por compases para que cada video lo acomode a sus escenas.
import { aplauso, bajo, bombo, marimba, mtof, piano, platillo, shaker } from "./motor.mjs";

// Dm9 · G13 · Cmaj9 · Am9 (ii-V-I-vi en Do): cálido y con onda.
export const ACORDES = [
  { bajo: 38, voces: [53, 57, 60, 64] },
  { bajo: 43, voces: [53, 59, 64, 69] },
  { bajo: 36, voces: [52, 55, 59, 62] },
  { bajo: 33, voces: [55, 59, 60, 64] },
];
// [paso de 16avo, semitonos sobre la fundamental, largo en pasos, intensidad]
const LINEA_BAJO = [[0, 0, 2, 1], [3, 12, 1, 0.7], [6, 0, 1, 0.85], [8, 0, 1, 0.6], [10, 7, 1, 0.8], [11, 12, 1, 0.7], [14, 10, 1, 0.75]];
const RITMO_TECLAS = [[0, 3, 0.85], [6, 2, 0.7], [10, 4, 0.8]];
// Motivo de marimba: un compás por acorde. [paso, nota MIDI]
const MOTIVO = [
  [[0, 76], [3, 74], [6, 72], [10, 69], [12, 72]],
  [[0, 74], [3, 71], [6, 74], [8, 76], [14, 79]],
  [[0, 76], [3, 79], [6, 76], [10, 74], [12, 72]],
  [[0, 72], [3, 69], [6, 67], [8, 69], [11, 72]],
];

export class Groove {
  constructor(mezcla, bpm, { swing = 0.14, transponer = 0 } = {}) {
    this.m = mezcla;
    this.negra = 60 / bpm;
    this.swing = swing;
    this.tr = transponer;
  }
  /** Segundo en que cae el pulso `b` (puede tener decimales). */
  seg(b) {
    return b * this.negra;
  }
  paso(compasInicio, p) {
    const dieciseis = this.negra / 4;
    return compasInicio + p * dieciseis + (p % 2 ? this.swing * dieciseis : 0);
  }
  /**
   * Toca un compás de 4 pulsos que empieza en el pulso `b`.
   * capas: { bombo, aplauso, platos, shaker, bajo, teclas, marimba } (true/false o intensidad 0..1)
   */
  compas(b, nAcorde, capas, rel = 1, pasos = 16) {
    const m = this.m;
    const ini = this.seg(b);
    const ac = ACORDES[((nAcorde % 4) + 4) % 4];
    const v = (x) => (x === true ? 1 : x || 0);
    const dies = this.negra / 4;
    for (let p = 0; p < pasos; p++) {
      const s = this.paso(ini, p);
      if (v(capas.bombo) && p % 4 === 0) {
        m.poner("bateria", bombo(v(capas.bombo) * rel), s, 1, 0);
        m.bombos.push(s);
      }
      if (v(capas.aplauso) && (p === 4 || p === 12)) m.poner("bateria", aplauso(v(capas.aplauso) * rel), s, 0.55, 0.05, 0.35);
      if (v(capas.platos)) {
        if (p % 4 === 2) m.poner("bateria", platillo(true, v(capas.platos)), s, 0.42, 0.25, 0.1);
        else if (p % 2 === 1) m.poner("bateria", platillo(false, v(capas.platos) * 0.6), s, 0.35, -0.3);
      }
      if (v(capas.shaker)) m.poner("bateria", shaker(v(capas.shaker) * (p % 2 ? 0.55 : 0.85)), s, 0.28, 0.45);
    }
    if (v(capas.bajo))
      for (const [p, semi, largo, vel] of LINEA_BAJO.filter((x) => x[0] < pasos))
        m.poner("bajo", bajo(mtof(ac.bajo + semi + this.tr), largo * dies * 0.9, vel * v(capas.bajo)), this.paso(ini, p), 1, 0);
    if (v(capas.teclas))
      for (const [p, largo, vel] of RITMO_TECLAS.filter((x) => x[0] < pasos))
        ac.voces.forEach((n, i) =>
          m.poner("teclas", piano(mtof(n + this.tr), largo * dies, vel * v(capas.teclas)), this.paso(ini, p) + i * 0.004, 0.55, -0.35 + i * 0.23, 0.3),
        );
    if (v(capas.marimba))
      for (const [p, n] of MOTIVO[((nAcorde % 4) + 4) % 4].filter((x) => x[0] < pasos))
        m.poner("melodia", marimba(mtof(n + this.tr), 0.8 * v(capas.marimba)), this.paso(ini, p), 0.8, 0.3, 0.35);
  }
  /** Acorde largo (para finales y respiros). */
  acordeLargo(b, nAcorde, dur, vel = 0.8) {
    const ac = ACORDES[((nAcorde % 4) + 4) % 4];
    const s = this.seg(b);
    ac.voces.forEach((n, i) => this.m.poner("teclas", piano(mtof(n + this.tr), dur, vel), s + i * 0.012, 0.6, -0.35 + i * 0.23, 0.5));
    this.m.poner("bajo", bajo(mtof(ac.bajo + this.tr), dur * 0.6, 0.9), s, 1, 0);
  }
}
