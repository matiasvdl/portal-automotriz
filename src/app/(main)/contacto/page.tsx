import { client } from '@/sanity/lib/client'
import ContactoClient from '@/components/ContactoClient'

// PASO B: SEO DINÁMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ seoDescriptions }`)

    return {
        title: 'Contacto',
        description: config?.seoDescriptions?.contacto || 'Ponte en contacto con nuestro equipo de ventas.'
    }
}

export default function Page() {
    return <ContactoClient />
}