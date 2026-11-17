// Motor de música: sintetiza una pista original nota por nota (sin IA, sin samples).
// Cada video define su tema en temas.mjs; esto solo sabe tocar instrumentos y mezclar.
import fs from "node:fs";

export const SR = 44100;

/* ---------- utilidades ---------- */
export const mtof = (m) => 440 * Math.pow(2, (m - 69) / 12);
const TAU = Math.PI * 2;

function azar(semilla) {
  let a = semilla >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}
const rnd = azar(7);
const ruido = () => rnd() * 2 - 1;

/** Biquad RBJ. tipo: lp | hp | bp. Procesa en el lugar. */
function biquad(x, tipo, f, q = 0.707) {
  const w = (TAU * f) / SR;
  const c = Math.cos(w);
  const al = Math.sin(w) / (2 * q);
  let b0, b1, b2;
  if (tipo === "lp") [b0, b1, b2] = [(1 - c) / 2, 1 - c, (1 - c) / 2];
  else if (tipo === "hp") [b0, b1, b2] = [(1 + c) / 2, -(1 + c), (1 + c) / 2];
  else [b0, b1, b2] = [al, 0, -al];
  const a0 = 1 + al, a1 = -2 * c, a2 = 1 - al;
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0;
  for (let i = 0; i < x.length; i++) {
    const y = (b0 * x[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2) / a0;
    x2 = x1; x1 = x[i]; y2 = y1; y1 = y;
    x[i] = y;
  }
  return x;
}

/** Pasabajos que se abre/cierra con el tiempo. `curva(seg)` devuelve la frecuencia. */
export function barridoLP(canal, curva, desde = 0, hasta = canal.length) {
  let x1 = 0, x2 = 0, y1 = 0, y2 = 0, b0 = 0, b1 = 0, b2 = 0, a1 = 0, a2 = 0;
  for (let i = desde; i < hasta; i++) {
    if ((i - desde) % 32 === 0) {
      const f = Math.min(curva(i / SR), 18000);
      const w = (TAU * f) / SR, c = Math.cos(w), al = Math.sin(w) / (2 * 0.8), a0 = 1 + al;
      b0 = (1 - c) / 2 / a0; b1 = (1 - c) / a0; b2 = b0; a1 = (-2 * c) / a0; a2 = (1 - al) / a0;
    }
    const y = b0 * canal[i] + b1 * x1 + b2 * x2 - a1 * y1 - a2 * y2;
    x2 = x1; x1 = canal[i]; y2 = y1; y1 = y;
    canal[i] = y;
  }
}

/* ---------- instrumentos (devuelven Float32Array mono) ---------- */

/** Piano eléctrico tipo Rhodes: FM con "tine" metálico al ataque y trémolo. */
export function piano(f, dur, vel = 0.8) {
  const n = Math.floor((dur + 1.4) * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(t / 0.004, 1);
    const rel = t > dur ? Math.exp(-(t - dur) / 0.18) : 1;
    const env = att * rel * (0.25 + 0.75 * Math.exp(-t / 1.1));
    const idx = 0.25 + 1.6 * vel * Math.exp(-t / 0.13);
    const s =
      Math.sin(TAU * f * t + idx * Math.sin(TAU * f * t)) +
      0.6 * Math.sin(TAU * f * 1.0025 * t + idx * 0.8 * Math.sin(TAU * f * 1.0025 * t)) +
      0.22 * vel * Math.exp(-t / 0.018) * Math.sin(TAU * f * 14.1 * t);
    o[i] = Math.tanh(s * 0.9) * env * vel * 0.5;
  }
  return o;
}

/** Bajo redondo con un poco de saturación para que se oiga en el celular. */
export function bajo(f, dur, vel = 0.9) {
  const n = Math.floor((dur + 0.08) * SR);
  const o = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * f) / SR;
    const att = Math.min(t / 0.006, 1);
    const rel = t > dur ? Math.max(0, 1 - (t - dur) / 0.06) : 1;
    const env = att * rel * (0.55 + 0.45 * Math.exp(-t / 0.25));
    const s = Math.sin(ph) + 0.35 * Math.sin(2 * ph) + 0.12 * Math.sin(3 * ph) * Math.exp(-t / 0.08);
    o[i] = Math.tanh(s * 1.6) * env * vel * 0.55;
  }
  return o;
}

export function bombo(vel = 1) {
  const n = Math.floor(0.45 * SR);
  const o = new Float32Array(n);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * (46 + 120 * Math.exp(-t / 0.04))) / SR;
    const s = Math.sin(ph) * Math.exp(-t / 0.3) + 0.25 * ruido() * Math.exp(-t / 0.002);
    o[i] = Math.tanh(s * 1.4) * vel * 0.9;
  }
  return o;
}

