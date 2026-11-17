import React from "react";
import { AbsoluteFill, Sequence, useCurrentFrame, useVideoConfig } from "remotion";
import { Bajada, C, Corazon, Foto, FUENTE, Lineas, Logo, rebote, t, Telefono, Tilde, Titulo, Toque, entrada, suave } from "./comun";
import { Aviso, ChatNorma, MisPiezas, Pin, posTecla, SubirPieza, Tienda, TIENDA, WhatsApp } from "./pantallas";

const Fondo: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <AbsoluteFill style={{ background: color, fontFamily: FUENTE, color: C.tinta }}>{children}</AbsoluteFill>
);

/* 1 · Quién es Norma */
export const Presentacion: React.FC = () => {
  const f = useCurrentFrame();
  const { durationInFrames } = useVideoConfig();
  const cambio = t(f, 62, 80, 0, 1, suave);
  return (
    <Fondo color={C.tinta}>
      <AbsoluteFill style={{ transform: `scale(${1.18 - 0.1 * (f / durationInFrames)})` }}>
        <Foto src="torno.webp" />
      </AbsoluteFill>
      <AbsoluteFill style={{ opacity: cambio, transform: `scale(${1.12 - 0.08 * t(f, 62, durationInFrames, 0, 1, (x) => x)})` }}>
        <Foto src="manos.webp" />
      </AbsoluteFill>
      <AbsoluteFill style={{ background: "linear-gradient(180deg, rgba(42,33,29,0) 35%, rgba(42,33,29,.88) 78%)" }} />
      <div style={{ position: "absolute", left: 80, top: 1240 }}>
        <div
          style={{
            display: "inline-block",
            background: C.rojo,
            color: C.crema,
            fontWeight: 700,
            fontSize: 28,
            letterSpacing: "0.16em",
            padding: "12px 22px",
            borderRadius: 999,
            transform: `scale(${rebote(f, 4, 12)})`,
            transformOrigin: "0 50%",
          }}
        >
          CONOCÉ A NORMA
        </div>
      </div>
      <div style={{ position: "absolute", left: 80, top: 1360 }}>
        <Lineas
          lineas={["Tiene 70 años", "y hace tazas a mano."]}
          desde={10}
          cada={7}
          hasta={56}
          alinear="left"
          estilo={{ fontSize: 88, fontWeight: 700, color: C.crema, lineHeight: 1.06, letterSpacing: "-0.025em" }}
        />
      </div>
      <div style={{ position: "absolute", left: 80, top: 1360 }}>
        <Lineas
          lineas={["No usa computadora,", "no tiene mail", "y ve poco de cerca."]}
          desde={70}
          cada={7}
          alinear="left"
          estilo={{ fontSize: 88, fontWeight: 700, color: C.crema, lineHeight: 1.06, letterSpacing: "-0.025em" }}
        />
      </div>
    </Fondo>
  );
};

/* 2 · La marca */
export const Marca: React.FC = () => {
  const f = useCurrentFrame();
  const trazo = t(f, 12, 46, 0, 1, suave);
  return (
    <Fondo color={C.crema}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center", gap: 70, transform: `translateY(${-t(f, 0, 100, 0, 30, (x) => x)}px)` }}>
        <Corazon tam={170} style={{ transform: `scale(${rebote(f, 0, 10)}) rotate(${(1 - rebote(f, 0, 10)) * -20}deg)` }} />
        <div style={{ clipPath: `inset(-10% ${(1 - trazo) * 100}% -10% 0)` }}>
          <Logo ancho={860} />
        </div>
        <Lineas lineas={["Ahora tiene su tienda online,", "hecha a su medida."]} desde={44} cada={7} estilo={{ fontSize: 58, fontWeight: 700, lineHeight: 1.15, color: C.tinta }} />
      </AbsoluteFill>
    </Fondo>
  );
};

