import { client } from '@/sanity/lib/client'
import './globals.css'
import { AuthProvider } from '@/components/AuthProvider'
import { SettingsProvider } from '@/context/SettingsContext'
import { urlFor } from '@/sanity/lib/image'
import { resolveAccessibilityScale } from '@/lib/content-defaults'

export async function generateMetadata() {
    const data = await client.fetch(`*[_type == "siteConfig"][0]{
        siteName,
        siteUrl,
        seoDescriptions,
        "logo": *[_type == "appearance"][0].logo
    }`, {}, { next: { revalidate: 0 } })

    const name = data?.siteName || ''
    const description = data?.seoDescriptions?.home || 'Compra y venta de vehículos seleccionados.'
    const rawUrl = data?.siteUrl || 'localhost:3000'
    const baseUrl = rawUrl.startsWith('http') ? rawUrl : `https://${rawUrl}`
    const logoUrl = data?.logo ? urlFor(data.logo).width(1200).url() : '/favicon.ico'
    const iconUrl = data?.logo ? urlFor(data.logo).width(32).height(32).url() : '/favicon.ico'

    return {
        metadataBase: new URL(baseUrl),
        title: {
            default: name,
            template: `%s | ${name}`,
        },
        description,
        icons: {
            icon: iconUrl,
            apple: iconUrl,
        },
        openGraph: {
            title: name,
            description,
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

export default async function RootLayout({
    children,
}: {
    children: React.ReactNode
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
            accessibilityScale,
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
        ),
    ])

    const configCompleta = { ...(config || {}), ...(contact || {}) }
    const accessibilityScale = resolveAccessibilityScale(appearance?.accessibilityScale)

    return (
        <html lang="es" style={{ fontSize: `${accessibilityScale * 100}%` }}>
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
    )
}
