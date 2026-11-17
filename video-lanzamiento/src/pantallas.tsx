import React from "react";
import { staticFile, Img, useCurrentFrame } from "remotion";
import { C, CaraNorma, Camara, Flecha, Foto, Logo, presion, rebote, t, Tilde, entrada, suave } from "./comun";

/* ---------- La tienda (lo que ve quien compra) ---------- */

export const PIEZAS = [
  { n: 2, nombre: "Taza Picnic", precio: "$ 10.500" },
  { n: 5, nombre: "Taza Nube", precio: "$ 12.000" },
  { n: 1, nombre: "Taza Moñitos", precio: "$ 9.500" },
  { n: 4, nombre: "Taza Rombos", precio: "$ 9.000" },
];
// Medidas fijas para saber dónde cae cada botón al hacer scroll.
export const TIENDA = { cabecera: 64, hero: 432, titulo: 572, tarjeta: 500, botonEnTarjeta: 432 };

export const Tarjeta: React.FC<{ n: number; nombre: string; precio: string; presionadoEn?: number }> = ({ n, nombre, precio, presionadoEn }) => {
  const f = useCurrentFrame();
  const p = presionadoEn !== undefined ? presion(f, presionadoEn) : 1;
  return (
    <div style={{ height: TIENDA.tarjeta, padding: "0 24px", textAlign: "center" }}>
      <div style={{ width: 344, height: 344, borderRadius: 26, overflow: "hidden", background: C.crema2 }}>
        <Foto src={`taza-${n}.webp`} />
      </div>
      <div style={{ marginTop: 16, height: 26, color: C.rojo, fontWeight: 700, fontSize: 20 }}>{nombre}</div>
      <div style={{ marginTop: 6, height: 24, color: C.rojo, fontWeight: 700, fontSize: 19 }}>{precio}</div>
      <div
        style={{
          marginTop: 16,
          height: 52,
          borderRadius: 999,
          background: presionadoEn !== undefined && f >= presionadoEn ? C.rojoOscuro : C.rojo,
          color: "white",
          fontWeight: 700,
          fontSize: 18,
          display: "grid",
          placeItems: "center",
          transform: `scale(${p})`,
        }}
      >
        La quiero
      </div>
    </div>
  );
};

export const Tienda: React.FC<{ scroll?: number; presionadoEn?: number }> = ({ scroll = 0, presionadoEn }) => (
  <div style={{ position: "absolute", inset: 0, background: C.papel }}>
    <div style={{ transform: `translateY(${-scroll}px)` }}>
      <div style={{ height: TIENDA.cabecera, display: "flex", alignItems: "center", justifyContent: "space-between", padding: "0 18px" }}>
        <Logo ancho={140} />
        <div style={{ fontSize: 13, fontWeight: 700, color: C.rojo, border: `2px solid ${C.rojo}`, borderRadius: 999, padding: "6px 12px" }}>Letra más grande</div>
      </div>
      <div style={{ padding: "16px 16px 0", display: "grid", gridTemplateColumns: "1fr 1fr", gap: 8, height: TIENDA.hero - TIENDA.cabecera }}>
        {["torno", "manos", "jarron", "mate"].map((x) => (
          <div key={x} style={{ borderRadius: 18, overflow: "hidden", height: 172 }}>
            <Foto src={`${x}.webp`} />
          </div>
        ))}
      </div>
      <div style={{ height: TIENDA.titulo - TIENDA.hero, padding: "18px 24px 0" }}>
        <div style={{ color: C.rojo, fontSize: 30, fontWeight: 500, textTransform: "uppercase", lineHeight: 1.02, letterSpacing: "-0.015em" }}>
          Recién salidito
          <br />
          del horno.
        </div>
        <div style={{ marginTop: 10, fontSize: 16, opacity: 0.85 }}>Comprá fácil y rápido mis artesanías.</div>
      </div>
      {PIEZAS.map((p) => (
        <Tarjeta key={p.n} {...p} presionadoEn={p.n === 1 ? presionadoEn : undefined} />
      ))}
    </div>
  </div>
);

