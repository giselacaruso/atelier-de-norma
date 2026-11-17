import React from "react";
import { useCurrentFrame } from "remotion";
import { C, CaraNorma, Corazon, entrada, Foto, Logo, presion, rebote, suave, t } from "./comun";

/* ---------- íconos (trazos tipo lucide) ---------- */
const Ico: React.FC<{ d: string[]; tam?: number; color?: string; grosor?: number; children?: React.ReactNode }> = ({ d, tam = 24, color = "currentColor", grosor = 2, children }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round">
    {d.map((x, i) => (
      <path key={i} d={x} />
    ))}
    {children}
  </svg>
);
const TEL = "M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z";
const TEL_CORTAR = [
  "M10.68 13.31a16 16 0 0 0 3.41 2.6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7 2 2 0 0 1 1.72 2v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.42 19.42 0 0 1-3.33-2.67m-2.67-3.34a19.79 19.79 0 0 1-3.07-8.63A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91",
  "M22 2 2 22",
];
const BORRAR = ["M20 5H9l-7 7 7 7h11a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2Z", "m18 9-6 6", "m12 9 6 6"];
const COMPARTIR = ["M4 12v8a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-8", "M16 6l-4-4-4 4", "M12 2v13"];

/* ---------- Ingreso con PIN (igual al de la web) ---------- */

export const TECLAS2 = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "borrar"];
const TECLADO = { top: 384, izq: 24, ancho: 104, alto: 64, gx: 16, gy: 12 };
export const posTecla2 = (k: string) => {
  const i = TECLAS2.indexOf(k);
  return { x: TECLADO.izq + (i % 3) * (TECLADO.ancho + TECLADO.gx) + TECLADO.ancho / 2, y: TECLADO.top + Math.floor(i / 3) * (TECLADO.alto + TECLADO.gy) + TECLADO.alto / 2 };
};
export const POS_OLVIDE = { x: 196, y: 722 };

type Intento = { toques: number[]; digitos: string[]; en: number };

