import type { Metadata } from "next";
import "@/styles/globals.css";
import { Shell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "CONECTA 360 · Portal de empresas",
  description: "Portal de la Superintendencia de Sociedades para que cada sociedad gestione documentos y solicitudes.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="es-CO">
      <body>
        <Shell>{children}</Shell>
      </body>
    </html>
  );
}
