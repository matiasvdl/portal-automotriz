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

export default async function CatalogoPage() {
    const cars = await getCars()

    return (
        <main className="min-h-screen bg-[#F7F8F9]">
            {/* Paso A: CatalogFilters debe usar el hook useSettings() 
                para aplicar el primaryColor a los botones y filtros. 
            */}
            <CatalogFilters initialCars={cars} />
        </main>
    )
}