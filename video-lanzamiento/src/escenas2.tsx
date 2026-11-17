import React from "react";
import { AbsoluteFill, useCurrentFrame } from "remotion";
import { Bajada, C, Corazon, FUENTE, Lineas, Logo, rebote, suave, t, Telefono, Titulo, Toque } from "./comun";
import { MisPiezas } from "./pantallas";
import {
  HojaAgregar,
  HojaCompartir,
  IngresoPin,
  Inicio,
  LlamadaGoncy,
  Navegador,
  POS_AGREGAR,
  POS_AGREGAR_INICIO,
  POS_BOTON_LLAMADA,
  POS_COMPARTIR,
  POS_ICONO,
  POS_OLVIDE,
  posTecla2,
  TallerApp,
} from "./pantallas2";
import T from "./tiempos.json";

const Fondo: React.FC<{ color: string; children: React.ReactNode }> = ({ color, children }) => (
  <AbsoluteFill style={{ background: color, fontFamily: FUENTE, color: C.tinta }}>{children}</AbsoluteFill>
);

/** "Mis piezas" quieta, como queda el taller abierto. */
const Piezas: React.FC = () => <MisPiezas precioEn={9999} guardaEn={9999} vendidaEn={9999} />;

/* ================= Video 2 · Me olvidé la clave ================= */

const O = T.olvido;

