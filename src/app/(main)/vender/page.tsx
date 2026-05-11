import { client } from '@/sanity/lib/client'
import VenderClient from '@/components/VenderClient'

// PASO B: SEO DINÁMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'Vende tu Auto',
        description: config?.seoDescriptions?.vender || 'Tasación inmediata y segura. Vende tu vehículo hoy mismo al mejor precio del mercado.',
        openGraph: {
            title: `Vende tu Auto`,
        }
    }
}

export default function Page() {
    return <VenderClient />
}