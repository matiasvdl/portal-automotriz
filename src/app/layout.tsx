import { client } from '@/sanity/lib/client'
import "./globals.css";
import { AuthProvider } from "@/components/AuthProvider";
import { SettingsProvider } from "@/context/SettingsContext";
import { urlFor } from '@/sanity/lib/image'; // Importante para las imágenes

// --- 1. CONFIGURACIÓN SEO, FAVICON Y DOMINIO DINÁMICO ---
export async function generateMetadata() {
  // Pedimos todo lo necesario a Sanity en una sola consulta
  const data = await client.fetch(`*[_type == "siteConfig"][0]{ 
    siteName, 
    siteUrl,
    seoDescriptions,
    "logo": *[_type == "appearance"][0].logo 
  }`, {}, { next: { revalidate: 0 } })

  const name = data?.siteName || ''
  const description = data?.seoDescriptions?.home || 'Compra y venta de vehículos seleccionados.'

  // Lógica de URL: Si no hay dominio en Sanity, usa localhost
  const rawUrl = data?.siteUrl || 'localhost:3000'
  const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`

  // Generamos las versiones del logo para Icono y Redes Sociales
  const logoUrl = data?.logo ? urlFor(data.logo).width(1200).url() : '/favicon.ico'
  const iconUrl = data?.logo ? urlFor(data.logo).width(32).height(32).url() : '/favicon.ico'

  return {
    // Esto quita el dominio "en duro" y usa el de Sanity
    metadataBase: new URL(baseUrl),

    title: {
      default: name,
      template: `%s | ${name}`
    },
    description: description,

    // Iconos dinámicos (Favicon)
    icons: {
      icon: iconUrl,
      apple: iconUrl,
    },

    // Previsualización en WhatsApp / RRSS
    openGraph: {
      title: name,
      description: description,
      siteName: name,
      images: [
        {
          url: logoUrl,
          width: 1200,
          height: 630,
          alt: `Logo de ${name}`,
        },
      ],
      locale: 'es_CL',
      type: 'website',
    },
  }
}

// --- 2. DISEÑO GLOBAL ---
export default async function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [config, appearance, contact] = await Promise.all([
    client.fetch(`*[_type == "siteConfig"][0]`, {}, { cache: 'no-store' }),
    client.fetch(`*[_id == "appearance-settings"][0]{
      brandName,
      logo,
      favicon,
      logoWidth,
      splitText,
      isJoined,
      primaryColor,
      minDepositPercent,
      minIncome,
      minWorkExperience,
      hero {
        title,
        subtitle,
        image,
        position
      }
    }`, {}, { cache: 'no-store' }),
    client.fetch(
      `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`,
      {},
      { cache: 'no-store' }
    )
  ])

  const configCompleta = { ...(config || {}), ...(contact || {}) }

  return (
    <html lang="es">
      <body className="antialiased min-h-screen flex flex-col">
        <SettingsProvider config={configCompleta} appearance={appearance || {}}>
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