/* ---------- WhatsApp ---------- */

const VERDE_WA = "#008069";
const Globo: React.FC<{ mio?: boolean; aparece: number; children: React.ReactNode; hora?: string }> = ({ mio, aparece, children, hora = "10:24" }) => {
  const f = useCurrentFrame();
  if (f < aparece) return null;
  const s = rebote(f, aparece, 15);
  return (
    <div
      style={{
        alignSelf: mio ? "flex-end" : "flex-start",
        maxWidth: 290,
        background: mio ? "#d9fdd3" : "white",
        borderRadius: 14,
        borderTopRightRadius: mio ? 4 : 14,
        borderTopLeftRadius: mio ? 14 : 4,
        padding: "8px 10px 6px",
        fontSize: 16,
        lineHeight: 1.35,
        boxShadow: "0 1px 1px rgba(0,0,0,.12)",
        transform: `scale(${0.6 + 0.4 * s}) translateY(${(1 - s) * 18}px)`,
        transformOrigin: mio ? "100% 100%" : "0 100%",
        opacity: Math.min(s * 1.5, 1),
      }}
    >
      {children}
      <div style={{ textAlign: "right", fontSize: 11.5, color: "#667781", marginTop: 2 }}>
        {hora} {mio && <span style={{ color: "#53bdeb" }}>✓✓</span>}
      </div>
    </div>
  );
};

const Escribiendo: React.FC<{ desde: number; hasta: number }> = ({ desde, hasta }) => {
  const f = useCurrentFrame();
  if (f < desde || f >= hasta) return null;
  return (
    <div style={{ alignSelf: "flex-start", background: "white", borderRadius: 14, borderTopLeftRadius: 4, padding: "12px 14px", display: "flex", gap: 5, opacity: t(f, desde, desde + 6) }}>
      {[0, 1, 2].map((i) => (
        <div key={i} style={{ width: 8, height: 8, borderRadius: 9, background: "#8696a0", transform: `translateY(${Math.sin((f - desde) / 3.2 - i * 0.9) * 3}px)` }} />
      ))}
    </div>
  );
};

export const PEDIDO = "¡Hola Norma! Quiero comprar la Taza Moñitos ($ 9.500).";

