import type { Metadata, Viewport } from "next";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { tienda } from "@/config";

import { sitio } from "@/lib/sitio";

export const generateMetadata = async (): Promise<Metadata> => ({
  metadataBase: new URL(await sitio()),
  title: tienda.nombre,
  description: `${tienda.frase} Piezas únicas de cerámica del taller de Norma.`,
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