export const IntroOlvido: React.FC = () => {
  const f = useCurrentFrame();
  const llenos = [30, 36, 42, 48].filter((x) => f >= x).length;
  const sacude = f >= 54 && f < 70 ? Math.sin((f - 54) * 1.9) * 16 * (1 - (f - 54) / 16) : 0;
  return (
    <Fondo color={C.rojo}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
        <Lineas lineas={["¿Y si Norma", "se olvida la clave?"]} desde={4} cada={8} alinear="left" estilo={{ fontSize: 104, fontWeight: 700, color: C.crema, letterSpacing: "-0.03em", lineHeight: 1.05 }} />
        <div style={{ marginTop: 80, display: "flex", gap: 34, transform: `translateX(${sacude}px)` }}>
          {[0, 1, 2, 3].map((i) => {
            const lleno = i < llenos && f < 70;
            return (
              <div
                key={i}
                style={{
                  width: 54,
                  height: 54,
                  borderRadius: 99,
                  border: `9px solid ${C.crema}`,
                  background: lleno ? C.crema : "transparent",
                  transform: `scale(${lleno ? 0.85 + 0.15 * rebote(f, 30 + i * 6, 10) : 1})`,
                  opacity: t(f, 18, 30),
                }}
              />
            );
          })}
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};

export const LlamadaEscena: React.FC = () => {
  const f = useCurrentFrame();
  const intentos = [O.error, O.nuevo];
  const piezas = t(f, O.piezasEn, O.piezasEn + 18, 0, 1, suave);
  return (
    <Fondo color={C.crema}>
      <Titulo kicker="PARA NORMA" lineas={["Se equivoca de número"]} desde={0} hasta={118} />
      <Titulo kicker="SI SE OLVIDÓ" lineas={["Toca «Me olvidé", "la clave»"]} desde={124} hasta={236} />
      <Titulo kicker="AL TOQUE" lineas={["Y la atiende Goncy"]} desde={242} hasta={372} />
      <Titulo kicker="LISTO" lineas={["Entra con la", "clave nueva"]} desde={378} />
      <Telefono>
        <IngresoPin intentos={intentos} okEn={O.nuevo.en} olvideEn={O.olvideEn} />
        <LlamadaGoncy abreEn={O.olvideEn + 4} atiendeEn={O.atiendeEn} graciasEn={O.graciasEn} />
        {f >= O.piezasEn && (
          <div style={{ position: "absolute", inset: 0, transform: `translateX(${(1 - piezas) * 100}%)`, boxShadow: "-20px 0 40px rgba(0,0,0,.15)" }}>
            <Piezas />
          </div>
        )}
        {intentos.flatMap((x) =>
          x.toques.map((en, i) => {
            const p = posTecla2(x.digitos[i]);
            return <Toque key={`${en}`} x={p.x} y={p.y} en={en} />;
          }),
        )}
        <Toque x={POS_OLVIDE.x} y={POS_OLVIDE.y} en={O.olvideEn} />
        <Toque x={POS_BOTON_LLAMADA.x} y={POS_BOTON_LLAMADA.y} en={O.graciasEn} />
      </Telefono>
      <Bajada lineas={["Tiene 5 intentos.", "Después espera 15 minutos."]} desde={10} hasta={118} />
      <Bajada lineas={["El celu llama solo a Goncy,", "el que armó su taller."]} desde={130} hasta={236} />
      <Bajada lineas={["La tranquiliza y le pasa", "una clave nueva."]} desde={248} hasta={372} />
      <Bajada lineas={["Y el taller vuelve a quedar", "abierto en su celu."]} desde={384} />
    </Fondo>
  );
};

export const CierreOlvido: React.FC = () => {
  const f = useCurrentFrame();
  const url = rebote(f, 44, 13);
  return (
    <Fondo color={C.tinta}>
      <AbsoluteFill style={{ justifyContent: "center", padding: "0 90px" }}>
        <Lineas lineas={["Nadie se queda", "afuera del taller."]} desde={4} cada={8} alinear="left" estilo={{ fontSize: 104, fontWeight: 700, color: C.crema, letterSpacing: "-0.03em", lineHeight: 1.05 }} />
        <div style={{ marginTop: 60, width: 220, height: 10, borderRadius: 9, background: C.rojo, transform: `scaleX(${t(f, 26, 52, 0, 1, suave)})`, transformOrigin: "0 50%" }} />
        <div style={{ marginTop: 80, display: "flex", alignItems: "center", gap: 28, opacity: Math.min(url * 2, 1), transform: `translateY(${(1 - url) * 30}px)` }}>
          <Corazon tam={96} />
          <div>
            <div style={{ fontSize: 44, fontWeight: 700, color: C.crema }}>atelier-de-norma.vercel.app</div>
            <div style={{ fontSize: 34, color: C.crema, opacity: 0.75, marginTop: 6 }}>Taller: PIN 1234 · la llamada es simulada</div>
          </div>
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};

/* ================= Video 3 · El ícono en el celular ================= */

const A = T.acceso;

export const AccesoEscena: React.FC = () => {
  const f = useCurrentFrame();
  const inicio = t(f, A.inicioEn, A.inicioEn + 14);
  return (
    <Fondo color={C.crema}>
      <Titulo kicker="UNA SOLA VEZ" lineas={["Goncy le guarda", "el taller en el celu"]} desde={0} hasta={176} />
      <Titulo kicker="TODOS LOS DÍAS" lineas={["Norma toca", "y ya está adentro"]} desde={182} />
      <Telefono>
        <Navegador compartirEn={A.compartirEn}>
          <Piezas />
        </Navegador>
        <HojaCompartir abreEn={A.compartirEn + 4} eligeEn={A.agregarInicioEn} />
        <HojaAgregar abreEn={A.agregarInicioEn + 4} agregaEn={A.agregarEn} />
        {f >= A.inicioEn && (
          <div style={{ position: "absolute", inset: 0, opacity: inicio, transform: `scale(${1.06 - 0.06 * inicio})` }}>
            <Inicio iconoEn={A.iconoEn} tocaEn={A.tocaEn}>
              <TallerApp>
                <Piezas />
              </TallerApp>
            </Inicio>
          </div>
        )}
        <Toque x={POS_COMPARTIR.x} y={POS_COMPARTIR.y} en={A.compartirEn} />
        <Toque x={POS_AGREGAR_INICIO.x} y={POS_AGREGAR_INICIO.y} en={A.agregarInicioEn} />
        <Toque x={POS_AGREGAR.x} y={POS_AGREGAR.y} en={A.agregarEn} />
        <Toque x={POS_ICONO.x} y={POS_ICONO.y} en={A.tocaEn} />
      </Telefono>
      <Bajada lineas={["Compartir y después", "«Agregar a inicio»."]} desde={10} hasta={104} />
      <Bajada lineas={["Queda como una app más,", "con su corazón rojo."]} desde={112} hasta={176} />
      <Bajada lineas={["Sin buscar nada", "ni escribir direcciones."]} desde={192} />
    </Fondo>
  );
};

export const CierreAcceso: React.FC = () => {
  const f = useCurrentFrame();
  return (
    <Fondo color={C.rojo}>
      <AbsoluteFill style={{ alignItems: "center", justifyContent: "center" }}>
        <div style={{ transform: `scale(${rebote(f, 2, 10)}) rotate(${(1 - rebote(f, 2, 10)) * -14}deg)`, filter: "drop-shadow(0 30px 40px rgba(42,33,29,.35))" }}>
          <Corazon tam={260} fondo={C.crema} color={C.rojo} />
        </div>
        <div style={{ marginTop: 26, fontSize: 44, fontWeight: 700, color: C.crema, opacity: t(f, 10, 24) }}>Mi taller</div>
        <div style={{ marginTop: 80 }}>
          <Lineas lineas={["Su tienda,", "a un toque."]} desde={20} cada={7} estilo={{ fontSize: 104, fontWeight: 700, color: C.crema, letterSpacing: "-0.03em", lineHeight: 1.05 }} />
        </div>
        <div style={{ marginTop: 70, opacity: t(f, 40, 56) }}>
          <Logo ancho={420} color={C.crema} />
        </div>
      </AbsoluteFill>
    </Fondo>
  );
};
