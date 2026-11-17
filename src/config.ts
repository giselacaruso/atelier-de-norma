// Datos de la tienda. Esto se completa una sola vez.
export const tienda = {
  nombre: "Atelier de Norma",
  frase: "Comprá fácil y rápido mis artesanías.",
  // Número de WhatsApp de Norma, con código de país y sin "+" ni espacios.
  // Vacío = modo demo: WhatsApp se abre con el mensaje escrito y cada uno elige a quién mandárselo.
  whatsapp: "",
  // Para pagar por transferencia
  alias: "atelier.norma",
  titular: "Norma (cuenta de prueba)",
  // Link de pago de Mercado Pago (opcional). Si está vacío, no se muestra.
  mercadoPago: "",
  retiro: "Retirás por el taller o lo coordinamos por WhatsApp.",
};

/** Sin número cargado, la tienda está en modo demo. */
export const modoDemo = !tienda.whatsapp;

export function linkWhatsApp(texto: string) {
  return `https://wa.me/${tienda.whatsapp}?text=${encodeURIComponent(texto)}`;
}

/**
 * Comprar = escribirle a Norma. El mensaje lleva nombre, precio y el link a la taza:
 * WhatsApp arma solo la vista previa con la foto (cuando el sitio está publicado).
 */
export function linkCompra(pieza: { id: string; nombre: string; precio: number }, sitio: string) {
  return linkWhatsApp(
    `¡Hola Norma! Quiero comprar la ${pieza.nombre} (${formatoPrecio(pieza.precio)}).\n${sitio}/pieza/${pieza.id}`,
  );
}

export function formatoPrecio(precio: number) {
  return "$ " + new Intl.NumberFormat("es-AR").format(precio);
}