export function aplauso(vel = 1) {
  const n = Math.floor(0.4 * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    let env = 0;
    for (const ti of [0, 0.01, 0.021]) if (t >= ti) env = Math.max(env, Math.exp(-(t - ti) / 0.005));
    if (t >= 0.03) env = Math.max(env, 0.7 * Math.exp(-(t - 0.03) / 0.11));
    o[i] = ruido() * env;
  }
  biquad(o, "bp", 1300, 0.9);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    o[i] = o[i] * 1.6 * vel + 0.18 * vel * Math.sin(TAU * 190 * t) * Math.exp(-t / 0.05);
  }
  return o;
}

export function platillo(abierto = false, vel = 1) {
  const d = abierto ? 0.16 : 0.028;
  const n = Math.floor((d * 5 + 0.01) * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = ruido() * Math.exp(-i / SR / d);
  biquad(o, "hp", 7500, 0.7);
  biquad(o, "hp", 7500, 0.7);
  for (let i = 0; i < n; i++) o[i] *= vel * 0.55;
  return o;
}

export function shaker(vel = 1) {
  const n = Math.floor(0.12 * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    o[i] = ruido() * Math.min(t / 0.008, 1) * Math.exp(-t / 0.035);
  }
  biquad(o, "bp", 6200, 1.2);
  for (let i = 0; i < n; i++) o[i] *= vel * 0.9;
  return o;
}

/** Marimba: fundamental + parcial de 4x que se apaga rápido. */
export function marimba(f, vel = 0.8) {
  const n = Math.floor(0.9 * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    const att = Math.min(t / 0.002, 1);
    o[i] = att * vel * 0.4 * (Math.sin(TAU * f * t) * Math.exp(-t / 0.32) + 0.4 * Math.sin(TAU * f * 3.98 * t) * Math.exp(-t / 0.05) + 0.12 * Math.sin(TAU * f * 9.8 * t) * Math.exp(-t / 0.012));
  }
  return o;
}

/** Subida de ruido filtrado + tono que sube, para anticipar un cambio. */
export function subida(dur) {
  const n = Math.floor(dur * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) o[i] = ruido();
  barridoLP(o, (t) => 300 * Math.pow(9000 / 300, Math.min(t / dur, 1)));
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const p = i / n;
    ph += (TAU * (180 + 700 * p * p)) / SR;
    o[i] = (o[i] * 0.55 + 0.12 * Math.sin(ph)) * p * p * 0.9;
  }
  return o;
}

/** Golpe de llegada: boom grave + platillo largo. */
export function golpe(vel = 1) {
  const n = Math.floor(2.2 * SR);
  const o = new Float32Array(n);
  const cr = new Float32Array(n);
  for (let i = 0; i < n; i++) cr[i] = ruido() * Math.exp(-i / SR / 0.7);
  biquad(cr, "hp", 4000, 0.6);
  let ph = 0;
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    ph += (TAU * (38 + 70 * Math.exp(-t / 0.08))) / SR;
    o[i] = vel * (0.8 * Math.tanh(1.3 * Math.sin(ph)) * Math.exp(-t / 0.55) + 0.35 * cr[i]);
  }
  return o;
}

/** Campanita aguda para "toques" y momentos lindos. */
export function campanita(f, vel = 0.6) {
  const n = Math.floor(1.2 * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    o[i] = vel * 0.3 * Math.min(t / 0.002, 1) * (Math.sin(TAU * f * t + 0.8 * Math.exp(-t / 0.2) * Math.sin(TAU * f * 3.5 * t)) * Math.exp(-t / 0.45));
  }
  return o;
}

/* ---------- mezcla ---------- */

