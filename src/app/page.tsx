import { client } from '@/sanity/lib/client'
import Link from 'next/link'

async function getCars() {
  const query = `*[_type == "car"] | order(_createdAt desc) {
    _id,
    make,
    model,
    year,
    price,
    fuel,
    transmission,
    "imageUrl": images[0].asset->url
  }`
  return await client.fetch(query)
}

export default async function HomePage() {
  const cars = await getCars()

  return (
    <main className="min-h-screen bg-zinc-950 text-white">
      {/* Barra de Navegación Simple */}
      <nav className="border-b border-zinc-800 bg-black/50 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-6 py-4 flex justify-between items-center">
          <h1 className="text-xl font-bold tracking-tighter">VDL <span className="text-blue-500">MOTORS</span></h1>
          <Link href="/admin" className="text-xs text-zinc-500 hover:text-white transition-colors">
            Acceso Administración
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="py-16 px-6 text-center bg-gradient-to-b from-zinc-900 to-zinc-950">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4">Encuentra tu próximo vehículo</h2>
        <p className="text-zinc-400 max-w-2xl mx-auto text-lg">
          Explora nuestra selección exclusiva de autos usados con garantía y financiamiento.
        </p>
      </header>

      {/* Grilla de Autos */}
      <section className="max-w-7xl mx-auto px-6 py-12">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
          {cars.map((car: any) => (
            <div key={car._id} className="group bg-zinc-900 rounded-2xl border border-zinc-800 overflow-hidden hover:border-blue-500/50 transition-all duration-300 shadow-xl">
              {/* Contenedor de Imagen */}
              <div className="aspect-[16/9] overflow-hidden bg-zinc-800 relative">
                {car.imageUrl ? (
                  <img
                    src={car.imageUrl}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-zinc-600 italic">
                    Sin foto disponible
                  </div>
                )}
                <div className="absolute bottom-3 left-3 bg-black/70 backdrop-blur-md px-3 py-1 rounded-full text-xs font-bold border border-white/10">
                  {car.year}
                </div>
              </div>

              {/* Información del Auto */}
              <div className="p-6">
                <div className="flex justify-between items-start mb-2">
                  <h3 className="text-xl font-bold uppercase tracking-tight">
                    {car.make} <span className="text-zinc-400 font-medium">{car.model}</span>
                  </h3>
                </div>

                <div className="flex gap-3 mb-6">
                  <span className="text-[10px] uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-bold border border-zinc-700">
                    {car.fuel || 'Gasolina'}
                  </span>
                  <span className="text-[10px] uppercase tracking-widest bg-zinc-800 px-2 py-1 rounded text-zinc-400 font-bold border border-zinc-700">
                    {car.transmission || 'Manual'}
                  </span>
                </div>

                <div className="flex items-center justify-between pt-4 border-t border-zinc-800">
                  <span className="text-2xl font-black text-blue-500">
                    ${car.price?.toLocaleString('es-CL')}
                  </span>
                  <Link
                    href={`/auto/${car._id}`}
                    className="bg-white text-black px-4 py-2 rounded-lg font-bold text-sm hover:bg-blue-500 hover:text-white transition-all"
                  >
                    Ver Detalles
                  </Link>
                </div>
              </div>
            </div>
          ))}
        </div>

        {cars.length === 0 && (
          <div className="text-center py-20 border-2 border-dashed border-zinc-800 rounded-3xl">
            <p className="text-zinc-500 text-lg">No hay vehículos disponibles en este momento.</p>
          </div>
        )}
      </section>

      {/* Footer */}
      <footer className="border-t border-zinc-900 py-10 text-center text-zinc-600 text-sm">
        <p>&copy; 2026 VDL Motors - Portal Automotriz</p>
      </footer>
    </main>
  )
}