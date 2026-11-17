import React from "react";
import { Easing, Img, interpolate, spring, staticFile, useCurrentFrame } from "remotion";

// Mismos colores y tipografía que la tienda (src/app/globals.css).
export const C = {
  papel: "#fffdf9",
  crema: "#f7f2ea",
  crema2: "#efe6d6",
  crema3: "#e2d5bf",
  rojo: "#b8321c",
  rojoOscuro: "#8a2312",
  rosa: "#f6d6c8",
  tinta: "#2a211d",
  verde: "#2f6b3a",
};
export const FUENTE = '"Helvetica Neue", Helvetica, Arial, sans-serif';
export const FPS = 30;

// Curvas: arranque rápido y frenada suave para lo que entra; ease-in solo para lo que se va.
export const salida = Easing.bezier(0.19, 1, 0.22, 1);
export const suave = Easing.bezier(0.65, 0, 0.35, 1);
export const entrada = Easing.bezier(0.55, 0, 1, 0.45);

/** Interpola de `de` a `a` entre los cuadros `ini` y `fin`, sin pasarse. */
export const t = (f: number, ini: number, fin: number, de = 0, a = 1, ease = salida) =>
  interpolate(f, [ini, fin], [de, a], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: ease });

/** Rebote corto para lo que "aterriza" (badges, tarjetas, avisos). */
export const rebote = (f: number, desde: number, damping = 14) =>
  spring({ frame: f - desde, fps: FPS, config: { damping, stiffness: 170, mass: 0.9 } });

/** Un botón que se hunde un instante cuando lo tocan en el cuadro `en`. */
export const presion = (f: number, en: number) => {
  if (f < en - 3 || f > en + 9) return 1;
  return f < en ? interpolate(f, [en - 3, en], [1, 0.94]) : interpolate(f, [en, en + 9], [0.94, 1], { easing: salida });
};

/**
 * Texto en renglones fijos. Los cortes los decido yo (nunca el navegador):
 * así no quedan viudas ni una palabra sola después de una coma.
 */
export const Lineas: React.FC<{
  lineas: string[];
  desde?: number;
  cada?: number;
  hasta?: number;
  alinear?: "left" | "center";
  estilo?: React.CSSProperties;
}> = ({ lineas, desde = 0, cada = 5, hasta, alinear = "center", estilo }) => {
  const f = useCurrentFrame();
  return (
    <div style={{ textAlign: alinear, ...estilo }}>
      {lineas.map((l, i) => {
        const a = desde + i * cada;
        const p = t(f, a, a + 24);
        const s = hasta !== undefined ? t(f, hasta + i * 3, hasta + i * 3 + 14, 0, 1, entrada) : 0;
        return (
          <div key={i} style={{ overflow: "hidden", padding: "0.06em 0.04em 0.1em", margin: "-0.06em -0.04em -0.1em" }}>
            <div style={{ whiteSpace: "nowrap", transform: `translateY(${(1 - p) * 110 - s * 110}%)`, opacity: Math.min(p * 1.6, 1) }}>
              {l}
            </div>
          </div>
        );
      })}
    </div>
  );
};

/** Título de paso: aclaración arriba, número en círculo y el título en rojo. */
export const Titulo: React.FC<{
  kicker?: string;
  n?: string;
  lineas: string[];
  desde?: number;
  hasta?: number;
  top?: number;
  color?: string;
}> = ({ kicker, n, lineas, desde = 0, hasta, top = 130, color = C.rojo }) => {
  const f = useCurrentFrame();
  const pop = rebote(f, desde, 12);
  const fuera = hasta !== undefined ? t(f, hasta, hasta + 12, 0, 1, entrada) : 0;
  return (
    <div style={{ position: "absolute", left: 0, right: 0, top, display: "flex", flexDirection: "column", alignItems: "center", gap: 26 }}>
      {kicker && (
        <div style={{ fontSize: 28, letterSpacing: "0.16em", fontWeight: 700, color, opacity: t(f, desde, desde + 14) * (1 - fuera) }}>
          {kicker}
        </div>
      )}
      <div style={{ display: "flex", alignItems: "center", gap: 28 }}>
        {n && (
          <div
            style={{
              width: 96,
              height: 96,
              flexShrink: 0,
              borderRadius: 999,
              background: color,
              color: C.crema,
              fontSize: 54,
              fontWeight: 700,
              display: "grid",
              placeItems: "center",
              transform: `scale(${pop * (1 - fuera)})`,
            }}
          >
            {n}
          </div>
        )}
        <Lineas
          lineas={lineas}
          desde={desde + 3}
          hasta={hasta}
          alinear={n ? "left" : "center"}
          estilo={{ fontSize: 70, fontWeight: 700, color, lineHeight: 1.06, letterSpacing: "-0.025em" }}
        />
      </div>
    </div>
  );
};

