import { client } from '@/sanity/lib/client'
import FinanciamientoClient from '@/components/FinanciamientoClient'

// PASO B: SEO DINÁMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'Financiamiento',
        description: config?.seoDescriptions?.financiamiento || 'Solicita tu evaluación de crédito automotriz de forma 100% digital.',
        openGraph: {
            title: `Financiamiento`,
        }
    }
}

export default function Page() {
    return <FinanciamientoClient />
}