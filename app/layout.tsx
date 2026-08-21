import Script from 'next/script';

export const metadata = {
  title: 'Cotizador IA - Cotium',
  description: 'Generador oficial de cotizaciones',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <head>
        <Script src="https://cdn.tailwindcss.com" strategy="beforeInteractive" />
      </head>
      <body className="bg-slate-100 text-slate-800 antialiased font-sans">
        {children}
      </body>
    </html>
  );
}