/** Bajada debajo del teléfono. */
export const Bajada: React.FC<{ lineas: string[]; desde?: number; hasta?: number; top?: number }> = ({
  lineas,
  desde = 0,
  hasta,
  top = 1690,
}) => (
  <div style={{ position: "absolute", left: 0, right: 0, top }}>
    <Lineas lineas={lineas} desde={desde} hasta={hasta} estilo={{ fontSize: 42, color: C.tinta, opacity: 0.8, lineHeight: 1.25 }} />
  </div>
);

/** Logo manuscrito pintado del color que se pida. */
export const Logo: React.FC<{ ancho: number; color?: string; style?: React.CSSProperties }> = ({ ancho, color = C.rojo, style }) => (
  <div
    style={{
      width: ancho,
      height: (ancho * 380) / 1202,
      backgroundColor: color,
      WebkitMaskImage: `url(${staticFile("logo.png")})`,
      WebkitMaskSize: "contain",
      WebkitMaskRepeat: "no-repeat",
      WebkitMaskPosition: "center",
      ...style,
    }}
  />
);

/** El ícono de la app: corazón crema sobre rojo (o al revés). */
export const Corazon: React.FC<{ tam: number; fondo?: string; color?: string; style?: React.CSSProperties }> = ({
  tam,
  fondo = C.rojo,
  color = C.crema,
  style,
}) => (
  <svg width={tam} height={tam} viewBox="0 0 512 512" style={style}>
    <rect width="512" height="512" rx="112" fill={fondo} />
    <g transform="translate(256 262) rotate(-12) scale(3.05) translate(-50 -52)">
      <path
        d="M47 90 C 30 80, 9 62, 8 38 C 7 20, 20 9, 33 11 C 43 12, 49 21, 52 30 C 57 18, 66 10, 78 11 C 91 12, 97 25, 93 41 C 88 62, 66 80, 47 90 Z"
        fill={color}
      />
    </g>
  </svg>
);

/** Carita de Norma, la misma del chat de la tienda. */
export const CaraNorma: React.FC<{ tam: number; style?: React.CSSProperties }> = ({ tam, style }) => (
  <svg viewBox="0 0 120 120" width={tam} height={tam} style={style}>
    <circle cx="60" cy="60" r="60" fill="#b8321c" />
    <circle cx="60" cy="27" r="15" fill="#e4e0db" />
    <path d="M48 23c4-6 18-7 24 0" stroke="#bdb6ae" strokeWidth="2.5" fill="none" strokeLinecap="round" />
    <path d="M45 34c5 3 25 3 30 0" stroke="#f2b8a8" strokeWidth="6" strokeLinecap="round" />
    <ellipse cx="60" cy="62" rx="33" ry="31" fill="#e4e0db" />
    <ellipse cx="60" cy="68" rx="25" ry="26" fill="#f4d2b8" />
    <path d="M34 60c2-16 14-22 26-22s24 6 26 22c-6-9-15-12-26-12s-20 3-26 12Z" fill="#e4e0db" />
    <path d="M44 47c6-4 12-5 16-5" stroke="#bdb6ae" strokeWidth="2" fill="none" strokeLinecap="round" />
    <path d="M46 67q5-5 10 0M64 67q5-5 10 0" stroke="#2a211d" strokeWidth="3" fill="none" strokeLinecap="round" />
    <circle cx="44" cy="77" r="5" fill="#ec8f7b" opacity=".7" />
    <circle cx="76" cy="77" r="5" fill="#ec8f7b" opacity=".7" />
    <path d="M52 80q8 8 16 0" stroke="#2a211d" strokeWidth="3" fill="none" strokeLinecap="round" />
    <path d="M30 120c2-14 14-22 30-22s28 8 30 22Z" fill="#fffdf9" />
    <path d="M48 100l-4 20M72 100l4 20" stroke="#e2d5bf" strokeWidth="3" />
  </svg>
);

