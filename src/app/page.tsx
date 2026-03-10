import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import CarCard from '../components/CarCard'

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
  const { cars, reviews, config } = await getData()

  return (
    <main className="min-h-screen">

      {/* 1. NAVEGACIÓN - COMPACTA Y FIEL AL DISEÑO ORIGINAL */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center text-black">
            VDL<span className="font-light">MOTORS</span>
          </Link>

          <div className="hidden lg:flex gap-10">
            {config?.navMenu?.map((link: any, i: number) => (
              <Link
                key={i}
                href={link.path}
                className="text-[12px] font-bold uppercase tracking-widest text-[#4A5568] hover:text-black transition-colors"
              >
                {link.title}
              </Link>
            ))}
          </div>

          <Link href="/admin" className="bg-black text-white text-[12px] font-bold uppercase tracking-[0.15em] px-7 py-3 rounded-xl hover:bg-zinc-800 transition-colors">
            Ingresar
          </Link>
        </div>
      </nav>

      {/* 2. HERO / BANNER */}
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

      {/* 3. LISTADO DE AUTOS DESTACADOS */}
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

      {/* 4. SECCIÓN DE RESEÑAS - DISEÑO ORIGINAL RESTAURADO */}
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

      {/* 5. FOOTER */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12 text-left">

          {/* Logo y descripción bajo el logo */}
          <div className="md:col-span-4 space-y-4">
            <span className="text-2xl font-black tracking-tighter uppercase text-white">
              VDL<span className="font-light">MOTORS</span>
            </span>
            <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
              {config?.footerDescription}
            </p>
          </div>

          {/* Enlaces Columna 1 */}
          <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
            {config?.footerLinks?.slice(0, 3).map((link: any, i: number) => (
              <Link key={i} href={link.path} className="block hover:text-white transition-colors">
                {link.title}
              </Link>
            ))}
          </div>

          {/* Enlaces Columna 2 + Selector de País */}
          <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
            {config?.footerLinks?.slice(3).map((link: any, i: number) => (
              <Link key={i} href={link.path} className="block hover:text-white transition-colors">
                {link.title}
              </Link>
            ))}
            <div className="flex items-center gap-2 pt-4 opacity-50 text-white">
              <span className="text-[10px] font-bold border border-white px-1.5 py-0.5 rounded uppercase tracking-tighter">CL</span>
              <span className="text-sm font-normal">Chile</span>
            </div>
          </div>
        </div>

        {/* Barra final: Copyright y frase dinámica en cursiva */}
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          <p>© 2026 VDL MOTORS SPA | TODOS LOS DERECHOS RESERVADOS</p>
          <p className="italic font-medium text-white uppercase tracking-normal">
            {config?.footerTagline || "TRANSFORMA TU CAMINO"}
          </p>
        </div>
      </footer>
    </main>
  )
}

/**
 * Componente interno: ReviewCard Restaurada
 */
function ReviewCard({ name, date, text, rating, badge }: { name: string; date: string; text: string; rating: number; badge?: string }) {
  return (
    <div className="bg-[#F7F8F9] border border-gray-200 p-8 rounded-2xl text-left h-full">
      <div className="space-y-5">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center font-bold text-white text-lg shrink-0 uppercase">
            {name.charAt(0)}
          </div>
          <div className="flex flex-col">
            <span className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5">
              {badge || 'COMPRADOR SATISFECHO'}
            </span>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-black uppercase text-sm tracking-tight leading-none">{name}</h4>
              <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full flex items-center justify-center">
                <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current" stroke="currentColor" strokeWidth="4">
                  <path d="M20 6L9 17L4 12" fill="none" />
                </svg>
              </div>
            </div>
            <p className="text-[10px] text-zinc-400 font-bold mt-1 tracking-wider">{date}</p>
          </div>
        </div>
        <div className="flex gap-1">
          {[...Array(5)].map((_, i) => (
            <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-zinc-800' : 'text-zinc-200'} fill-current`} viewBox="0 0 20 20">
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-sm text-zinc-600 leading-relaxed font-medium italic">"{text}"</p>
      </div>
    </div>
  )
}