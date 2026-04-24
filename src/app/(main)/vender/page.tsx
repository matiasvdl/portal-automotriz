import { client } from '@/sanity/lib/client'
import VenderClient from '@/components/VenderClient'

// PASO B: SEO DINÃMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'Vende tu Auto',
        description: config?.seoDescriptions?.vender || 'TasaciÃ³n inmediata y segura. Vende tu vehÃ­culo hoy mismo al mejor precio del mercado.',
        openGraph: {
            title: `Vende tu Auto`,
        }
    }
}

export default function Page() {
    return <VenderClient />
}