/** Chat con Norma. `enviaEn`: cuadro en que se toca enviar. Respuestas en `respuestaEn` y `aliasEn`. */
export const WhatsApp: React.FC<{ enviaEn: number; respuestaEn: number; aliasEn: number }> = ({ enviaEn, respuestaEn, aliasEn }) => {
  const f = useCurrentFrame();
  const enviado = f >= enviaEn + 2;
  const brillo = t(f, 4, 14) * (1 - t(f, 26, 44));
  return (
    <div style={{ position: "absolute", inset: 0, background: "#efeae2", display: "flex", flexDirection: "column" }}>
      <div style={{ height: 76, background: VERDE_WA, display: "flex", alignItems: "flex-end", padding: "0 12px 10px", gap: 10, color: "white" }}>
        <Flecha tam={22} izquierda color="white" />
        <CaraNorma tam={38} />
        <div>
          <div style={{ fontWeight: 700, fontSize: 17, lineHeight: 1.1 }}>Norma</div>
          <div style={{ fontSize: 12.5, opacity: 0.85 }}>{f >= respuestaEn - 26 && f < aliasEn ? "escribiendo…" : "en línea"}</div>
        </div>
      </div>
      <div style={{ flex: 1, display: "flex", flexDirection: "column", justifyContent: "flex-end", gap: 8, padding: "12px 12px 10px" }}>
        <Globo mio aparece={enviaEn + 2}>
          <div style={{ background: "#c8ebc2", borderRadius: 10, overflow: "hidden", marginBottom: 6, display: "flex" }}>
            <Img src={staticFile("taza-1.webp")} style={{ width: 84, height: 84, objectFit: "cover" }} />
            <div style={{ padding: "8px 10px", fontSize: 13, lineHeight: 1.3 }}>
              <div style={{ fontWeight: 700 }}>Taza Moñitos · $ 9.500</div>
              <div style={{ opacity: 0.7 }}>Atelier de Norma</div>
              <div style={{ opacity: 0.55, fontSize: 12 }}>atelier-de-norma.vercel.app</div>
            </div>
          </div>
          {PEDIDO}
        </Globo>
        <Escribiendo desde={respuestaEn - 26} hasta={respuestaEn} />
        <Globo aparece={respuestaEn} hora="10:25">¡Hola! Sí, la tengo. 🧡</Globo>
        <Escribiendo desde={respuestaEn + 4} hasta={aliasEn} />
        <Globo aparece={aliasEn} hora="10:25">
          Me transferís a <b>atelier.norma</b> y coordinamos el retiro.
        </Globo>
      </div>
      <div style={{ padding: "6px 8px 22px", display: "flex", alignItems: "flex-end", gap: 8 }}>
        <div
          style={{
            flex: 1,
            minHeight: 46,
            background: "white",
            borderRadius: 24,
            padding: "11px 16px",
            fontSize: 15.5,
            lineHeight: 1.3,
            color: enviado ? "#8696a0" : C.tinta,
            boxShadow: `0 0 0 ${brillo * 3}px rgba(0,168,132,${brillo * 0.6})`,
          }}
        >
          {enviado ? "Mensaje" : PEDIDO}
        </div>
        <div style={{ width: 48, height: 48, borderRadius: 99, background: "#00a884", display: "grid", placeItems: "center", transform: `scale(${presion(f, enviaEn)})`, flexShrink: 0 }}>
          <svg width="22" height="22" viewBox="0 0 24 24" fill="white">
            <path d="M3 20.5v-6l9-2.5-9-2.5v-6L22 12z" />
          </svg>
        </div>
      </div>
    </div>
  );
};

/* ---------- El chat de la tienda ("Hablá con Norma") ---------- */

export const OPCIONES = ["Me gustó una taza", "¿Cómo pago?", "¿Hacés envíos?", "Quiero una por encargo"];

