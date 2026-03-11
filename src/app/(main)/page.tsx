import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import CarCard from "@/components/CarCard"

// Forzamos que la página se actualice siempre para ver cambios de Sanity al instante
export const revalidate = 0

/**
 * Obtiene todos los datos necesarios para la Home en una sola consulta eficiente
 */
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
    },
    "config": *[_type == "siteConfig"][0] { 
      navMenu,
      footerDescription,
      footerLinks,
      footerTagline
    }
  }`
  return await client.fetch(query)
}

export default async function HomePage() {
  const { cars, reviews } = await getData()

  return (
    <div className="min-h-screen">

      {/* 1. HERO / BANNER - Limpio de navegación manual */}
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

      {/* 3. SECCIÓN DE RESEÑAS - Limpio de footer manual */}
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
    </div>
  )
}

/**
 * Componente interno: Tarjeta de reseña monocromática y plana
 */
function ReviewCard({ name, date, text, rating, badge }: { name: string; date: string; text: string; rating: number; badge?: string }) {
  return (
    <div className="bg-[#F7F8F9] border border-gray-200 p-8 rounded-2xl text-left h-full transition-colors hover:border-gray-300">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center font-bold text-white uppercase shrink-0 text-lg">
            {name.charAt(0)}
          </div>

          <div className="flex flex-col gap-0.5">
            <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
              {badge || 'Comprador'}
            </span>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-black uppercase text-sm tracking-tighter leading-none">{name}</h4>
              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full flex items-center justify-center shrink-0">
                <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current" stroke="currentColor" strokeWidth="4">
                  <path d="M20 6L9 17L4 12" fill="none" />
                </svg>
              </div>
            </div>
            <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{date}</p>
          </div>
        </div>

        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className={`w-3.5 h-3.5 ${i < rating ? 'text-zinc-800' : 'text-zinc-200'} fill-current`}
              viewBox="0 0 20 20"
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>

        <p className="text-sm text-zinc-700 leading-relaxed font-medium italic">
          "{text}"
        </p>
      </div>
    </div>
  )
}