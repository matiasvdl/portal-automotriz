import { client } from '@/sanity/lib/client'
import Link from 'next/link'

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
    <main className="min-h-screen bg-[#F7F8F9] text-black font-sans selection:bg-black selection:text-white">

      {/* 1. NAVBAR (Minimalista Blanco/Negro) */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center">
            VDL<span className="font-light">MOTORS</span>
          </Link>

          <div className="hidden lg:flex gap-10 text-[12px] font-bold text-gray-400 uppercase tracking-widest">
            <Link href="/comprar" className="hover:text-black transition-colors">Comprar un auto</Link>
            <Link href="/vender" className="hover:text-black transition-colors">Vende tu auto</Link>
            <Link href="/financia" className="hover:text-black transition-colors">Financiamiento</Link>
          </div>

          <div>
            <Link href="/admin" className="bg-black text-white text-[12px] font-bold uppercase tracking-widest px-8 py-3 rounded-lg hover:bg-gray-800 transition-all shadow-lg shadow-black/10">
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO (Imagen Limpia) */}
      <section className="relative h-[450px] bg-black overflow-hidden flex items-center justify-center">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-50"
          alt="Hero"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4">
            Transforma tu camino
          </h2>
          <p className="text-lg font-medium opacity-80 mb-8">
            Comprar y vender un auto nunca fue tan simple.
          </p>

          <div className="bg-white p-2 rounded-xl flex max-w-xl mx-auto border border-gray-200 shadow-2xl">
            <input
              type="text"
              placeholder="Busca por marca o modelo..."
              className="flex-grow bg-transparent text-black py-3 px-6 outline-none text-sm font-medium"
            />
            <button className="bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase transition-all">
              Buscar
            </button>
          </div>
        </div>
      </section>

      {/* 3. GRID DE AUTOS (Sin Azules) */}
      <section className="max-w-7xl mx-auto px-6 py-20">
        <div className="flex justify-between items-end mb-12">
          <h3 className="text-3xl font-extrabold tracking-tighter">Recién llegados</h3>
          <Link href="/catalogo" className="text-sm font-bold text-gray-400 hover:text-black transition-colors uppercase tracking-widest border-b border-gray-200 pb-1">
            Ver todos los autos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars.map((car: any) => (
            <Link href={`/auto/${car._id}`} key={car._id} className="group bg-white rounded-2xl border border-gray-100 overflow-hidden hover:shadow-2xl transition-all duration-500">
              {/* Imagen */}
              <div className="aspect-[4/3] relative bg-gray-50 overflow-hidden">
                <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700" />
                <div className="absolute top-4 left-4 bg-white px-3 py-1 rounded text-[9px] font-black tracking-widest uppercase shadow-sm border border-gray-100">
                  Seminuevo
                </div>
              </div>

              {/* Información */}
              <div className="p-6 space-y-4">
                <div className="space-y-1">
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">{car.year}</p>
                  <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate leading-none">
                    {car.make} {car.model}
                  </h4>
                </div>

                <div className="pt-4 border-t border-gray-50 flex items-center justify-between">
                  <div>
                    <p className="text-[9px] text-gray-400 font-black uppercase mb-1 tracking-widest">{car.transmission}</p>
                    <p className="text-xl font-black text-black tracking-tighter">
                      ${car.price?.toLocaleString('es-CL')}
                    </p>
                  </div>
                  <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-all">
                    <span className="text-xl">›</span>
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </section>

      {/* 4. FOOTER NEGRO (Kavak Original) */}
      <footer className="bg-black text-white py-24">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16">
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase">
              VDL<span className="font-light">MOTORS</span>
            </Link>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Link href="/comprar" className="block text-sm font-medium text-gray-400 hover:text-white transition-colors">Compra un auto</Link>
            <Link href="/sedes" className="block text-sm font-medium text-gray-400 hover:text-white transition-colors">Sedes</Link>
            <Link href="/faq" className="block text-sm font-medium text-gray-400 hover:text-white transition-colors">Preguntas frecuentes</Link>
            <Link href="/blog" className="block text-sm font-medium text-gray-400 hover:text-white transition-colors">Blog</Link>
          </div>

          <div className="md:col-span-3 space-y-4">
            <Link href="/contacto" className="block text-sm font-medium text-gray-400 hover:text-white transition-colors">Contacto</Link>
            <div className="flex items-center gap-2 pt-4 opacity-50">
              <span className="text-[10px] font-bold border border-white px-1 rounded uppercase tracking-tighter">CL</span>
              <span className="text-sm font-medium">Chile</span>
            </div>
          </div>
        </div>
        <div className="max-w-7xl mx-auto px-6 mt-24 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-600 uppercase tracking-[0.2em]">
          <p>© 2026 VDL MOTORS SPA</p>
          <p className="italic">Transforma tu camino</p>
        </div>
      </footer>
    </main>
  )
}