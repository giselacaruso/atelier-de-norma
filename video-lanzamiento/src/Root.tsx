import React from "react";
import { Audio, Composition, staticFile } from "remotion";
import { TransitionSeries, linearTiming } from "@remotion/transitions";
import { fade } from "@remotion/transitions/fade";
import { slide } from "@remotion/transitions/slide";
import { wipe } from "@remotion/transitions/wipe";
import { FPS, suave } from "./comun";
import { AccesoEscena, CierreAcceso, CierreOlvido, IntroOlvido, LlamadaEscena } from "./escenas2";
import TI from "./tiempos.json";
import { Avisos, Cierre, Chat, Comprar, EntrarTaller, Marca, OtroLado, Pensado, Precios, Presentacion, SinVueltas, Subir, TresPasos } from "./escenas";

const T = 16; // cuadros de cada transición
const tiempo = linearTiming({ durationInFrames: T, easing: suave });

const ESCENAS: { c: React.FC; d: number; trans?: "fade" | "arriba" | "izq" | "wipe" }[] = [
  { c: Presentacion, d: 150 },
  { c: Marca, d: 105, trans: "wipe" },
  { c: SinVueltas, d: 125, trans: "arriba" },
  { c: Comprar, d: 305, trans: "arriba" },
  { c: TresPasos, d: 125, trans: "izq" },
  { c: Chat, d: 175, trans: "izq" },
  { c: OtroLado, d: 85, trans: "wipe" },
  { c: EntrarTaller, d: 120, trans: "arriba" },
  { c: Subir, d: 205, trans: "izq" },
  { c: Precios, d: 190, trans: "izq" },
  { c: Avisos, d: 120, trans: "izq" },
  { c: Pensado, d: 120, trans: "arriba" },
  { c: Cierre, d: 165, trans: "wipe" },
];

export const DURACION = ESCENAS.reduce((s, e) => s + e.d, 0) - (ESCENAS.length - 1) * T;

const presentacion = (x?: string) => {
  if (x === "arriba") return slide({ direction: "from-bottom" });
  if (x === "izq") return slide({ direction: "from-right" });
  if (x === "wipe") return wipe({ direction: "from-left" });
  return fade();
};

export const Lanzamiento: React.FC = () => (
  <>
  <Audio src={staticFile("musica-lanzamiento.wav")} />
  <TransitionSeries>
    {ESCENAS.map((e, i) => (
      <React.Fragment key={i}>
        {i > 0 && <TransitionSeries.Transition presentation={presentacion(e.trans)} timing={tiempo} />}
        <TransitionSeries.Sequence durationInFrames={e.d}>
          <e.c />
        </TransitionSeries.Sequence>
      </React.Fragment>
    ))}
  </TransitionSeries>
  </>
);

/* Videos cortos para el hilo: escenas en fila con la misma transición. */
type Escena = { c: React.FC; d: number; trans?: "fade" | "arriba" | "izq" | "wipe" };
const duracion = (es: Escena[]) => es.reduce((s, e) => s + e.d, 0) - (es.length - 1) * T;
const Serie: React.FC<{ escenas: Escena[]; musica: string }> = ({ escenas, musica }) => (
  <>
    <Audio src={staticFile(musica)} />
    <TransitionSeries>
      {escenas.map((e, i) => (
        <React.Fragment key={i}>
          {i > 0 && <TransitionSeries.Transition presentation={presentacion(e.trans)} timing={tiempo} />}
          <TransitionSeries.Sequence durationInFrames={e.d}>
            <e.c />
          </TransitionSeries.Sequence>
        </React.Fragment>
      ))}
    </TransitionSeries>
  </>
);

const OLVIDO: Escena[] = [
  { c: IntroOlvido, d: TI.olvido.escenas.intro },
  { c: LlamadaEscena, d: TI.olvido.escenas.llamada, trans: "arriba" },
  { c: CierreOlvido, d: TI.olvido.escenas.cierre, trans: "wipe" },
];
const ACCESO: Escena[] = [
  { c: AccesoEscena, d: TI.acceso.escenas.telefono },
  { c: CierreAcceso, d: TI.acceso.escenas.cierre, trans: "wipe" },
];
const OlvidoClave: React.FC = () => <Serie escenas={OLVIDO} musica="musica-olvido.wav" />;
const AccesoDirecto: React.FC = () => <Serie escenas={ACCESO} musica="musica-acceso.wav" />;

export const RemotionRoot: React.FC = () => (
  <>
    <Composition id="Lanzamiento" component={Lanzamiento} durationInFrames={DURACION} fps={FPS} width={1080} height={1920} />
    <Composition id="OlvidoClave" component={OlvidoClave} durationInFrames={duracion(OLVIDO)} fps={FPS} width={1080} height={1920} />
    <Composition id="AccesoDirecto" component={AccesoDirecto} durationInFrames={duracion(ACCESO)} fps={FPS} width={1080} height={1920} />
  </>
);
