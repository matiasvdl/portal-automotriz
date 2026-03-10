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

      {/* 1. NAVBAR */}
      <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center text-black">
            VDL<span className="font-light">MOTORS</span>
          </Link>

          <div className="hidden lg:flex gap-10">
            <Link
              href="/comprar"
              className="text-[12px] font-bold text-[#4B5563] hover:text-black uppercase tracking-[0.1em]"
            >
              Comprar un auto
            </Link>
            <Link
              href="/vender"
              className="text-[12px] font-bold text-[#4B5563] hover:text-black uppercase tracking-[0.1em]"
            >
              Vende tu auto
            </Link>
            <Link
              href="/financia"
              className="text-[12px] font-bold text-[#4B5563] hover:text-black uppercase tracking-[0.1em]"
            >
              Financiamiento
            </Link>
          </div>

          <div>
            <Link
              href="/admin"
              className="bg-black text-white text-[12px] font-bold uppercase tracking-[0.15em] px-8 py-3 rounded-lg hover:bg-zinc-800"
            >
              Ingresar
            </Link>
          </div>
        </div>
      </nav>

      {/* 2. HERO */}
      <section className="relative h-[450px] bg-zinc-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Hero"
        />
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <h2 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Transforma tu camino
          </h2>
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
      </section>

      {/* 3. GRID DE AUTOS */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-4">
          <h3 className="text-2xl font-bold tracking-tight text-black">
            Recién llegados
          </h3>

          <Link href="/catalogo" className="text-[11px] font-bold text-gray-400 hover:text-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
            Ver todos los autos <span>→</span>
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars && cars.map((car: any) => (
            <div key={car._id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col hover:border-gray-200 transition-colors">

              <div className="aspect-[4/3] relative bg-gray-50 border-b border-gray-100 overflow-hidden">
                <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
                <div className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-br-lg">
                  Seminuevo
                </div>
              </div>

              <div className="p-6 flex-grow flex flex-col justify-between space-y-5">
                <Link href={`/auto/${car._id}`}>
                  <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                    {car.year} · {car.transmission}
                  </p>
                  <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate leading-none mb-4 group-hover:text-zinc-700 transition-colors">
                    {car.make} {car.model}
                  </h4>

                  <div className="flex gap-4">
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1.5">Kilómetros</span>
                      <span className="text-[11px] font-bold text-gray-700">45.000 KM</span>
                    </div>
                    <div className="h-6 w-[1px] bg-gray-100"></div>
                    <div className="flex flex-col">
                      <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1.5">Motor</span>
                      <span className="text-[11px] font-bold text-gray-700 uppercase">{car.fuel}</span>
                    </div>
                  </div>
                </Link>

                <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                  <div className="flex flex-col">
                    <span className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Precio</span>
                    <p className="text-xl font-black text-black tracking-tighter leading-none">
                      ${car.price?.toLocaleString('es-CL')}
                    </p>
                  </div>

                  <Link
                    href={`/auto/${car._id}`}
                    className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 transition-colors hover:bg-black hover:text-white hover:border-black"
                  >
                    <span className="text-xl">›</span>
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 4. FOOTER AJUSTADO (Menos espacio abajo) */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12">
          <div className="md:col-span-4 space-y-6">
            <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center text-white">
              VDL<span className="font-light">MOTORS</span>
            </Link>
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
              <span className="text-sm font-normal text-white">Chile</span>
            </div>
          </div>
        </div>

        {/* Línea y créditos final con espaciado mínimo */}
        <div className="max-w-7xl mx-auto px-6 pt-6 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          <p>© 2026 VDL MOTORS SPA | TODOS LOS DERECHOS RESERVADOS</p>
          <p className="italic font-medium">TRANSFORMA TU CAMINO</p>
        </div>
      </footer>
    </main>
  )
}