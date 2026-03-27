'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

interface NavLink {
    name: string
    href: string
}

export default function AdminNavigation() {
    const pathname = usePathname()

    // Definimos las rutas centrales del Dashboard
    const adminLinks: NavLink[] = [
        { name: 'Dashboard', href: '/admin/dashboard' },
        { name: 'Inventario', href: '/admin/inventario' },
        { name: 'Reseñas', href: '/admin/resenas' },
        { name: 'Preferencias', href: '/admin/preferencias' },
    ]

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 flex items-center no-scrollbar">
            <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center relative">

                {/* Logo e Identidad */}
                <div className="flex items-center gap-8">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic uppercase tracking-tighter text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>

                    {/* Enlaces de Navegación */}
                    <div className="hidden md:flex items-center gap-6">
                        {adminLinks.map((link) => {
                            const isActive = pathname === link.href
                            return (
                                <Link
                                    key={link.href}
                                    href={link.href}
                                    className={`text-[10px] font-black uppercase tracking-[0.15em] transition-none ${isActive
                                            ? 'text-black border-b-2 border-black pb-1'
                                            : 'text-zinc-400 hover:text-black'
                                        }`}
                                >
                                    {link.name}
                                </Link>
                            )
                        })}
                    </div>
                </div>

                {/* Menú de Usuario / Perfil */}
                <div className="flex items-center gap-4">
                    <div className="text-right hidden sm:block leading-none">
                        <p className="text-[11px] font-black uppercase tracking-widest text-black">Matías</p>
                        <p className="text-[8px] font-bold text-zinc-400 uppercase mt-1">Admin</p>
                    </div>
                    <Link
                        href="/admin/cuenta"
                        className={`w-10 h-10 rounded-full flex items-center justify-center text-[11px] font-black border-2 transition-none ${pathname === '/admin/cuenta'
                                ? 'bg-black text-white border-black'
                                : 'bg-white text-black border-gray-100'
                            }`}
                    >
                        M
                    </Link>
                </div>
            </div>
        </nav>
    )
}