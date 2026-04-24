import { client } from '@/sanity/lib/client'
import SucursalesClient from '@/components/SucursalesClient'

export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions }`)

    return {
        title: 'Sucursales',
        description: config?.seoDescriptions?.sucursales || 'Conoce nuestras sucursales, horarios y ubicaciÃ³n.',
        openGraph: {
            title: `Sucursales`,
        },
    }
}

export default async function Page() {
    return <SucursalesClient />
}
