import { notFound } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import SucursalesClient from '@/components/SucursalesClient'

export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ siteName, seoDescriptions, branchesPageEnabled }`)

    if (!config?.branchesPageEnabled) {
        return {}
    }

    return {
        title: 'Sucursales',
        description: config?.seoDescriptions?.sucursales || 'Conoce nuestras sucursales, horarios y ubicación.',
        openGraph: {
            title: `Sucursales | ${config?.siteName || ''}`,
        },
    }
}

export default async function Page() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ branchesPageEnabled }`, {}, { cache: 'no-store' })

    if (!config?.branchesPageEnabled) {
        notFound()
    }

    return <SucursalesClient />
}
