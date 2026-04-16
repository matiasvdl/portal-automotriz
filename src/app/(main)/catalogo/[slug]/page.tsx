import { client } from '@/sanity/lib/client'
import CarCatalogDetailClient from '@/components/CarCatalogDetailClient'
import { notFound } from 'next/navigation' // Importamos para bloquear el acceso

// PASO B: SEO DINÁMICO DESDE SANITY
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Agregamos el status a la consulta
    const query = `*[_type == "car" && slug.current == $slug][0] {
        make, model, year, status, "siteName": *[_type == "siteConfig"][0].siteName
    }`
    const data = await client.fetch(query, { slug })

    // Si el auto no existe O está oculto (status === false), no generamos SEO
    if (!data || data.status === false) return { title: 'Auto no encontrado' }

    const title = `${data.make} ${data.model} ${data.year}`
    const site = data.siteName || ''

    return {
        title: title,
        description: `Conoce el precio, ficha técnica y detalles del ${title}. Disponible ahora para entrega inmediata.`,
        openGraph: {
            title: `${title} | ${site}`,
        }
    }
}

export default async function Page({ params }: { params: Promise<{ slug: string }> }) {
    const { slug } = await params;

    // Verificamos si el auto debe ser visible antes de cargar el componente cliente
    const carStatus = await client.fetch(
        `*[_type == "car" && slug.current == $slug][0].status`,
        { slug }
    )

    // Si el auto está marcado como oculto explícitamente, bloqueamos el acceso
    if (carStatus === false) {
        notFound();
    }

    return <CarCatalogDetailClient params={params} />
}