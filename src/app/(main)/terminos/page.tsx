import { client } from '@/sanity/lib/client'
import TerminosClient from '@/components/TerminosClient'

// PASO B: SEO DINÁMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'Términos y Condiciones',
        description: config?.seoDescriptions?.terminos || 'Conoce los términos y condiciones de uso de nuestra plataforma y servicios.',
        openGraph: {
            title: `Términos y Condiciones`,
        }
    }
}

export default function Page() {
    return <TerminosClient />
}