export const ChatNorma: React.FC<{ saludoEn: number; abreEn: number; elijeEn: number }> = ({ saludoEn, abreEn, elijeEn }) => {
  const f = useCurrentFrame();
  const saludo = t(f, saludoEn, saludoEn + 16) * (1 - t(f, abreEn - 4, abreEn + 4, 0, 1, entrada));
  const abre = rebote(f, abreEn, 16);
  const abierto = f >= abreEn;
  return (
    <>
      {/* globito que invita */}
      <div
        style={{
          position: "absolute",
          right: 84,
          bottom: 34,
          background: "white",
          borderRadius: 18,
          borderBottomRightRadius: 4,
          padding: "10px 14px",
          fontSize: 16,
          fontWeight: 700,
          boxShadow: "0 8px 20px -6px rgba(42,33,29,.35)",
          opacity: saludo,
          transform: `translateX(${(1 - saludo) * 16}px) scale(${0.85 + saludo * 0.15})`,
          transformOrigin: "100% 100%",
        }}
      >
        ¡Hola! ¿Te ayudo?
      </div>
      {/* carita de Norma */}
      <div style={{ position: "absolute", right: 16, bottom: 22, transform: `scale(${presion(f, abreEn) * (0.9 + 0.1 * t(f, 0, 12))})`, filter: "drop-shadow(0 6px 10px rgba(42,33,29,.35))" }}>
        <CaraNorma tam={60} />
      </div>
      {/* panel: crece desde la carita */}
      {abierto && (
        <div
          style={{
            position: "absolute",
            right: 16,
            bottom: 96,
            width: 360,
            borderRadius: 26,
            overflow: "hidden",
            background: C.papel,
            boxShadow: "0 2px 6px rgba(42,33,29,.12), 0 24px 48px -16px rgba(42,33,29,.45)",
            transform: `scale(${0.5 + 0.5 * abre})`,
            opacity: Math.min(abre * 1.4, 1),
            transformOrigin: "100% 100%",
          }}
        >
          <div style={{ background: C.rojo, color: "white", display: "flex", alignItems: "center", gap: 12, padding: "12px 16px" }}>
            <CaraNorma tam={46} style={{ borderRadius: 99, boxShadow: "0 0 0 2px white" }} />
            <div>
              <div style={{ fontWeight: 700 }}>Norma</div>
              <div style={{ fontSize: 13, opacity: 0.9 }}>Te contesto por WhatsApp</div>
            </div>
          </div>
          <div style={{ background: C.crema, padding: "14px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {["¡Hola! Soy Norma.", "Hago cada taza a mano en mi taller. ¿En qué te ayudo?"].map((m, i) => {
              const a = t(f, abreEn + 10 + i * 10, abreEn + 24 + i * 10);
              return (
                <div key={i} style={{ background: "white", borderRadius: 16, borderTopLeftRadius: 5, padding: "8px 14px", width: "fit-content", maxWidth: "88%", opacity: a, transform: `translateY(${(1 - a) * 10}px)` }}>
                  {m}
                </div>
              );
            })}
          </div>
          <div style={{ padding: "8px 16px 16px", display: "flex", flexDirection: "column", gap: 8 }}>
            {OPCIONES.map((o, i) => {
              const a = t(f, abreEn + 34 + i * 6, abreEn + 50 + i * 6);
              const elegida = i === 2 && f >= elijeEn;
              return (
                <div
                  key={o}
                  style={{
                    height: 48,
                    borderRadius: 999,
                    border: `2px solid ${C.rojo}`,
                    background: elegida ? C.rojo : "white",
                    color: elegida ? "white" : C.rojo,
                    fontWeight: 700,
                    display: "flex",
                    alignItems: "center",
                    justifyContent: "space-between",
                    padding: "0 18px",
                    opacity: a,
                    transform: `translateY(${(1 - a) * 12}px) scale(${i === 2 ? presion(f, elijeEn) : 1})`,
                  }}
                >
                  {o}
                  <Flecha />
                </div>
              );
            })}
          </div>
        </div>
      )}
    </>
  );
};

/* ---------- El taller (lo que ve Norma) ---------- */

export const TECLAS = ["1", "2", "3", "4", "5", "6", "7", "8", "9", "", "0", "⌫"];
export const posTecla = (k: string) => {
  const i = TECLAS.indexOf(k);
  return { x: 24 + (i % 3) * 118 + 54, y: 340 + Math.floor(i / 3) * 86 + 37 };
};

