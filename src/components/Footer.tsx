import Link from 'next/link'

export default function Footer() {
    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12 text-left">

                {/* Logo */}
                <div className="md:col-span-4">
                    <span className="text-2xl font-black tracking-tighter uppercase text-white">
                        VDL<span className="font-light">MOTORS</span>
                    </span>
                </div>

                {/* Enlaces rápidos */}
                <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
                    <Link href="/catalogo" className="block hover:text-white transition-colors">Compra un auto</Link>
                    <Link href="/sucursales" className="block hover:text-white transition-colors">Sucursales</Link>
                    <Link href="/faq" className="block hover:text-white transition-colors">Preguntas frecuentes</Link>
                </div>

                {/* Contacto */}
                <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
                    <h4 className="text-white uppercase font-bold tracking-widest text-xs">Contacto</h4>
                    <div className="flex items-center gap-2 pt-2 opacity-50 text-white">
                        <span className="text-[10px] font-bold border border-white px-1.5 py-0.5 rounded uppercase tracking-tighter">CL</span>
                        <span className="text-sm font-normal">Chile</span>
                    </div>
                </div>
            </div>

            {/* Barra final */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                <p>© 2026 VDL MOTORS SPA | TODOS LOS DERECHOS RESERVADOS</p>
                <p className="italic font-medium text-white uppercase tracking-normal">
                    TRANSFORMA TU CAMINO
                </p>
            </div>
        </footer>
    )
}