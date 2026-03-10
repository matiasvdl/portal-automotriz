import Link from 'next/link'

export default function Navigation() {
    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                {/* Logo */}
                <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center text-black">
                    VDL<span className="font-light">MOTORS</span>
                </Link>

                {/* Menú */}
                <div className="hidden lg:flex gap-10">
                    <Link href="/catalogo" className="text-[12px] font-bold uppercase tracking-widest text-[#4A5568] hover:text-black transition-colors">
                        Comprar un auto
                    </Link>
                    <Link href="/sucursales" className="text-[12px] font-bold uppercase tracking-widest text-[#4A5568] hover:text-black transition-colors">
                        Sucursales
                    </Link>
                    <Link href="/contacto" className="text-[12px] font-bold uppercase tracking-widest text-[#4A5568] hover:text-black transition-colors">
                        Contacto
                    </Link>
                </div>

                {/* Botón Acceso */}
                <Link href="/admin" className="bg-black text-white text-[12px] font-bold uppercase tracking-[0.15em] px-7 py-3 rounded-xl hover:bg-zinc-800 transition-colors">
                    Ingresar
                </Link>
            </div>
        </nav>
    )
}