export const Pin: React.FC<{ toques: number[]; listoEn: number }> = ({ toques, listoEn }) => {
  const f = useCurrentFrame();
  const puestos = toques.filter((x) => f >= x).length;
  const listo = f >= listoEn;
  return (
    <div style={{ position: "absolute", inset: 0, background: C.papel, padding: "28px 24px" }}>
      <div style={{ display: "inline-flex", alignItems: "center", gap: 8, border: `2px solid ${C.rojo}`, color: C.rojo, borderRadius: 999, padding: "8px 18px", fontWeight: 700 }}>
        <Flecha izquierda /> Volver
      </div>
      <div style={{ marginTop: 26, color: C.rojo, fontSize: 34, textTransform: "uppercase", lineHeight: 1.02, fontWeight: 500 }}>
        Entrar a
        <br />
        mi taller
      </div>
      <div style={{ marginTop: 10, fontSize: 18 }}>Poné tus 4 números.</div>
      <div style={{ marginTop: 26, display: "flex", gap: 18, justifyContent: "center" }}>
        {[0, 1, 2, 3].map((i) => {
          const lleno = i < puestos;
          const s = lleno ? rebote(f, toques[i], 10) : 0;
          return (
            <div
              key={i}
              style={{
                width: 26,
                height: 26,
                borderRadius: 99,
                border: `3px solid ${listo ? C.verde : C.rojo}`,
                background: listo ? C.verde : lleno ? C.rojo : "transparent",
                transform: `scale(${lleno ? 0.8 + 0.2 * s + (listo ? 0.1 * rebote(f, listoEn, 8) : 0) : 1})`,
              }}
            />
          );
        })}
      </div>
      <div style={{ position: "absolute", left: 24, top: 340, display: "grid", gridTemplateColumns: "repeat(3, 108px)", gap: "14px 10px" }}>
        {TECLAS.map((k, i) => {
          const en = toques[["1", "2", "3", "4"].indexOf(k)];
          const activa = en !== undefined && f >= en && f < en + 8;
          return (
            <div
              key={i}
              style={{
                height: 72,
                borderRadius: 20,
                background: k === "" ? "transparent" : activa ? C.rojo : C.crema2,
                color: activa ? "white" : C.tinta,
                fontSize: 32,
                fontWeight: 500,
                display: "grid",
                placeItems: "center",
                transform: `scale(${en !== undefined ? presion(f, en) : 1})`,
              }}
            >
              {k}
            </div>
          );
        })}
      </div>
    </div>
  );
};

