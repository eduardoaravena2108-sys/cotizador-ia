import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Cotizador IA",
  description: "Generador de cotizaciones con Inteligencia Artificial",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body>{children}</body>
    </html>
  );
}