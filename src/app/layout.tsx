import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

// Importamos los componentes globales
import Navigation from "@/components/Navigation";
import Footer from "@/components/Footer";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VDL MOTORS | Transforma tu camino",
  description: "Compra y venta de vehículos usados. Simplicidad y confianza.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased bg-white text-black`}
      >
        {/* Navigation se renderiza sobre el contenido en todas las rutas.
            Al tener 'sticky top-0' en su interior, funcionará globalmente.
        */}
        <Navigation />

        {/* El contenido de cada página (page.tsx) se inyecta aquí */}
        {children}

        {/* Footer se renderiza al final de todas las rutas */}
        <Footer />
      </body>
    </html>
  );
}