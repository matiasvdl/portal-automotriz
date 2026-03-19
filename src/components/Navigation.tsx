'use client'

import Link from 'next/link'

/**
 * Header dinámico y compacto fiel al diseño original de la Home.
 * Actualizado para redirigir a la página de inicio de sesión (/ingresar).
 */
export default function Navigation({ config }: { config?: any }) {
    // Si no hay links en Sanity, usamos los básicos por defecto
    const menuItems = config?.navMenu || [
        { title: 'Comprar un auto', path: '/catalogo' },
        { title: 'Vende tu auto', path: '/vende-tu-auto' },
        { title: 'Financiamiento', path: '/financiamiento' }
    ];

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left font-sans">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                {/* 1. Logo */}
                <Link href="/" className="text-2xl font-black tracking-tighter uppercase flex items-center text-black">
                    VDL<span className="font-light">MOTORS</span>
                </Link>

                {/* 2. Menú Central Dinámico (Desktop) */}
                <div className="hidden lg:flex gap-10">
                    {menuItems.map((link: any, i: number) => (
                        <Link
                            key={i}
                            href={link.path || '#'}
                            className="text-[11px] font-bold uppercase tracking-widest text-[#4A5568] hover:text-black transition-colors"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* 3. Botón Derecha - Ahora apunta a /admin */}
                <Link
                    href="/admin/ingresar"
                    className="bg-black text-white text-[10px] font-bold uppercase tracking-[0.15em] px-7 py-3 rounded-xl hover:bg-zinc-800 transition-colors"
                >
                    Ingresar
                </Link>
            </div>
        </nav>
    )
}