/* 3 · Lo que no tiene */
export const SinVueltas: React.FC = () => {
  const f = useCurrentFrame();
  const textos = ["SIN CARRITO.", "SIN REGISTRO.", "SIN PASARELA."];
  return (
    <Fondo color={C.rojo}>
      <div style={{ position: "absolute", left: 90, top: 560 }}>
        {textos.map((x, i) => {
          const tacha = t(f, 52 + i * 5, 66 + i * 5, 0, 1, suave);
          return (
            <div key={x} style={{ position: "relative", marginBottom: 10 }}>
              <Lineas lineas={[x]} desde={4 + i * 9} estilo={{ fontSize: 118, fontWeight: 700, color: C.crema, letterSpacing: "-0.03em", lineHeight: 1.05, opacity: 1 - 0.55 * tacha }} alinear="left" />
              <div style={{ position: "absolute", left: -10, right: -10, top: "52%", height: 12, borderRadius: 9, background: C.tinta, transform: `scaleX(${tacha})`, transformOrigin: "0 50%" }} />
            </div>
          );
        })}
        <div style={{ marginTop: 90 }}>
          <Lineas lineas={["Todo pasa", "por WhatsApp."]} desde={74} cada={7} alinear="left" estilo={{ fontSize: 118, fontWeight: 700, color: C.tinta, letterSpacing: "-0.03em", lineHeight: 1.05 }} />
        </div>
      </div>
    </Fondo>
  );
};

