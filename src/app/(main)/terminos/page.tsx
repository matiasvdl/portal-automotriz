import { client } from '@/sanity/lib/client'
import TerminosClient from '@/components/TerminosClient'

// PASO B: SEO DINÃMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'TÃ©rminos y Condiciones',
        description: config?.seoDescriptions?.terminos || 'Conoce los tÃ©rminos y condiciones de uso de nuestra plataforma y servicios.',
        openGraph: {
            title: `TÃ©rminos y Condiciones`,
        }
    }
}

export default function Page() {
    return <TerminosClient />
}