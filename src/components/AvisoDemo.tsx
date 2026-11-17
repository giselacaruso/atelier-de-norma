import { modoDemo } from "@/config";

const RENGLONES = ["Es una demo.", "Elegí a quién mandárselo", "(podés mandártelo a vos)."];

/**
 * En modo demo, WhatsApp se abre sin número: la persona ve el pedido armado
 * y elige a quién mandárselo. Los renglones se cortan a mano para que no queden viudas.
 */
export function AvisoDemo({ className = "" }: { className?: string }) {
  if (!modoDemo) return null;
  return (
    <p className={`text-[0.95rem] leading-snug opacity-85 ${className}`}>
      {RENGLONES.map((r) => (
        <span key={r} className="block whitespace-nowrap">
          {r}
        </span>
      ))}
    </p>
  );
}
