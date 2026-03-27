'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'

interface AdminNavProps {
    siteName?: string;
}

export default function AdminNavigation({ siteName }: AdminNavProps) {
    const pathname = usePathname()
    const router = useRouter()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)

    useEffect(() => {
        setMounted(true)
    }, [])

    const displayName = siteName ? siteName.split(' ')[0] : 'Matías'

    if (!mounted) return <nav className="h-20 bg-white border-b border-gray-100" />

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 flex items-center no-scrollbar">
            <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center relative">

                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic uppercase tracking-tighter text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                </div>

                {/* Bloque Usuario */}
                <div className="relative">
                    <div
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center gap-4 cursor-pointer select-none group"
                    >
                        <div className="text-right hidden sm:block leading-none">
                            <p className="text-[11px] font-black uppercase tracking-widest text-black group-hover:text-zinc-600 transition-none">
                                {displayName}
                            </p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Admin</p>
                        </div>

                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0">
                            M
                        </div>
                    </div>

                    {/* Menú Desplegable: SOLO Cuenta, Preferencias y Cerrar Sesión */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-4 w-48 bg-white border border-gray-100 rounded-[25px] shadow-2xl z-20 py-3 overflow-hidden">
                            <button
                                onClick={() => { setIsUserMenuOpen(false); router.push('/admin/cuenta') }}
                                className="w-full text-left px-6 py-3 text-[10px] font-black uppercase text-zinc-700 hover:bg-[#F7F8FA] transition-none"
                            >
                                Mi cuenta
                            </button>
                            <button
                                onClick={() => { setIsUserMenuOpen(false); router.push('/admin/preferencias') }}
                                className="w-full text-left px-6 py-3 text-[10px] font-black uppercase text-zinc-700 hover:bg-[#F7F8FA] transition-none"
                            >
                                Preferencias
                            </button>

                            <div className="h-[1px] bg-gray-50 mx-6 my-2"></div>

                            <button
                                onClick={() => { setIsUserMenuOpen(false); router.push('/') }}
                                className="w-full text-left px-6 py-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-none"
                            >
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}