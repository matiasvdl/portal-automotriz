import { client } from '@/sanity/lib/client'
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SettingsProvider } from "@/context/SettingsContext";

// --- 1. ESTA FUNCIÓN CONFIGURA EL SEO AUTOMÁTICO ---
export async function generateMetadata() {
  // Vamos a Sanity a buscar el nombre y la descripción
  const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, footerDescription }`)

  // Si no hay nada en Sanity, usamos "Portal Automotriz" como plan B
  const name = config?.siteName || 'Portal Automotriz'
  const description = config?.footerDescription || 'Compra y venta de vehículos'

  return {
    title: {
      default: name,
      template: `%s | ${name}` // Si estás en un auto dirá: "Jeep Wrangler | VDL MOTORS"
    },
    description: description,
  }
}

// --- 2. ESTE ES TU DISEÑO GLOBAL ---
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        <SettingsProvider>
          <AuthProvider>
            <main className="flex-grow flex flex-col">
              {children}
            </main>
          </AuthProvider>
        </SettingsProvider>
      </body>
    </html>
  );
}