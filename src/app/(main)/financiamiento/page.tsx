import { client } from '@/sanity/lib/client'
import FinanciamientoClient from '@/components/FinanciamientoClient'

// PASO B: SEO DINÃMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'Financiamiento',
        description: config?.seoDescriptions?.financiamiento || 'Solicita tu evaluaciÃ³n de crÃ©dito automotriz de forma 100% digital.',
        openGraph: {
            title: `Financiamiento`,
        }
    }
}

export default function Page() {
    return <FinanciamientoClient />
}