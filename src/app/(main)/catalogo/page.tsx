import { client } from '@/sanity/lib/client'
import CatalogFilters from '@/components/CatalogFilters'

export const revalidate = 0

// PASO B: SEO DINÁMICO DESDE SANITY
export async function generateMetadata() {
    const config = await client.fetch(`*[_type == "siteConfig"][0]{ seoDescriptions }`)

    return {
        title: 'Catálogo de Autos',
        description: config?.seoDescriptions?.catalogo || 'Explora nuestra selección de vehículos usados y seminuevos con garantía y financiamiento.'
    }
}

async function getCars() {
    // Hemos añadido && status != false para que los vehículos ocultos no aparezcan en la web pública
    const query = `*[_type == "car" && status != false] | order(_createdAt desc) {
    _id, 
    make, 
    model, 
    version,
    year, 
    listPrice,
    financedPrice,
    fuel, 
    transmission, 
    mileage, 
    body, 
    color,
    drivetrain,
    location,
    category,
    engine,
    "slug": slug.current,
    "imageUrl": images[0].asset->url
  }`
    return await client.fetch(query)
}

export default async function CatalogoPage({
    searchParams,
}: {
    searchParams: Promise<{ search?: string | string[] }>
}) {
    const [cars, params] = await Promise.all([getCars(), searchParams])
    const rawSearch = Array.isArray(params.search) ? params.search[0] : params.search
    const initialSearch = rawSearch?.trim() ?? ''

    return (
        <main className="min-h-screen bg-[#F7F8F9]">
            <CatalogFilters initialCars={cars} initialSearch={initialSearch} />
        </main>
    )
}