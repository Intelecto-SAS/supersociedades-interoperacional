import type { Metadata } from "next";
import "@/styles/globals.css";
import { Shell } from "@/components/layout/shell";

export const metadata: Metadata = {
  title: "CONECTA 360 · Prototipo de interoperabilidad",
  description: "Laboratorio demostrativo con datos empresariales ficticios. No es una plataforma oficial.",
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
