import { client } from '@/sanity/lib/client'
import CatalogFilters from '@/components/CatalogFilters'

export const revalidate = 0

async function getCars() {
    const query = `*[_type == "car"] | order(_createdAt desc) {
    _id, make, model, year, price, fuel, transmission, mileage, body, color,
    "slug": slug.current,
    "imageUrl": images[0].asset->url
  }`
    return await client.fetch(query)
}

export default async function CatalogoPage() {
    const cars = await getCars()

    return (
        <main className="min-h-screen bg-white">
            {/* El Header y Footer ya vienen del Layout global */}
            <CatalogFilters initialCars={cars} />
        </main>
    )
}