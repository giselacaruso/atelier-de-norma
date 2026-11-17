import type { Metadata } from "next";

// El panel se instala como "app" en la pantalla de inicio del celular de Norma.
export const metadata: Metadata = {
  title: "Mi taller",
  manifest: "/taller.webmanifest",
  appleWebApp: { capable: true, title: "Mi taller", statusBarStyle: "default" },
  icons: { apple: "/icono-192.png" },
  robots: { index: false },
};

export default function LayoutTaller({ children }: { children: React.ReactNode }) {
  return <div className="mx-auto max-w-2xl px-5 pb-24 pt-8">{children}</div>;
}