export const IngresoPin: React.FC<{ intentos: Intento[]; okEn?: number; olvideEn?: number }> = ({ intentos, okEn, olvideEn }) => {
  const f = useCurrentFrame();
  const errores = intentos.filter((x) => x.en !== okEn).map((x) => x.en);
  // Intento en curso: el último que ya empezó.
  const actual = [...intentos].reverse().find((x) => f >= x.toques[0] - 1) ?? intentos[0];
  const esError = actual.en !== okEn;
  let puestos = actual.toques.filter((x) => f >= x).length;
  if (esError && f >= actual.en + 14) puestos = 0;
  const sacude = esError && f >= actual.en && f < actual.en + 14 ? Math.sin((f - actual.en) * 1.9) * 10 * (1 - (f - actual.en) / 14) : 0;
  const ok = okEn !== undefined && f >= okEn;
  // El aviso aparece con el error y se va cuando vuelve a tocar.
  const ultimoError = errores.filter((e) => f >= e).pop();
  const siguiente = intentos.find((x) => ultimoError !== undefined && x.en > ultimoError)?.toques[0];
  const aviso = ultimoError !== undefined && (siguiente === undefined || f < siguiente);
  const avisoA = aviso ? t(f, ultimoError! + 2, ultimoError! + 14) : 0;
  const todos = intentos.flatMap((x) => x.toques.map((en, i) => ({ en, d: x.digitos[i] })));
  return (
    <div style={{ position: "absolute", inset: 0, background: C.papel, padding: "34px 24px 0", display: "flex", flexDirection: "column", alignItems: "center", textAlign: "center" }}>
      <Logo ancho={150} />
      <CaraNorma tam={84} style={{ marginTop: 18 }} />
      <div style={{ marginTop: 12, height: 34, color: C.rojo, fontSize: 32, fontWeight: 500, textTransform: "uppercase", letterSpacing: "-0.015em", lineHeight: 1 }}>Hola, Norma</div>
      <div style={{ marginTop: 6, fontSize: 19 }}>Poné tus 4 números para entrar.</div>
      <div style={{ fontSize: 15 }}>(Para probar: 1234)</div>
      <div style={{ marginTop: 16, display: "flex", gap: 16, transform: `translateX(${sacude}px)` }}>
        {[0, 1, 2, 3].map((i) => {
          const lleno = i < puestos;
          const s = lleno ? rebote(f, actual.toques[i], 10) : 0;
          const color = ok ? C.verde : C.rojo;
          return (
            <div
              key={i}
              style={{
                width: 22,
                height: 22,
                borderRadius: 99,
                border: `4px solid ${color}`,
                background: ok || lleno ? color : "transparent",
                transform: `scale(${lleno ? 0.8 + 0.2 * s + (ok ? 0.12 * rebote(f, okEn!, 8) : 0) : 1})`,
              }}
            />
          );
        })}
      </div>
      <div style={{ marginTop: 10, height: 28, fontSize: 19, fontWeight: 700, color: C.rojoOscuro, opacity: avisoA, transform: `translateY(${(1 - avisoA) * 8}px)` }}>
        Ese no es. Te quedan 4 intentos.
      </div>
      <div style={{ position: "absolute", left: TECLADO.izq, top: TECLADO.top, display: "grid", gridTemplateColumns: `repeat(3, ${TECLADO.ancho}px)`, gap: `${TECLADO.gy}px ${TECLADO.gx}px` }}>
        {TECLAS2.map((k, i) => {
          if (k === "") return <div key={i} />;
          const toques = todos.filter((x) => x.d === k).map((x) => x.en);
          const activa = toques.some((en) => f >= en && f < en + 8);
          const p = toques.reduce((acc, en) => acc * presion(f, en), 1);
          return (
            <div
              key={i}
              style={{
                height: TECLADO.alto,
                borderRadius: 22,
                background: activa ? C.crema3 : C.crema2,
                color: C.rojo,
                fontSize: 32,
                fontWeight: 700,
                display: "grid",
                placeItems: "center",
                transform: `scale(${p})`,
              }}
            >
              {k === "borrar" ? <Ico d={BORRAR} tam={30} grosor={1.75} /> : k}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: 0,
          right: 0,
          top: POS_OLVIDE.y - 14,
          fontSize: 18,
          fontWeight: 700,
          color: C.rojo,
          textDecoration: "underline",
          textDecorationColor: olvideEn !== undefined && f >= olvideEn ? C.rojo : "rgba(184,50,28,.4)",
          textUnderlineOffset: 4,
          transform: `scale(${olvideEn !== undefined ? presion(f, olvideEn) : 1})`,
        }}
      >
        Me olvidé la clave
      </div>
    </div>
  );
};

/* ---------- Llamada a Goncy (igual a la simulación de la web) ---------- */

export const POS_BOTON_LLAMADA = { x: 196, y: 564 };

export const LlamadaGoncy: React.FC<{ abreEn: number; atiendeEn: number; graciasEn: number }> = ({ abreEn, atiendeEn, graciasEn }) => {
  const f = useCurrentFrame();
  if (f < abreEn) return null;
  const entra = rebote(f, abreEn, 16);
  const sale = t(f, graciasEn + 4, graciasEn + 16, 0, 1, entrada);
  if (sale >= 1) return null;
  const atendio = f >= atiendeEn;
  const seg = 5 + Math.floor(Math.max(0, f - atiendeEn) / 30);
  const cambio = t(f, atiendeEn, atiendeEn + 12);
  return (
    <div style={{ position: "absolute", inset: 0 }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(42,33,29,.5)", opacity: t(f, abreEn, abreEn + 10) * (1 - sale) }} />
      <div
        style={{
          position: "absolute",
          left: 20,
          right: 20,
          top: 132,
          height: 536,
          borderRadius: 32,
          background: C.tinta,
          color: "white",
          display: "flex",
          flexDirection: "column",
          alignItems: "center",
          textAlign: "center",
          padding: "40px 24px 0",
          boxShadow: "0 24px 48px -16px rgba(42,33,29,.6)",
          transform: `scale(${(0.88 + 0.12 * entra) * (1 - 0.06 * sale)})`,
          opacity: Math.min(entra * 1.6, 1) * (1 - sale),
        }}
      >
        <div style={{ height: 16, fontSize: 13, fontWeight: 700, letterSpacing: "0.08em", color: "rgba(255,255,255,.7)" }}>{atendio ? `EN LLAMADA · 0:${String(seg).padStart(2, "0")}` : "LLAMANDO…"}</div>
        <div style={{ marginTop: 32, width: 112, height: 112, position: "relative" }}>
          {!atendio &&
            [0, 0.8].map((d) => {
              const fase = (((f - abreEn) / 30 + d) % 1.6) / 1.6;
              return <div key={d} style={{ position: "absolute", inset: 0, borderRadius: 999, background: C.rosa, transform: `scale(${1 + 0.75 * fase})`, opacity: 0.55 * (1 - fase) }} />;
            })}
          <div
            style={{
              position: "absolute",
              inset: 0,
              borderRadius: 999,
              background: C.rosa,
              color: C.rojo,
              fontSize: 48,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              transform: `scale(${atendio ? 0.92 + 0.08 * rebote(f, atiendeEn, 9) : 1})`,
            }}
          >
            G
          </div>
        </div>
        <div style={{ marginTop: 24, height: 29, fontSize: 29, fontWeight: 700, lineHeight: 1 }}>Goncy</div>
        <div style={{ marginTop: 4, height: 22, color: "rgba(255,255,255,.7)" }}>El que armó tu taller</div>
        <div style={{ marginTop: 24, height: 72, fontSize: 17, lineHeight: 1.35, position: "relative", width: "100%" }}>
          <div style={{ position: "absolute", inset: 0, opacity: 1 - cambio }}>
            Le estamos avisando que
            <br />
            te olvidaste la clave.
          </div>
          <div style={{ position: "absolute", inset: 0, opacity: cambio, transform: `translateY(${(1 - cambio) * 8}px)` }}>
            “¡Hola, Norma! Quedate tranquila,
            <br />
            ya te paso una clave nueva
            <br />
            así entrás.”
          </div>
        </div>
        <div style={{ marginTop: 24, height: 64, display: "grid", placeItems: "center" }}>
          {atendio ? (
            <div
              style={{
                minWidth: 200,
                height: 56,
                borderRadius: 999,
                background: f >= graciasEn ? C.rojoOscuro : C.rojo,
                color: C.crema,
                fontWeight: 700,
                fontSize: 18,
                display: "grid",
                placeItems: "center",
                padding: "0 24px",
                transform: `scale(${presion(f, graciasEn) * (0.8 + 0.2 * rebote(f, atiendeEn + 4, 12))})`,
              }}
            >
              Gracias, Goncy
            </div>
          ) : (
            <div style={{ width: 64, height: 64, borderRadius: 99, background: C.rojo, display: "grid", placeItems: "center" }}>
              <Ico d={TEL_CORTAR} tam={28} color="white" />
            </div>
          )}
        </div>
        <div style={{ marginTop: 24, display: "flex", alignItems: "center", gap: 6, fontSize: 12, color: "rgba(255,255,255,.5)" }}>
          <Ico d={[TEL]} tam={14} color="rgba(255,255,255,.5)" />
          Es una simulación para la demo
        </div>
      </div>
    </div>
  );
};

/* ---------- Barra de estado del celular ---------- */

export const BarraEstado: React.FC<{ claro?: boolean }> = ({ claro }) => {
  const c = claro ? "white" : C.tinta;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top: 0, height: 44, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "4px 30px 0", color: c, zIndex: 5 }}>
      <div style={{ fontWeight: 700, fontSize: 15 }}>10:00</div>
      <div style={{ display: "flex", alignItems: "flex-end", gap: 6 }}>
        <div style={{ display: "flex", alignItems: "flex-end", gap: 2 }}>
          {[5, 7, 9, 11].map((h) => (
            <div key={h} style={{ width: 3, height: h, borderRadius: 1, background: c }} />
          ))}
        </div>
        <div style={{ width: 24, height: 11, borderRadius: 3, border: `1.5px solid ${c}`, padding: 1.5, opacity: 0.95 }}>
          <div style={{ width: "75%", height: "100%", borderRadius: 1, background: c }} />
        </div>
      </div>
    </div>
  );
};

