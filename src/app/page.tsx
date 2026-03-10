import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import CarCard from '../components/CarCard'

/**
 * Función para obtener los autos desde Sanity
 */
async function getCars() {
  const query = `*[_type == "car"] | order(_createdAt desc)[0...4] {
    _id, make, model, year, price, fuel, transmission,
    "imageUrl": images[0].asset->url
  }`
  return await client.fetch(query)
}

export default async function HomePage() {
  const cars = await getCars()

  return (
    <main className="min-h-screen">

      {/* 1. NAVEGACIÓN */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-20 flex items-center shadow-none">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center text-black">
            VDL<span className="font-light">MOTORS</span>
          </Link>

          <div className="hidden lg:flex gap-10">
            <Link href="/comprar" className="nav-link">Comprar un auto</Link>
            <Link href="/vender" className="nav-link">Vende tu auto</Link>
            <Link href="/financia" className="nav-link">Financiamiento</Link>
          </div>

          <Link href="/admin" className="bg-black text-white text-[12px] font-bold uppercase tracking-[0.15em] px-8 py-3 rounded-lg hover:bg-zinc-800 transition-colors">
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

          <div className="bg-white p-2 rounded-xl flex max-w-xl mx-auto border border-gray-200">
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

      {/* 3. LISTADO DE AUTOS RECIÉN LLEGADOS */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline mb-8">
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-black uppercase">Recién llegados</h2>
            <div className="h-1 w-12 bg-black"></div>
          </div>
          <Link href="/catalogo" className="text-[11px] font-bold text-gray-400 hover:text-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
            Ver todos los autos <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars && cars.map((car: any) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </section>

      {/* 4. RESEÑAS DE CLIENTES
      */}
      <section className="bg-white pb-14 pt-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 space-y-2">
            <h2 className="text-xl font-black tracking-tight text-black uppercase text-left">Reseña de nuestros clientes</h2>
            <div className="h-1 w-12 bg-black"></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 text-left">
            <ReviewCard
              name="Josue Villalon"
              date="2025-09-26"
              text="Excelente servicio, el proceso de compra fue muy rápido y transparente. 100% recomendados."
            />
            <ReviewCard
              name="Natalia Espinoza"
              date="2025-09-24"
              text="Buscaba seguridad y aquí la encontré. El informe Autofact me dio toda la tranquilidad que necesitaba."
            />
            <ReviewCard
              name="Mario Rodriguez"
              date="2025-09-16"
              text="La mejor gestión. Vendí mi auto anterior y compré el nuevo en el mismo lugar sin complicaciones."
            />
          </div>
        </div>
      </section>

      {/* 5. FOOTER */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12 text-left">
          <div className="md:col-span-4">
            <span className="text-2xl font-black tracking-tighter uppercase text-white">
              VDL<span className="font-light">MOTORS</span>
            </span>
          </div>

          <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
            <Link href="/comprar" className="block hover:text-white transition-colors">Compra un auto</Link>
            <Link href="/sedes" className="block hover:text-white transition-colors">Sedes</Link>
            <Link href="/faq" className="block hover:text-white transition-colors">Preguntas frecuentes</Link>
          </div>

          <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
            <Link href="/contacto" className="block hover:text-white transition-colors">Contacto</Link>
            <div className="flex items-center gap-2 pt-4 opacity-50 text-white">
              <span className="text-[10px] font-bold border border-white px-1.5 py-0.5 rounded uppercase tracking-tighter">CL</span>
              <span className="text-sm font-normal">Chile</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          <p>© 2026 VDL MOTORS SPA | TODOS LOS DERECHOS RESERVADOS</p>
          <p className="italic font-medium text-white uppercase tracking-normal">Transforma tu camino</p>
        </div>
      </footer>
    </main>
  )
}

/**
 * Componente interno para las tarjetas de reseña
 */
function ReviewCard({ name, date, text }: { name: string; date: string; text: string }) {
  return (
    <div className="bg-[#F7F8F9] border border-gray-100 p-8 rounded-2xl space-y-4">
      <div className="flex items-center gap-4">
        <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center font-bold text-white uppercase text-left">
          {name.charAt(0)}
        </div>
        <div>
          <h4 className="font-bold text-black uppercase text-sm tracking-tight leading-none mb-1 text-left">{name}</h4>
          <p className="text-[9px] text-gray-400 font-bold uppercase tracking-widest text-left">{date}</p>
        </div>
      </div>
      <div className="flex gap-1 justify-start">
        {[...Array(5)].map((_, i) => (
          <span key={i} className="text-black text-[10px]">★</span>
        ))}
      </div>
      <p className="text-sm text-gray-600 leading-relaxed font-medium text-left italic">"{text}"</p>
    </div>
  )
}