/** Teléfono. Adentro se diseña en puntos de un celular real (392 × 800) y se agranda. */
export const ANCHO_PANTALLA = 392;
export const ALTO_PANTALLA = 800;
export const Telefono: React.FC<{ children: React.ReactNode; escala?: number; top?: number; desde?: number }> = ({
  children,
  escala = 1.38,
  top = 470,
  desde = 0,
}) => {
  const f = useCurrentFrame();
  const sube = t(f, desde, desde + 30);
  const borde = 14;
  const ancho = ANCHO_PANTALLA * escala + borde * 2;
  return (
    <div
      style={{
        position: "absolute",
        left: (1080 - ancho) / 2,
        top: top + (1 - sube) * 140,
        opacity: Math.min(sube * 2, 1),
        width: ancho,
        height: ALTO_PANTALLA * escala + borde * 2,
        borderRadius: 74,
        background: C.tinta,
        padding: borde,
        boxShadow: "0 50px 90px -40px rgba(42,33,29,.6), 0 10px 24px rgba(42,33,29,.16)",
      }}
    >
      <div style={{ width: "100%", height: "100%", borderRadius: 60, overflow: "hidden", position: "relative", background: C.papel }}>
        <div
          style={{
            position: "absolute",
            left: 0,
            top: 0,
            width: ANCHO_PANTALLA,
            height: ALTO_PANTALLA,
            transform: `scale(${escala})`,
            transformOrigin: "0 0",
            fontFamily: FUENTE,
            color: C.tinta,
            fontSize: 17,
            lineHeight: 1.4,
            overflow: "hidden",
          }}
        >
          {children}
        </div>
      </div>
    </div>
  );
};

/** El dedo que toca: aparece, se hunde en el cuadro `en` y deja una onda. Coordenadas de la pantalla. */
export const Toque: React.FC<{ x: number; y: number; en: number }> = ({ x, y, en }) => {
  const f = useCurrentFrame();
  const d = f - en;
  if (d < -14 || d > 26) return null;
  const llega = t(f, en - 14, en);
  const se = t(f, en + 8, en + 22);
  const onda = t(f, en, en + 22);
  const base: React.CSSProperties = { position: "absolute", left: x - 21, top: y - 21, width: 42, height: 42, borderRadius: 999, pointerEvents: "none", zIndex: 50 };
  return (
    <>
      <div
        style={{
          ...base,
          background: "rgba(42,33,29,.30)",
          border: "2.5px solid rgba(255,255,255,.95)",
          boxShadow: "0 4px 12px rgba(0,0,0,.2)",
          transform: `scale(${1.5 - 0.5 * llega - (d >= 0 && d < 5 ? 0.15 : 0)})`,
          opacity: llega * (1 - se),
        }}
      />
      <div style={{ ...base, border: "2.5px solid rgba(184,50,28,.8)", transform: `scale(${1 + onda * 1.8})`, opacity: d >= 0 ? 1 - onda : 0 }} />
    </>
  );
};

export const Foto: React.FC<{ src: string; style?: React.CSSProperties }> = ({ src, style }) => (
  <Img src={staticFile(src)} style={{ width: "100%", height: "100%", objectFit: "cover", display: "block", ...style }} />
);

export const Flecha: React.FC<{ tam?: number; color?: string; izquierda?: boolean }> = ({ tam = 18, color = "currentColor", izquierda }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.4} strokeLinecap="round" strokeLinejoin="round" style={{ transform: izquierda ? "scaleX(-1)" : undefined }}>
    <path d="M5 12h14M13 6l6 6-6 6" />
  </svg>
);

export const Camara: React.FC<{ tam?: number; color?: string }> = ({ tam = 24, color = "currentColor" }) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2} strokeLinecap="round" strokeLinejoin="round">
    <path d="M14.5 4h-5L7 7H4a2 2 0 0 0-2 2v9a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V9a2 2 0 0 0-2-2h-3l-2.5-3z" />
    <circle cx="12" cy="13" r="3" />
  </svg>
);

export const Tilde: React.FC<{ tam?: number; color?: string; progreso?: number; grosor?: number }> = ({
  tam = 24,
  color = "currentColor",
  progreso = 1,
  grosor = 3,
}) => (
  <svg width={tam} height={tam} viewBox="0 0 24 24" fill="none">
    <path d="M5 12.5l4.5 4.5L19 7.5" stroke={color} strokeWidth={grosor} strokeLinecap="round" strokeLinejoin="round" strokeDasharray={24} strokeDashoffset={24 * (1 - progreso)} />
  </svg>
);
