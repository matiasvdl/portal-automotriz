import { client } from '@/sanity/lib/client'
import CatalogFilters from '@/components/CatalogFilters'

// Forzamos que la página siempre traiga datos frescos de Sanity
export const revalidate = 0

/**
 * Obtenemos todos los autos con los campos necesarios para los filtros tipo Kavak
 */
async function getCars() {
    const query = `*[_type == "car"] | order(_createdAt desc) {
    _id, 
    make, 
    model, 
    year, 
    price, 
    fuel, 
    transmission, 
    mileage, 
    body, 
    color,
    drivetrain,
    location,
    "slug": slug.current,
    "imageUrl": images[0].asset->url
  }`
    return await client.fetch(query)
}

export default async function CatalogoPage() {
    const cars = await getCars()

    return (
        <main className="min-h-screen bg-[#F7F8F9]">
            {/* Renderizamos el componente de filtros que maneja la lógica 
                lateral estilo Kavak y la grilla de resultados.
            */}
            <CatalogFilters initialCars={cars} />
        </main>
    )
}