/* ---------- Navegador del celular ---------- */

export const POS_COMPARTIR = { x: 196, y: 772 };

export const Navegador: React.FC<{ children: React.ReactNode; compartirEn?: number }> = ({ children, compartirEn }) => {
  const f = useCurrentFrame();
  const iconos = [
    <Ico key="a" d={["m15 18-6-6 6-6"]} tam={24} color="#007aff" />,
    <Ico key="b" d={["m9 18 6-6-6-6"]} tam={24} color="#b8b8bd" />,
    <Ico key="c" d={COMPARTIR} tam={24} color="#007aff" />,
    <Ico key="d" d={["M2 4h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z", "M22 4h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z"]} tam={24} color="#007aff" />,
    <Ico key="e" d={["M8 3h11a2 2 0 0 1 2 2v11", "M3 8h11a2 2 0 0 1 2 2v9a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"]} tam={22} color="#007aff" />,
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: C.crema }}>
      <BarraEstado />
      <div style={{ position: "absolute", left: 0, right: 0, top: 44, bottom: 104, overflow: "hidden" }}>{children}</div>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 104, background: "rgba(247,247,247,.97)", borderTop: "1px solid rgba(0,0,0,.08)" }}>
        <div style={{ margin: "8px 14px 0", height: 44, borderRadius: 14, background: "white", boxShadow: "0 1px 3px rgba(0,0,0,.12)", display: "flex", alignItems: "center", justifyContent: "center", gap: 6, fontSize: 15, color: C.tinta }}>
          <Ico d={["M7 11V7a5 5 0 0 1 10 0v4", "M5 11h14v10H5z"]} tam={13} color="#8e8e93" />
          atelier-de-norma.vercel.app
        </div>
        <div style={{ position: "absolute", left: 0, right: 0, top: 56, height: 32, display: "flex" }}>
          {iconos.map((x, i) => (
            <div key={i} style={{ flex: 1, display: "grid", placeItems: "center", transform: `scale(${i === 2 && compartirEn !== undefined ? presion(f, compartirEn) : 1})` }}>
              {x}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

/* ---------- Hoja de compartir ---------- */

export const POS_AGREGAR_INICIO = { x: 170, y: 520 };

export const HojaCompartir: React.FC<{ abreEn: number; eligeEn: number }> = ({ abreEn, eligeEn }) => {
  const f = useCurrentFrame();
  if (f < abreEn) return null;
  const sube = t(f, abreEn, abreEn + 16);
  const se = t(f, eligeEn + 4, eligeEn + 14, 0, 1, entrada);
  const filas = [
    { txt: "Copiar", d: ["M8 8h12v12H8z", "M4 16V4h12"] },
    { txt: "Agregar a favoritos", d: ["m12 3 2.8 5.7 6.2.9-4.5 4.4 1 6.2L12 17.3 6.5 20.2l1-6.2L3 9.6l6.2-.9z"] },
    { txt: "Agregar a inicio", d: ["M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "M12 8v8", "M8 12h8"] },
    { txt: "Buscar en la página", d: ["m21 21-4.3-4.3", "M11 18a7 7 0 1 0 0-14 7 7 0 0 0 0 14z"] },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - se }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.28)", opacity: sube }} />
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 0, height: 500, borderRadius: "16px 16px 0 0", background: "#f2f2f7", transform: `translateY(${(1 - sube) * 100}%)`, padding: "18px 16px" }}>
        <div style={{ display: "flex", alignItems: "center", gap: 12, height: 52 }}>
          <Corazon tam={48} />
          <div style={{ flex: 1 }}>
            <div style={{ fontWeight: 700, fontSize: 16 }}>Mi taller · Atelier de Norma</div>
            <div style={{ fontSize: 13, color: "#8e8e93" }}>atelier-de-norma.vercel.app</div>
          </div>
          <div style={{ width: 30, height: 30, borderRadius: 99, background: "#e3e3e8", display: "grid", placeItems: "center" }}>
            <Ico d={["M18 6 6 18", "m6 6 12 12"]} tam={14} color="#8e8e93" grosor={2.6} />
          </div>
        </div>
        <div style={{ marginTop: 26, background: "white", borderRadius: 12, overflow: "hidden" }}>
          {filas.map((r, i) => {
            const elegida = i === 2 && f >= eligeEn && f < eligeEn + 14;
            return (
              <div
                key={r.txt}
                style={{
                  height: 52,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  padding: "0 16px",
                  fontSize: 17,
                  background: elegida ? "#e5e5ea" : "white",
                  borderTop: i ? "1px solid #e5e5ea" : undefined,
                }}
              >
                {r.txt}
                <Ico d={r.d} tam={22} color={C.tinta} grosor={1.7} />
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
};

/* ---------- Hoja "Agregar a inicio" ---------- */

export const POS_AGREGAR = { x: 350, y: 76 };

export const HojaAgregar: React.FC<{ abreEn: number; agregaEn: number }> = ({ abreEn, agregaEn }) => {
  const f = useCurrentFrame();
  if (f < abreEn) return null;
  const sube = t(f, abreEn, abreEn + 16);
  const se = t(f, agregaEn + 4, agregaEn + 14, 0, 1, entrada);
  return (
    <div style={{ position: "absolute", inset: 0, opacity: 1 - se }}>
      <div style={{ position: "absolute", inset: 0, background: "rgba(0,0,0,.35)", opacity: sube }} />
      <div style={{ position: "absolute", left: 0, right: 0, top: 48, bottom: 0, borderRadius: "14px 14px 0 0", background: "#f2f2f7", transform: `translateY(${(1 - sube) * 100}%)` }}>
        <div style={{ height: 56, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 16px", fontSize: 17 }}>
          <span style={{ color: "#007aff" }}>Cancelar</span>
          <span style={{ fontWeight: 700 }}>Agregar a inicio</span>
          <span style={{ color: "#007aff", fontWeight: 700, transform: `scale(${presion(f, agregaEn)})`, opacity: f >= agregaEn && f < agregaEn + 8 ? 0.5 : 1 }}>Agregar</span>
        </div>
        <div style={{ margin: "14px 16px 0", background: "white", borderRadius: 12, padding: 14, display: "flex", gap: 14, alignItems: "center" }}>
          <Corazon tam={66} />
          <div style={{ flex: 1 }}>
            <div style={{ height: 40, display: "flex", alignItems: "center", fontSize: 18, borderBottom: "1px solid #e5e5ea" }}>
              Mi taller
              <span style={{ width: 2, height: 22, marginLeft: 1, background: "#007aff", opacity: Math.floor(f / 8) % 2 ? 1 : 0 }} />
            </div>
            <div style={{ height: 30, display: "flex", alignItems: "center", fontSize: 14, color: "#8e8e93" }}>atelier-de-norma.vercel.app</div>
          </div>
        </div>
        <div style={{ margin: "10px 30px 0", fontSize: 13.5, lineHeight: 1.35, color: "#6d6d72" }}>
          Se va a agregar un ícono a tu pantalla de inicio para que entres rápido a este sitio.
        </div>
      </div>
    </div>
  );
};

/* ---------- Pantalla de inicio ---------- */

const APPS: { n: string; c: string; d?: string[]; nodo?: React.ReactNode }[] = [
  { n: "Teléfono", c: "#34c759", d: [TEL] },
  { n: "Mensajes", c: "#30d158", d: ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"] },
  { n: "Cámara", c: "#8e8e93", d: ["M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z", "M12 16a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"] },
  { n: "Fotos", c: "#ff9f0a", d: ["M3 5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z", "m21 15-5-5L5 21", "M9 11a2 2 0 1 0 0-4 2 2 0 0 0 0 4z"] },
  { n: "Reloj", c: "#1c1c1e", d: ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M12 6v6l4 2"] },
  { n: "Mapas", c: "#0a84ff", d: ["M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z", "M12 13a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"] },
  { n: "Notas", c: "#ffcc00", d: ["M8 8h8", "M8 12h8", "M8 16h5"] },
  { n: "Clima", c: "#5ac8fa", d: ["M12 16a4 4 0 1 0 0-8 4 4 0 0 0 0 8z", "M12 2v2", "M12 20v2", "M2 12h2", "M20 12h2", "m4.9 4.9 1.4 1.4", "m17.7 17.7 1.4 1.4", "m4.9 19.1 1.4-1.4", "m17.7 6.3 1.4-1.4"] },
  { n: "Correo", c: "#007aff", d: ["M2 6a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v12a2 2 0 0 1-2 2H4a2 2 0 0 1-2-2z", "m22 7-10 6L2 7"] },
  { n: "Calculadora", c: "#636366", d: ["M6 3h12v18H6z", "M9 7h6", "M9 12h.01", "M12 12h.01", "M15 12h.01", "M9 16h.01", "M12 16h.01", "M15 16h.01"] },
];
const COL = (i: number) => 28 + 42 + 84 * i;
const FILA = (r: number) => 70 + r * 98;
export const POS_ICONO = { x: COL(2), y: FILA(2) + 31 };

const Icono: React.FC<{ n: string; x: number; y: number; children: React.ReactNode; style?: React.CSSProperties; etiqueta?: React.CSSProperties }> = ({ n, x, y, children, style, etiqueta }) => (
  <div style={{ position: "absolute", left: x - 31, top: y, width: 62, textAlign: "center", ...style }}>
    {children}
    <div style={{ marginTop: 5, marginLeft: -14, marginRight: -14, fontSize: 12, color: "white", textShadow: "0 1px 2px rgba(0,0,0,.35)", whiteSpace: "nowrap", ...etiqueta }}>{n}</div>
  </div>
);
const Cuadro: React.FC<{ c: string; d?: string[] }> = ({ c, d }) => (
  <div style={{ width: 62, height: 62, borderRadius: 15, background: c, display: "grid", placeItems: "center", boxShadow: "0 2px 6px rgba(0,0,0,.18)" }}>{d && <Ico d={d} tam={32} color="white" grosor={1.8} />}</div>
);

export const Inicio: React.FC<{ iconoEn: number; tocaEn: number; children: React.ReactNode }> = ({ iconoEn, tocaEn, children }) => {
  const f = useCurrentFrame();
  const aparece = rebote(f, iconoEn, 11);
  const brillo = t(f, iconoEn, iconoEn + 30);
  // Al tocar: el ícono crece hasta llenar la pantalla y se abre el taller.
  const abre = t(f, tocaEn + 3, tocaEn + 19, 0, 1, suave);
  const muestra = t(f, tocaEn + 17, tocaEn + 26);
  const caja = {
    left: POS_ICONO.x - 31 + (0 - (POS_ICONO.x - 31)) * abre,
    top: FILA(2) + (0 - FILA(2)) * abre,
    width: 62 + (392 - 62) * abre,
    height: 62 + (800 - 62) * abre,
    radius: 15 + (54 - 15) * abre,
  };
  return (
    <div style={{ position: "absolute", inset: 0, background: C.tinta, overflow: "hidden" }}>
      <Foto src="torno.webp" style={{ opacity: 0.6, filter: "blur(10px)", transform: `scale(${1.2 + 0.08 * abre})` }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(184,50,28,.25), rgba(42,33,29,.35))" }} />
      <BarraEstado claro />
      <div style={{ position: "absolute", inset: 0, transform: `scale(${1 + 0.15 * abre})`, opacity: 1 - abre }}>
        {APPS.map((a, i) => {
          const k = i < 10 ? i : i + 1;
          return (
            <Icono key={a.n} n={a.n} x={COL(k % 4)} y={FILA(Math.floor(k / 4))}>
              <Cuadro c={a.c} d={a.d} />
            </Icono>
          );
        })}
        <div style={{ position: "absolute", left: 16, right: 16, bottom: 18, height: 90, borderRadius: 32, background: "rgba(255,255,255,.28)" }}>
          {[
            ["#34c759", [TEL]],
            ["#007aff", ["M12 22a10 10 0 1 0 0-20 10 10 0 0 0 0 20z", "M2 12h20", "M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"]],
            ["#30d158", ["M7.9 20A9 9 0 1 0 4 16.1L2 22Z"]],
            ["#ff375f", ["M9 18V5l12-2v13", "M6 21a3 3 0 1 0 0-6 3 3 0 0 0 0 6z", "M18 19a3 3 0 1 0 0-6 3 3 0 0 0 0 6z"]],
          ].map(([c, d], i) => (
            <div key={i} style={{ position: "absolute", left: COL(i) - 16 - 31, top: 14 }}>
              <Cuadro c={c as string} d={d as string[]} />
            </div>
          ))}
        </div>
      </div>
      {/* El ícono nuevo */}
      {f >= iconoEn && abre === 0 && (
        <Icono n="Mi taller" x={POS_ICONO.x} y={FILA(2)} style={{ transform: `scale(${aparece * presion(f, tocaEn)})` }} etiqueta={{ fontWeight: 700 }}>
          <div style={{ position: "relative" }}>
            <div style={{ position: "absolute", inset: -8, borderRadius: 22, border: "3px solid white", opacity: 1 - brillo, transform: `scale(${0.9 + 0.35 * brillo})` }} />
            <Corazon tam={62} style={{ display: "block", filter: "drop-shadow(0 2px 6px rgba(0,0,0,.25))" }} />
          </div>
        </Icono>
      )}
      {abre > 0 && (
        <div style={{ position: "absolute", left: caja.left, top: caja.top, width: caja.width, height: caja.height, borderRadius: caja.radius, overflow: "hidden", background: C.rojo }}>
          <div style={{ position: "absolute", inset: 0, display: "grid", placeItems: "center", opacity: 1 - muestra }}>
            <Corazon tam={62 + 60 * abre} />
          </div>
          <div style={{ position: "absolute", left: 0, top: 0, width: 392, height: 800, opacity: muestra }}>{children}</div>
        </div>
      )}
    </div>
  );
};

/** Pantalla "app" del taller, abierta desde el ícono (sin barra del navegador). */
export const TallerApp: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div style={{ position: "absolute", inset: 0, background: C.crema }}>
    <BarraEstado />
    <div style={{ position: "absolute", left: 0, right: 0, top: 44, bottom: 0 }}>{children}</div>
  </div>
);

