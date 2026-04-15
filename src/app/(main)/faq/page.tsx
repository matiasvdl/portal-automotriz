import { client } from '@/sanity/lib/client'
import FAQClient from '@/components/FAQClient'

// SEO DINÁMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ seoDescriptions }`)

    return {
        title: 'Preguntas Frecuentes',
        description: config?.seoDescriptions?.faq || 'Respuestas a tus dudas sobre compra, venta y financiamiento.'
    }
}

export default function Page() {
    return <FAQClient />
}