export class Mezcla {
  constructor(dur) {
    this.n = Math.ceil(dur * SR);
    this.bus = {};
    for (const b of ["bateria", "bajo", "teclas", "melodia", "fx", "envio"]) this.bus[b] = [new Float32Array(this.n), new Float32Array(this.n)];
    this.bombos = [];
  }
  /** Suma un sonido en el bus, en el segundo `seg`, con paneo -1..1 y cuánto va a la reverb. */
  poner(bus, sonido, seg, gan = 1, pan = 0, rev = 0) {
    const ini = Math.round(seg * SR);
    const [L, R] = this.bus[bus];
    const [eL, eR] = this.bus.envio;
    const gl = gan * Math.cos(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    const gr = gan * Math.sin(((pan + 1) * Math.PI) / 4) * Math.SQRT2;
    for (let i = 0; i < sonido.length; i++) {
      const k = ini + i;
      if (k < 0) continue;
      if (k >= this.n) break;
      L[k] += sonido[i] * gl;
      R[k] += sonido[i] * gr;
      if (rev) {
        eL[k] += sonido[i] * gl * rev;
        eR[k] += sonido[i] * gr * rev;
      }
    }
  }
  reverb() {
    // Freeverb chico: 4 peines + 2 pasatodo por canal.
    const salida = [new Float32Array(this.n), new Float32Array(this.n)];
    [0, 1].forEach((c) => {
      const x = this.bus.envio[c];
      const extra = c ? 23 : 0;
      for (const d0 of [1116, 1188, 1277, 1356]) {
        const d = d0 + extra;
        const buf = new Float32Array(d);
        let p = 0, lp = 0;
        for (let i = 0; i < this.n; i++) {
          const y = buf[p];
          lp = y * 0.6 + lp * 0.4;
          buf[p] = x[i] + lp * 0.8;
          p = (p + 1) % d;
          salida[c][i] += y * 0.25;
        }
      }
      for (const d0 of [556, 441]) {
        const d = d0 + extra;
        const buf = new Float32Array(d);
        let p = 0;
        const s = salida[c];
        for (let i = 0; i < this.n; i++) {
          const b = buf[p];
          const y = -s[i] + b;
          buf[p] = s[i] + b * 0.5;
          p = (p + 1) % d;
          s[i] = y;
        }
      }
    });
    biquad(salida[0], "hp", 250);
    biquad(salida[1], "hp", 250);
    return salida;
  }
  /** Envolvente de "sidechain": el bajo y las teclas se agachan cuando pega el bombo. */
  agachar(profundidad = 0.5) {
    const g = new Float32Array(this.n).fill(1);
    for (const s of this.bombos) {
      const ini = Math.round(s * SR);
      for (let i = 0; i < 0.3 * SR && ini + i < this.n; i++) {
        const t = i / SR;
        const v = 1 - profundidad * Math.min(t / 0.004, 1) * Math.exp(-t / 0.1);
        if (ini + i >= 0) g[ini + i] = Math.min(g[ini + i], v);
      }
    }
    return g;
  }
  guardar(archivo, { volumenes = {}, fundidoFinal = 1.2, fundidoInicial = 0.02 } = {}) {
    const vol = { bateria: 0.9, bajo: 0.85, teclas: 0.75, melodia: 0.6, fx: 0.7, reverb: 0.5, ...volumenes };
    const g = this.agachar(0.5);
    const rv = this.reverb();
    const L = new Float32Array(this.n), R = new Float32Array(this.n);
    for (let i = 0; i < this.n; i++) {
      const ag = g[i];
      for (const [c, out] of [[0, L], [1, R]]) {
        out[i] =
          this.bus.bateria[c][i] * vol.bateria +
          this.bus.bajo[c][i] * vol.bajo * ag +
          this.bus.teclas[c][i] * vol.teclas * (0.35 + 0.65 * ag) +
          this.bus.melodia[c][i] * vol.melodia +
          this.bus.fx[c][i] * vol.fx +
          rv[c][i] * vol.reverb;
      }
    }
    // Saturación suave tipo cinta y normalizado a -1 dB.
    let pico = 0;
    for (const x of [L, R]) for (let i = 0; i < this.n; i++) { x[i] = Math.tanh(x[i] * 1.15); pico = Math.max(pico, Math.abs(x[i])); }
    const k = 0.89 / pico;
    const fi = fundidoInicial * SR, ff = fundidoFinal * SR;
    const pcm = Buffer.alloc(this.n * 4);
    for (let i = 0; i < this.n; i++) {
      let env = Math.min(1, i / fi);
      if (i > this.n - ff) env *= (this.n - i) / ff;
      pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, L[i] * k * env)) * 32767), i * 4);
      pcm.writeInt16LE(Math.round(Math.max(-1, Math.min(1, R[i] * k * env)) * 32767), i * 4 + 2);
    }
    const h = Buffer.alloc(44);
    h.write("RIFF", 0); h.writeUInt32LE(36 + pcm.length, 4); h.write("WAVE", 8);
    h.write("fmt ", 12); h.writeUInt32LE(16, 16); h.writeUInt16LE(1, 20); h.writeUInt16LE(2, 22);
    h.writeUInt32LE(SR, 24); h.writeUInt32LE(SR * 4, 28); h.writeUInt16LE(4, 32); h.writeUInt16LE(16, 34);
    h.write("data", 36); h.writeUInt32LE(pcm.length, 40);
    fs.writeFileSync(archivo, Buffer.concat([h, pcm]));
  }
}

/** "Tic" suave de cuando se toca la pantalla. */
export function toque(vel = 1) {
  const n = Math.floor(0.05 * SR);
  const o = new Float32Array(n);
  for (let i = 0; i < n; i++) {
    const t = i / SR;
    o[i] = vel * 0.35 * (Math.sin(TAU * 1700 * t) * Math.exp(-t / 0.008) + 0.4 * ruido() * Math.exp(-t / 0.002));
  }
  return o;
}

/** Timbre de teléfono: un "trrrin" de dos notas que se alternan rápido. */
export function timbre(dur = 1.0) {
  const n = Math.floor((dur + 0.4) * SR);
  const o = new Float32Array(n);
  const paso = 0.055;
  for (let k = 0; k * paso < dur; k++) {
    const f = k % 2 ? 1318.5 : 1046.5;
    const ini = Math.floor(k * paso * SR);
    for (let i = 0; i < 0.3 * SR && ini + i < n; i++) {
      const t = i / SR;
      o[ini + i] += 0.22 * Math.sin(TAU * f * t + 1.2 * Math.exp(-t / 0.05) * Math.sin(TAU * f * 2 * t)) * Math.exp(-t / 0.07);
    }
  }
  return o;
}
