import { client } from '@/sanity/lib/client'
import CarDetailClient from '@/components/CarDetailClient'

// PASO B: SEO DINÁMICO PARA CADA AUTO
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    const query = `*[_type == "car" && slug.current == $slug][0] {
        make, model, year, "siteName": *[_type == "siteConfig"][0].siteName
    }`
    const data = await client.fetch(query, { slug })

    if (!data) return { title: 'Auto no encontrado' }

    const title = `${data.make} ${data.model} ${data.year}`
    const site = data.siteName || ''

    return {
        title: title,
        description: `Conoce el precio, ficha técnica y detalles del ${title}. Disponible ahora.`,
        openGraph: {
            title: `${title} | ${site}`,
        }
    }
}

export default function Page({ params }: { params: Promise<{ slug: string }> }) {
    return <CarDetailClient params={params} />
}