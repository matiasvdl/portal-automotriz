import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import CarCard from '../components/CarCard'
import ReviewCard from '../components/ReviewCard'

export const revalidate = 0

async function getData() {
  const query = `{
    "cars": *[_type == "car"] | order(_createdAt desc)[0...4] {
      _id, make, model, year, price, fuel, transmission, 
      mileage,
      "slug": slug.current,
      "imageUrl": images[0].asset->url
    },
    "reviews": *[_type == "review"] | order(date desc)[0...3] {
      _id, name, date, rating, comment, badge 
    }
  }`
  return await client.fetch(query)
}

export default async function HomePage() {
  const { cars, reviews } = await getData()

  return (
    <main className="min-h-screen">
      {/* 1. HERO / BANNER */}
      <header className="relative h-[450px] bg-zinc-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Hero Banner"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Transforma tu camino
          </h1>
          <p className="text-lg font-medium opacity-80 mb-8">
            Comprar y vender un auto nunca fue tan simple.
          </p>

          <div className="bg-white p-2 rounded-xl flex max-w-xl mx-auto border border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Busca por marca o modelo..."
              className="flex-grow bg-transparent text-black py-3 px-6 outline-none text-sm font-medium placeholder:text-gray-400"
            />
            <button className="bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase hover:bg-zinc-800 transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* 2. LISTADO DE AUTOS DESTACADOS */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline mb-8">
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-black uppercase">Recién llegados</h2>
            <div className="h-1 w-12 bg-black"></div>
          </div>
          <Link href="/catalogo" className="text-[11px] font-bold text-gray-400 hover:text-black uppercase tracking-[0.2em] transition-colors">
            Ver todos los autos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars && cars.map((car: any) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </section>

      {/* 3. SECCIÓN DE RESEÑAS */}
      <section className="bg-white pb-16 pt-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 space-y-2 text-left">
            <h2 className="text-xl font-black tracking-tight text-black uppercase">Reseña de nuestros clientes</h2>
            <div className="h-1 w-12 bg-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {reviews?.map((review: any) => (
              <ReviewCard
                key={review._id}
                name={review.name}
                date={review.date}
                text={review.comment}
                rating={review.rating}
                badge={review.badge}
              />
            ))}
          </div>
        </div>
      </section>
    </main>
  )
}