/** Logo manuscrito. Toma el color del texto y el tamaño de la letra (alto = 1.5em). */
export function Logo({ className = "" }: { className?: string }) {
  return <span role="img" aria-label="Atelier de Norma" className={`logo ${className}`} />;
}

/**
 * Carita de Norma: pelo canoso recogido con su colita roja (como en las fotos del taller),
 * ojos sonrientes y cachetes colorados, sobre el círculo rojo de la marca.
 * Se usa en el bot de WhatsApp y en el taller.
 */
export function CaraNorma({ className = "" }: { className?: string }) {
  return (
    <svg viewBox="0 0 120 120" className={className} aria-hidden="true">
      <circle cx="60" cy="60" r="60" fill="#b8321c" />
      {/* rodete con colita */}
      <circle cx="60" cy="27" r="15" fill="#e4e0db" />
      <path d="M48 23c4-6 18-7 24 0" stroke="#bdb6ae" strokeWidth="2.5" fill="none" strokeLinecap="round" />
      <path d="M45 34c5 3 25 3 30 0" stroke="#f2b8a8" strokeWidth="6" strokeLinecap="round" />
      {/* pelo de atrás */}
      <ellipse cx="60" cy="62" rx="33" ry="31" fill="#e4e0db" />
      {/* cara */}
      <ellipse cx="60" cy="68" rx="25" ry="26" fill="#f4d2b8" />
      {/* flequillo hacia atrás */}
      <path d="M34 60c2-16 14-22 26-22s24 6 26 22c-6-9-15-12-26-12s-20 3-26 12Z" fill="#e4e0db" />
      <path d="M44 47c6-4 12-5 16-5" stroke="#bdb6ae" strokeWidth="2" fill="none" strokeLinecap="round" />
      {/* ojos sonrientes */}
      <path d="M46 67q5-5 10 0M64 67q5-5 10 0" stroke="#2a211d" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* cachetes */}
      <circle cx="44" cy="77" r="5" fill="#ec8f7b" opacity=".7" />
      <circle cx="76" cy="77" r="5" fill="#ec8f7b" opacity=".7" />
      {/* sonrisa */}
      <path d="M52 80q8 8 16 0" stroke="#2a211d" strokeWidth="3" fill="none" strokeLinecap="round" />
      {/* delantal */}
      <path d="M30 120c2-14 14-22 30-22s28 8 30 22Z" fill="#fffdf9" />
      <path d="M48 100l-4 20M72 100l4 20" stroke="#e2d5bf" strokeWidth="3" />
    </svg>
  );
}
