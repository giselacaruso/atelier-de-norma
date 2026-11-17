import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { tienda } from "@/config";

import { sitio } from "@/lib/sitio";

const descripcion = `${tienda.frase} Piezas únicas de cerámica del taller de Norma.`;
// Portada para compartir en redes y WhatsApp: el logo y las 4 Polaroids del hero (public/og.png).
const portada = { url: "/og.png", width: 1200, height: 630, alt: "Atelier de Norma: el logo y cuatro fotos del taller de Norma." };

export const generateMetadata = async (): Promise<Metadata> => ({
  metadataBase: new URL(await sitio()),
  title: tienda.nombre,
  description: descripcion,
  openGraph: { title: tienda.nombre, description: descripcion, images: [portada], type: "website", locale: "es_AR" },
  twitter: { card: "summary_large_image", title: tienda.nombre, description: descripcion, images: [portada.url] },
});

export const viewport: Viewport = {
  themeColor: "#fffdf9",
};

// Recupera la preferencia de "letra más grande" antes de pintar la página.
const letra = `try{if(localStorage.getItem('letra')==='grande')document.documentElement.dataset.letra='grande'}catch(e){}`;

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-AR">
      <head>
        <script dangerouslySetInnerHTML={{ __html: letra }} />
      </head>
      <body className="min-h-screen antialiased">
        {children}
        {/* Métricas de Vercel: visitas y páginas vistas, sin cookies */}
        <Analytics />
      </body>
    </html>
  );
}
