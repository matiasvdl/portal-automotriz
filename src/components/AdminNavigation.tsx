'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'

export default function AdminNavigation() {
    const { data: session } = useSession()
    const pathname = usePathname()
    const router = useRouter()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [userData, setUserData] = useState<{ image?: any; firstName?: string } | null>(null)

    useEffect(() => {
        setMounted(true)
        const fetchUserData = async () => {
            if (session?.user?.email) {
                const data = await client.fetch(
                    `*[_type == "adminProfile" && email == $email][0]{firstName, image}`,
                    { email: session.user.email }
                )
                setUserData(data)
            }
        }
        fetchUserData()
    }, [session])

    if (!mounted) return <nav className="h-20 bg-white border-b border-gray-100" />

    const displayName = userData?.firstName || session?.user?.name?.split(' ')[0] || 'Admin'
    const initial = displayName.charAt(0).toUpperCase()

    // IMPORTANTE: Extraemos el rol de la sesión
    const userRole = (session?.user as any)?.role

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
                            <p className="text-[11px] font-black uppercase tracking-widest text-black group-hover:text-zinc-600 transition-colors">
                                {displayName}
                            </p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Panel Admin</p>
                        </div>

                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                            {userData?.image ? (
                                <img src={urlFor(userData.image).url()} className="w-full h-full object-cover" alt={displayName} />
                            ) : (
                                <span>{initial}</span>
                            )}
                        </div>
                    </div>

                    {/* Menú Desplegable */}
                    {isUserMenuOpen && (
                        <div className="absolute right-0 mt-4 w-52 bg-white border border-gray-100 rounded-[25px] shadow-2xl z-20 py-3 overflow-hidden animate-in fade-in slide-in-from-top-2 duration-200">

                            <button
                                onClick={() => { setIsUserMenuOpen(false); router.push('/admin/cuenta') }}
                                className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase transition-colors ${pathname === '/admin/cuenta' ? 'bg-[#F7F8FA] text-black' : 'text-zinc-700 hover:bg-[#F7F8FA]'}`}
                            >
                                Mi cuenta
                            </button>

                            {/* FILTRO DE SEGURIDAD: Solo Admin Principal ve esto */}
                            {userRole === 'Administrador Principal' && (
                                <>
                                    <button
                                        onClick={() => { setIsUserMenuOpen(false); router.push('/admin/administracion') }}
                                        className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase transition-colors ${pathname === '/admin/administracion' ? 'bg-[#F7F8FA] text-black' : 'text-zinc-700 hover:bg-[#F7F8FA]'}`}
                                    >
                                        Administración
                                    </button>

                                    <button
                                        onClick={() => { setIsUserMenuOpen(false); router.push('/admin/preferencias') }}
                                        className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase transition-colors ${pathname === '/admin/preferencias' ? 'bg-[#F7F8FA] text-black' : 'text-zinc-700 hover:bg-[#F7F8FA]'}`}
                                    >
                                        Preferencias
                                    </button>
                                </>
                            )}

                            <div className="h-[1px] bg-gray-50 mx-6 my-2"></div>

                            <button onClick={() => signOut({ callbackUrl: '/' })} className="w-full text-left px-6 py-3 text-[10px] font-black uppercase text-red-500 hover:bg-red-50 transition-colors">
                                Cerrar sesión
                            </button>
                        </div>
                    )}
                </div>
            </div>
        </nav>
    )
}