/** Paso a paso para subir una pieza: botón de cámara, cámara, y la foto que se acomoda sola. */
export const SubirPieza: React.FC<{ camaraEn: number; disparoEn: number; listoEn: number; aceptaEn: number }> = ({ camaraEn, disparoEn, listoEn, aceptaEn }) => {
  const f = useCurrentFrame();
  const enCamara = f >= camaraEn + 4 && f < disparoEn + 8;
  const procesando = f >= disparoEn + 8;
  const barrido = t(f, disparoEn + 20, listoEn, 0, 1, suave);
  const flash = t(f, disparoEn, disparoEn + 3) * (1 - t(f, disparoEn + 4, disparoEn + 14));
  return (
    <div style={{ position: "absolute", inset: 0, background: C.papel }}>
      {!enCamara && !procesando && (
        <div style={{ padding: "28px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.rojoOscuro, letterSpacing: "0.04em" }}>PASO 1 DE 3</div>
          <div style={{ marginTop: 6, color: C.rojo, fontSize: 34, textTransform: "uppercase", lineHeight: 1.02, fontWeight: 500 }}>
            Sacale una foto
            <br />a la pieza
          </div>
          <div style={{ marginTop: 14, fontSize: 18, lineHeight: 1.45 }}>
            No te preocupes por el fondo ni por el encuadre: <b>yo la acomodo.</b>
          </div>
          <div
            style={{
              marginTop: 30,
              height: 96,
              borderRadius: 28,
              background: f >= camaraEn ? C.rojoOscuro : C.rojo,
              color: "white",
              fontWeight: 700,
              fontSize: 22,
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
              gap: 12,
              transform: `scale(${presion(f, camaraEn)})`,
            }}
          >
            <Camara tam={28} color="white" /> Abrir la cámara
          </div>
          <div style={{ marginTop: 14, height: 64, borderRadius: 999, border: `2px solid ${C.rojo}`, color: C.rojo, fontWeight: 700, display: "grid", placeItems: "center" }}>
            Elegir una foto que ya tengo
          </div>
        </div>
      )}
      {enCamara && (
        <div style={{ position: "absolute", inset: 0, background: "#111" }}>
          <div style={{ position: "absolute", left: 0, right: 0, top: 90, height: 520, overflow: "hidden" }}>
            <Foto src="foto-antes.webp" style={{ transform: `scale(${1.25 - 0.07 * t(f, camaraEn, disparoEn)}) translate(${Math.sin(f / 9) * 4}px, ${Math.cos(f / 11) * 3}px)` }} />
          </div>
          <div style={{ position: "absolute", left: 0, right: 0, bottom: 56, display: "flex", justifyContent: "center" }}>
            <div style={{ width: 78, height: 78, borderRadius: 99, border: "5px solid white", display: "grid", placeItems: "center" }}>
              <div style={{ width: 60, height: 60, borderRadius: 99, background: "white", transform: `scale(${presion(f, disparoEn)})` }} />
            </div>
          </div>
        </div>
      )}
      {procesando && (
        <div style={{ padding: "28px 24px" }}>
          <div style={{ fontSize: 15, fontWeight: 700, color: C.rojoOscuro, letterSpacing: "0.04em" }}>PASO 2 DE 3</div>
          <div style={{ marginTop: 6, color: C.rojo, fontSize: 34, textTransform: "uppercase", lineHeight: 1.02, fontWeight: 500, height: 70 }}>
            {f < listoEn ? (
              <>
                Acomodando
                <br />
                tu foto…
              </>
            ) : (
              <>
                ¡Quedó
                <br />
                lindísima!
              </>
            )}
          </div>
          <div style={{ marginTop: 18, width: 344, height: 344, borderRadius: 26, overflow: "hidden", position: "relative", background: C.crema2 }}>
            <Foto src="foto-antes.webp" />
            <div style={{ position: "absolute", inset: 0, clipPath: `inset(0 0 ${(1 - barrido) * 100}% 0)` }}>
              <Foto src="foto-despues.webp" />
            </div>
            {barrido > 0 && barrido < 1 && (
              <div style={{ position: "absolute", left: 0, right: 0, top: `${barrido * 100}%`, height: 4, marginTop: -2, background: "white", boxShadow: `0 0 18px 6px rgba(255,255,255,.85), 0 0 40px 10px ${C.rosa}` }} />
            )}
          </div>
          {f >= listoEn && (
            <div style={{ opacity: t(f, listoEn, listoEn + 12), transform: `translateY(${(1 - t(f, listoEn, listoEn + 16)) * 14}px)` }}>
              <div
                style={{
                  marginTop: 18,
                  height: 60,
                  borderRadius: 999,
                  background: f >= aceptaEn ? C.rojoOscuro : C.rojo,
                  color: "white",
                  fontWeight: 700,
                  fontSize: 19,
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  gap: 8,
                  transform: `scale(${presion(f, aceptaEn)})`,
                }}
              >
                <Tilde color="white" progreso={t(f, aceptaEn, aceptaEn + 10)} /> Así está bien
              </div>
              <div style={{ marginTop: 10, height: 52, borderRadius: 999, border: `2px solid ${C.rojo}`, color: C.rojo, fontWeight: 700, display: "grid", placeItems: "center", fontSize: 16 }}>
                Dejar mi foto como la saqué
              </div>
            </div>
          )}
        </div>
      )}
      <div style={{ position: "absolute", inset: 0, background: "white", opacity: flash, pointerEvents: "none" }} />
    </div>
  );
};

/** "Mis piezas": cambiar un precio y marcar una vendida. */
export const MisPiezas: React.FC<{ precioEn: number; guardaEn: number; vendidaEn: number }> = ({ precioEn, guardaEn, vendidaEn }) => {
  const f = useCurrentFrame();
  const editando = f >= precioEn + 2 && f < guardaEn + 2;
  // El precio nuevo se escribe tecla por tecla
  const nuevo = "10500";
  const escritas = Math.max(0, Math.min(nuevo.length, Math.floor((f - precioEn - 14) / 4)));
  const borrado = f >= precioEn + 10;
  const valor = borrado ? nuevo.slice(0, escritas) : "9500";
  const formato = (v: string) => (v ? "$ " + new Intl.NumberFormat("es-AR").format(Number(v)) : "$ ");
  const guardado = f >= guardaEn;
  const vendida = f >= vendidaEn;
  const toast = t(f, guardaEn + 2, guardaEn + 14) * (1 - t(f, guardaEn + 42, guardaEn + 54, 0, 1, entrada));

  const filas = [
    { n: 1, nombre: "Taza Moñitos", precio: guardado ? "$ 10.500" : "$ 9.500" },
    { n: 5, nombre: "Taza Nube", precio: "$ 12.000" },
    { n: 6, nombre: "Taza Solcito", precio: "$ 10.500" },
  ];
  return (
    <div style={{ position: "absolute", inset: 0, background: C.crema, padding: "26px 16px" }}>
      <div style={{ padding: "0 8px", color: C.rojo, fontSize: 34, textTransform: "uppercase", fontWeight: 500, lineHeight: 1 }}>Mis piezas</div>
      <div style={{ marginTop: 18, display: "flex", flexDirection: "column", gap: 12 }}>
        {filas.map((p, i) => {
          const sinStock = i === 1 && vendida;
          return (
            <div key={p.n} style={{ background: C.papel, borderRadius: 22, padding: 14, boxShadow: "0 1px 2px rgba(42,33,29,.08)" }}>
              <div style={{ display: "flex", gap: 14, alignItems: "center" }}>
                <div style={{ width: 86, height: 86, borderRadius: 16, overflow: "hidden", flexShrink: 0, opacity: sinStock ? 0.45 : 1, filter: sinStock ? "grayscale(1)" : undefined }}>
                  <Foto src={`taza-${p.n}.webp`} />
                </div>
                <div style={{ flex: 1 }}>
                  <div style={{ fontWeight: 700, fontSize: 19 }}>{p.nombre}</div>
                  <div style={{ color: C.rojo, fontWeight: 700, fontSize: 19, transform: `scale(${i === 0 && guardado ? 0.9 + 0.1 * rebote(f, guardaEn, 8) : 1})`, transformOrigin: "0 50%" }}>{p.precio}</div>
                  <div
                    style={{
                      marginTop: 4,
                      display: "inline-block",
                      fontSize: 13.5,
                      fontWeight: 700,
                      borderRadius: 999,
                      padding: "3px 10px",
                      background: sinStock ? C.tinta : "#e3efe2",
                      color: sinStock ? "white" : C.verde,
                      transform: `scale(${sinStock ? 0.85 + 0.15 * rebote(f, vendidaEn, 9) : 1})`,
                    }}
                  >
                    {sinStock ? "Sin stock" : "A la venta"}
                  </div>
                </div>
              </div>
              {i === 0 && editando ? (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, height: 52, borderRadius: 14, border: `2.5px solid ${C.rojo}`, display: "flex", alignItems: "center", padding: "0 14px", fontSize: 22, fontWeight: 700, boxShadow: `0 0 0 4px ${C.rosa}` }}>
                    {formato(valor)}
                    <span style={{ width: 2, height: 26, background: C.rojo, marginLeft: 2, opacity: Math.floor(f / 8) % 2 ? 1 : 0.2 }} />
                  </div>
                  <div style={{ width: 112, height: 52, borderRadius: 999, background: C.rojo, color: "white", fontWeight: 700, display: "grid", placeItems: "center", transform: `scale(${presion(f, guardaEn)})` }}>
                    Guardar
                  </div>
                </div>
              ) : (
                <div style={{ marginTop: 12, display: "flex", gap: 8 }}>
                  <div style={{ flex: 1, height: 48, borderRadius: 999, border: `2px solid ${C.rojo}`, color: C.rojo, fontWeight: 700, display: "grid", placeItems: "center", fontSize: 16, transform: `scale(${i === 0 ? presion(f, precioEn) : 1})` }}>
                    Cambiar precio
                  </div>
                  <div
                    style={{
                      flex: 1,
                      height: 48,
                      borderRadius: 999,
                      border: `2px solid ${C.rojo}`,
                      background: sinStock ? C.rojo : "transparent",
                      color: sinStock ? "white" : C.rojo,
                      fontWeight: 700,
                      display: "grid",
                      placeItems: "center",
                      fontSize: 16,
                      transform: `scale(${i === 1 ? presion(f, vendidaEn) : 1})`,
                    }}
                  >
                    {sinStock ? "Volver a vender" : "Se vendió"}
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>
      <div
        style={{
          position: "absolute",
          left: "50%",
          bottom: 30,
          transform: `translate(-50%, ${(1 - toast) * 30}px)`,
          opacity: toast,
          background: C.verde,
          color: "white",
          fontWeight: 700,
          borderRadius: 999,
          padding: "12px 22px",
          display: "flex",
          gap: 8,
          alignItems: "center",
          whiteSpace: "nowrap",
        }}
      >
        <Tilde color="white" tam={20} /> Precio guardado
      </div>
    </div>
  );
};

/** Pantalla bloqueada con el aviso que le llega a Norma. */
export const Aviso: React.FC<{ llegaEn: number }> = ({ llegaEn }) => {
  const f = useCurrentFrame();
  const s = rebote(f, llegaEn, 13);
  return (
    <div style={{ position: "absolute", inset: 0, background: C.tinta }}>
      <Foto src="torno.webp" style={{ opacity: 0.55, filter: "blur(6px)", transform: "scale(1.15)" }} />
      <div style={{ position: "absolute", inset: 0, background: "linear-gradient(180deg, rgba(42,33,29,.35), rgba(42,33,29,.1) 60%, rgba(42,33,29,.5))" }} />
      <div style={{ position: "absolute", top: 70, left: 0, right: 0, textAlign: "center", color: "white" }}>
        <div style={{ fontSize: 17, fontWeight: 500, opacity: 0.9 }}>martes 17 de noviembre</div>
        <div style={{ fontSize: 86, fontWeight: 300, lineHeight: 1, letterSpacing: "-0.03em" }}>10:00</div>
      </div>
      <div
        style={{
          position: "absolute",
          left: 12,
          right: 12,
          top: 250,
          background: "rgba(255,253,249,.94)",
          borderRadius: 24,
          padding: "14px 16px",
          display: "flex",
          gap: 12,
          boxShadow: "0 18px 40px -12px rgba(0,0,0,.5)",
          transform: `translateY(${(1 - s) * -170}px) scale(${0.92 + 0.08 * s})`,
          opacity: Math.min(s * 2, 1),
        }}
      >
        <svg width="42" height="42" viewBox="0 0 512 512" style={{ flexShrink: 0 }}>
          <rect width="512" height="512" rx="112" fill={C.rojo} />
          <g transform="translate(256 262) rotate(-12) scale(3.05) translate(-50 -52)">
            <path d="M47 90 C 30 80, 9 62, 8 38 C 7 20, 20 9, 33 11 C 43 12, 49 21, 52 30 C 57 18, 66 10, 78 11 C 91 12, 97 25, 93 41 C 88 62, 66 80, 47 90 Z" fill={C.crema} />
          </g>
        </svg>
        <div style={{ flex: 1 }}>
          <div style={{ display: "flex", justifyContent: "space-between", fontSize: 13, color: "#6b625c" }}>
            <span style={{ fontWeight: 700, letterSpacing: "0.03em" }}>ATELIER DE NORMA</span>
            <span>ahora</span>
          </div>
          <div style={{ fontWeight: 700, fontSize: 17, marginTop: 2 }}>¿Sigue todo igual en el taller?</div>
          <div style={{ fontSize: 15, opacity: 0.8 }}>Tocá para ver tus piezas.</div>
        </div>
      </div>
    </div>
  );
};
