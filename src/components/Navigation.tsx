'use client'

import Link from 'next/link'

export default function Navigation({ config }: { config?: any }) {
    // Usamos las rutas que ya tienes establecidas en tu proyecto por defecto
    const menuItems = config?.navMenu?.length > 0 ? config.navMenu : [
        { title: 'Comprar un auto', path: '/catalogo' },
        { title: 'Vende tu auto', path: '/vender' },
        { title: 'Financiamiento', path: '/financiamiento' }
    ];

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left font-sans">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                {/* 1. Logo */}
                <div className="flex items-center">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                </div>

                {/* 2. Menú Central Dinámico */}
                <div className="hidden lg:flex gap-12">
                    {menuItems.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.path || '#'}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333] hover:text-black transition-colors"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* 3. Botón Ingresar */}
                <div className="flex items-center">
                    <Link
                        href="/admin/ingresar"
                        className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-all active:scale-95"
                    >
                        Ingresar
                    </Link>
                </div>
            </div>
        </nav>
    )
}