/* 4 · Comprar, en vivo */
export const Comprar: React.FC = () => {
  const f = useCurrentFrame();
  const tarjetaArriba = 60;
  const scroll = t(f, 14, 86, 0, TIENDA.titulo + 2 * TIENDA.tarjeta - tarjetaArriba, suave);
  const yBoton = tarjetaArriba + TIENDA.botonEnTarjeta + 26;
  const entraWA = t(f, 108, 128, 0, 1, suave);
  return (
    <Fondo color={C.crema}>
      <Titulo kicker="PARA QUIEN COMPRA" n="1" lineas={["Elegís tu taza"]} desde={0} hasta={100} />
      <Titulo kicker="PARA QUIEN COMPRA" n="2" lineas={["Le escribís", "por WhatsApp"]} desde={110} hasta={222} />
      <Titulo kicker="PARA QUIEN COMPRA" n="3" lineas={["Le transferís"]} desde={232} />
      <Telefono>
        <Tienda scroll={scroll} presionadoEn={98} />
        <Toque x={196} y={yBoton} en={98} />
        {f >= 106 && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - entraWA) * 100}%)`, boxShadow: "-20px 0 40px rgba(0,0,0,.15)" }}>
            <Sequence from={108} layout="none">
              <WhatsApp enviaEn={40} respuestaEn={92} aliasEn={128} />
              <Toque x={360} y={754} en={40} />
            </Sequence>
          </div>
        )}
      </Telefono>
      <Bajada lineas={["Todas las piezas, con su precio."]} desde={10} hasta={100} />
      <Bajada lineas={["Se abre con el pedido ya escrito."]} desde={116} hasta={222} />
      <Bajada lineas={["Norma te pasa el alias y listo."]} desde={240} />
    </Fondo>
  );
};

/* 5 · Resumen de la compra */
export const TresPasos: React.FC = () => {
  const f = useCurrentFrame();
  const pasos = ["Elegís la taza", "Le escribís a Norma", "Le transferís"];
  return (
    <Fondo color={C.crema}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 110px" }}>
        <Lineas lineas={["Comprar son", "3 pasos."]} cada={6} alinear="left" estilo={{ fontSize: 112, fontWeight: 700, color: C.rojo, letterSpacing: "-0.03em", lineHeight: 1.02 }} />
        <div style={{ marginTop: 80, display: "flex", flexDirection: "column", gap: 44 }}>
          {pasos.map((p, i) => {
            const a = 18 + i * 12;
            const s = rebote(f, a, 12);
            return (
              <div key={p} style={{ display: "flex", alignItems: "center", gap: 34 }}>
                <div style={{ width: 104, height: 104, borderRadius: 999, background: C.rojo, color: C.crema, display: "grid", placeItems: "center", fontSize: 54, fontWeight: 700, transform: `scale(${s})`, flexShrink: 0 }}>
                  {f >= a + 34 ? <Tilde tam={60} color={C.crema} progreso={t(f, a + 34, a + 46)} grosor={3.2} /> : i + 1}
                </div>
                <Lineas lineas={[p]} desde={a + 2} alinear="left" estilo={{ fontSize: 62, fontWeight: 700, color: C.tinta, letterSpacing: "-0.02em" }} />
              </div>
            );
          })}
        </div>
        <div style={{ marginTop: 90 }}>
          <Lineas lineas={["Sin cuentas, sin claves", "y sin pasar por otra página."]} desde={62} cada={6} alinear="left" estilo={{ fontSize: 42, color: C.tinta, opacity: 0.8, lineHeight: 1.3 }} />
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};

/* 6 · El chat de Norma */
export const Chat: React.FC = () => (
  <Fondo color={C.crema}>
    <Titulo kicker="PARA QUIEN COMPRA" lineas={["Un chat con Norma"]} desde={0} />
    <Telefono>
      <Tienda scroll={0} />
      <ChatNorma saludoEn={14} abreEn={46} elijeEn={122} />
      <Toque x={346} y={748} en={46} />
      <Toque x={196} y={606} en={122} />
    </Telefono>
    <Bajada lineas={["Cada respuesta abre WhatsApp", "con el mensaje listo."]} desde={10} />
  </Fondo>
);

/* 7 · Cambio de lado */
export const OtroLado: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Fondo color={C.tinta}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
        <Lineas lineas={["Del otro lado,", "Norma maneja", "todo sola."]} desde={4} cada={8} alinear="left" estilo={{ fontSize: 118, fontWeight: 700, color: C.crema, letterSpacing: "-0.03em", lineHeight: 1.05 }} />
        <div style={{ marginTop: 60, width: 220, height: 10, borderRadius: 9, background: C.rojo, transform: `scaleX(${t(f, 30, 56, 0, 1, suave)})`, transformOrigin: "0 50%" }} />
      </AbsoluteFill>
    </Fondo>
  );
};

/* 8 · Entrar al taller */
export const EntrarTaller: React.FC = () => {
  const toques = [26, 40, 54, 68];
  return (
    <Fondo color={C.crema}>
      <Titulo kicker="PARA NORMA" n="1" lineas={["Entra con su PIN"]} desde={0} />
      <Telefono>
        <Pin toques={toques} listoEn={78} />
        {toques.map((en, i) => {
          const p = posTecla(String(i + 1));
          return <Toque key={i} x={p.x} y={p.y} en={en} />;
        })}
      </Telefono>
      <Bajada lineas={["Cuatro números grandes", "y queda abierto en su celu."]} desde={12} />
    </Fondo>
  );
};

/* 9 · Subir una pieza */
export const Subir: React.FC = () => (
  <Fondo color={C.crema}>
    <Titulo kicker="PARA NORMA" n="2" lineas={["Sube una pieza"]} desde={0} />
    <Telefono>
      <SubirPieza camaraEn={26} disparoEn={66} listoEn={140} aceptaEn={172} />
      <Toque x={196} y={296} en={26} />
      <Toque x={196} y={705} en={66} />
      <Toque x={196} y={536} en={172} />
    </Telefono>
    <Bajada lineas={["Saca la foto como le sale."]} desde={10} hasta={108} />
    <Bajada lineas={["El sitio le quita el fondo", "y la deja como de catálogo."]} desde={118} />
  </Fondo>
);

/* 10 · Precios y vendidas */
export const Precios: React.FC = () => (
  <Fondo color={C.crema}>
    <Titulo kicker="PARA NORMA" n="3" lineas={["Cambia el precio", "y marca lo vendido."]} desde={0} />
    <Telefono top={500}>
      <MisPiezas precioEn={24} guardaEn={74} vendidaEn={134} />
      <Toque x={111} y={214} en={24} />
      <Toque x={306} y={216} en={74} />
      <Toque x={281} y={400} en={134} />
    </Telefono>
    <Bajada lineas={["Botones y letra bien grandes."]} desde={12} top={1720} />
  </Fondo>
);

/* 11 · El aviso */
export const Avisos: React.FC = () => {
  const f = useCurrentFrame();
  const zumbido = f >= 28 && f < 44 ? Math.sin((f - 28) * 2.4) * (1 - (f - 28) / 16) * 2.2 : 0;
  return (
    <Fondo color={C.crema}>
      <Titulo kicker="PARA NORMA" n="4" lineas={["Le llega un aviso"]} desde={0} />
      <div style={{ position: "absolute", inset: 0, transform: `rotate(${zumbido}deg)`, transformOrigin: "50% 60%" }}>
        <Telefono>
          <Aviso llegaEn={28} />
        </Telefono>
      </div>
      <Bajada lineas={["Si pasa una semana", "sin tocar la tienda."]} desde={12} />
    </Fondo>
  );
};

/* 12 · Accesibilidad */
export const Pensado: React.FC = () => {
  const f = useCurrentFrame();
  const chips = ["Letra de 20 px", "Contraste AAA", "Botones de 48 px", "Menos movimiento", "Sin cuentas ni mail", "Fotos parejas"];
  return (
    <Fondo color={C.rosa}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
        <Lineas lineas={["Pensada para Norma", "y para sus clientes."]} cada={7} alinear="left" estilo={{ fontSize: 84, fontWeight: 700, color: C.rojo, letterSpacing: "-0.03em", lineHeight: 1.05 }} />
        <div style={{ marginTop: 80, display: "flex", flexDirection: "column", gap: 22, alignItems: "flex-start" }}>
          {[chips.slice(0, 2), chips.slice(2, 4), chips.slice(4, 6)].map((fila, r) => (
            <div key={r} style={{ display: "flex", gap: 22 }}>
              {fila.map((c, j) => {
                const i = r * 2 + j;
                const s = rebote(f, 22 + i * 6, 12);
                return (
                  <div
                    key={c}
                    style={{
                      background: C.papel,
                      color: C.rojo,
                      fontWeight: 700,
                      fontSize: 42,
                      borderRadius: 999,
                      padding: "20px 34px",
                      whiteSpace: "nowrap",
                      transform: `scale(${s}) rotate(${(1 - s) * (i % 2 ? 6 : -6)}deg)`,
                      boxShadow: "0 10px 24px -14px rgba(138,35,18,.5)",
                    }}
                  >
                    {c}
                  </div>
                );
              })}
            </div>
          ))}
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};

/* 13 · Cierre */
export const Cierre: React.FC = () => {
  const f = useCurrentFrame();
  const trazo = t(f, 10, 44, 0, 1, suave);
  const url = rebote(f, 52, 13);
  return (
    <Fondo color={C.rojo}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <Corazon tam={150} fondo={C.crema} color={C.rojo} style={{ transform: `scale(${rebote(f, 0, 10)})` }} />
        <div style={{ marginTop: 60, clipPath: `inset(-10% ${(1 - trazo) * 100}% -10% 0)` }}>
          <Logo ancho={820} color={C.crema} />
        </div>
        <div style={{ marginTop: 90 }}>
          <Lineas lineas={["Probala vos"]} desde={40} estilo={{ fontSize: 92, fontWeight: 700, color: C.crema, letterSpacing: "-0.03em" }} />
        </div>
        <div
          style={{
            marginTop: 40,
            background: C.crema,
            color: C.rojo,
            fontWeight: 700,
            fontSize: 48,
            borderRadius: 999,
            padding: "22px 44px",
            transform: `scale(${url})`,
            opacity: Math.min(url * 2, 1),
          }}
        >
          atelier-de-norma.vercel.app
        </div>
        <div style={{ marginTop: 34 }}>
          <Lineas lineas={["Taller de Norma: PIN 1234"]} desde={62} estilo={{ fontSize: 40, color: C.crema, opacity: 0.92 }} />
        </div>
      </AbsoluteFill>
      <div style={{ position: "absolute", left: 0, right: 0, bottom: 110, textAlign: "center", fontSize: 32, color: C.crema, opacity: 0.8 * t(f, 76, 96) }}>
        Desarrollado por giselacaruso.com
      </div>
    </Fondo>
  );
};
