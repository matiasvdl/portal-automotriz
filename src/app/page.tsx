import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import CarCard from '../components/CarCard'

/**
 * Función asíncrona para obtener los datos de Sanity.
 * Trae los últimos 4 autos subidos (_createdAt desc).
 */
async function getCars() {
  const query = `*[_type == "car"] | order(_createdAt desc)[0...4] {
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
  // Obtenemos los datos de los autos antes de renderizar
  const cars = await getCars()

  return (
    <main className="min-h-screen">

      {/* --- SECCIÓN 1: NAVEGACIÓN (NAVBAR) --- 
          Diseño sticky (fijo arriba) con fondo blanco y borde sutil.
      */}
      <nav className="bg-white border-b border-gray-200 sticky top-0 z-50 h-20 flex items-center shadow-none">
        <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

          {/* LOGOTIPO: Uso de font-black y font-light para contraste de marca */}
          <Link href="/" className="text-2xl font-black tracking-tighter uppercase text-black">
            VDL<span className="font-light">MOTORS</span>
          </Link>

          {/* MENÚ DE ESCRITORIO: Clases 'nav-link' definidas en globals.css */}
          <div className="hidden lg:flex gap-10">
            <Link href="/comprar" className="nav-link">Comprar un auto</Link>
            <Link href="/vender" className="nav-link">Vende tu auto</Link>
            <Link href="/financia" className="nav-link">Financiamiento</Link>
          </div>

          {/* BOTÓN DE ACCESO ADMIN */}
          <Link href="/admin" className="bg-black text-white text-[11px] font-bold uppercase tracking-[0.15em] px-8 py-3 rounded-lg hover:bg-zinc-800 transition-colors">
            Ingresar
          </Link>
        </div>
      </nav>

      {/* --- SECCIÓN 2: HERO (BANNER PRINCIPAL) --- 
          Imagen de fondo con overlay oscuro para resaltar el buscador.
      */}
      <header className="relative h-[450px] bg-zinc-900 flex items-center justify-center overflow-hidden">
        <img
          src="https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1920"
          className="absolute inset-0 w-full h-full object-cover opacity-60"
          alt="Banner Principal"
        />

        {/* CONTENIDO DEL HERO */}
        <div className="relative z-10 text-center text-white px-4 max-w-3xl">
          <h1 className="text-5xl font-extrabold tracking-tight mb-4 leading-tight">
            Transforma tu camino
          </h1>
          <p className="text-lg font-medium opacity-80 mb-8">
            Comprar y vender un auto nunca fue tan simple.
          </p>

          {/* BARRA DE BÚSQUEDA: Diseño plano y minimalista */}
          <div className="bg-white p-2 rounded-xl flex max-w-xl mx-auto border border-gray-200">
            <input
              type="text"
              placeholder="Busca por marca o modelo..."
              className="flex-grow bg-transparent text-black py-3 px-6 outline-none text-sm font-medium"
            />
            <button className="bg-black text-white px-8 py-3 rounded-lg text-sm font-bold uppercase hover:bg-zinc-800 transition-colors">
              Buscar
            </button>
          </div>
        </div>
      </header>

      {/* --- SECCIÓN 3: LISTADO DE AUTOS (GRID) --- 
          Muestra las tarjetas obtenidas de Sanity.
      */}
      <section className="max-w-7xl mx-auto px-6 py-10">
        {/* Cabecera de la sección con enlace al catálogo completo */}
        <div className="flex justify-between items-baseline mb-6 border-b border-gray-100 pb-4">
          <h2 className="text-2xl font-bold tracking-tight text-black">Recién llegados</h2>
          <Link href="/catalogo" className="text-[11px] font-bold text-gray-400 hover:text-black uppercase tracking-[0.2em] flex items-center gap-2 transition-colors">
            Ver todos los autos <span>→</span>
          </Link>
        </div>

        {/* GRID DINÁMICO: 1 columna en móvil, 2 en tablet, 4 en escritorio */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars?.map((car: any) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </section>

      {/* --- SECCIÓN 4: FOOTER (PIE DE PÁGINA) --- 
          Fondo negro sólido con tipografía en gris claro para los links.
      */}
      <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
        <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12">

          {/* Logo Footer */}
          <div className="md:col-span-4">
            <span className="text-2xl font-black tracking-tighter uppercase text-white">
              VDL<span className="font-light">MOTORS</span>
            </span>
          </div>

          {/* Links de Navegación Footer */}
          <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400 text-left">
            <Link href="/comprar" className="block hover:text-white transition-colors">Compra un auto</Link>
            <Link href="/sedes" className="block hover:text-white transition-colors">Sedes</Link>
            <Link href="/faq" className="block hover:text-white transition-colors">Preguntas frecuentes</Link>
          </div>

          {/* Información de Contacto y País */}
          <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400 text-left">
            <Link href="/contacto" className="block hover:text-white transition-colors">Contacto</Link>
            <div className="flex items-center gap-2 pt-4 opacity-50 text-white">
              <span className="text-[10px] font-bold border border-white px-1.5 py-0.5 rounded uppercase tracking-tighter">CL</span>
              <span className="text-sm font-normal">Chile</span>
            </div>
          </div>
        </div>

        {/* BARRA FINAL: Copyright y Eslogan */}
        <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
          <p>© 2026 VDL MOTORS SPA | TODOS LOS DERECHOS RESERVADOS</p>
          <p className="italic font-medium">TRANSFORMA TU CAMINO</p>
        </div>
      </footer>

    </main>
  )
}