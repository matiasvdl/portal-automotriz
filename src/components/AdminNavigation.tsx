'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useEffect } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { usePathname, useRouter } from 'next/navigation'
import { useSession, signOut } from 'next-auth/react'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import { useSettings } from '@/context/SettingsContext'
import { resolveBrandLabel, resolveBrandTextParts, resolveLogoMaxHeightPx } from '@/lib/content-defaults'

interface NavigationUserData {
    image?: { asset?: unknown }
    firstName?: string
}

export default function AdminNavigation() {
    const { data: session } = useSession()
    const { appearance, config } = useSettings()
    const pathname = usePathname()
    const router = useRouter()
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const [userData, setUserData] = useState<NavigationUserData | null>(null)

    useEffect(() => {
        const fetchUserData = async () => {
            if (session?.user?.email) {
                const data = await client.fetch<NavigationUserData | null>(
                    `*[_type == "adminProfile" && email == $email][0]{firstName, image}`,
                    { email: session.user.email }
                )
                setUserData(data)
            }
        }
        fetchUserData()
    }, [session])

    const userDisplayName = userData?.firstName || session?.user?.name?.split(' ')[0] || 'Admin'
    const initial = userDisplayName.charAt(0).toUpperCase()
    const brandName = resolveBrandLabel(appearance, config)
    const { splitText, isJoined, firstWord, displayName, restText } = resolveBrandTextParts(brandName, {
        splitText: appearance?.splitText,
        isJoined: appearance?.isJoined,
    })
    const logoUrl = appearance?.logo ? urlFor(appearance.logo).url() : null
    const logoMaxH = resolveLogoMaxHeightPx(appearance?.logoWidth)

    // IMPORTANTE: Extraemos el rol de la sesión
    const userRole = session?.user?.role

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 flex items-center no-scrollbar">
            <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center relative">

                {/* Logo */}
                <div className="flex items-center">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic uppercase tracking-tighter text-black flex items-center">
                        {logoUrl ? (
                            <div
                                className="relative flex max-w-full shrink-0 items-center justify-start"
                                style={{ maxHeight: logoMaxH }}
                            >
                                <Image
                                    src={logoUrl}
                                    alt={brandName}
                                    width={logoMaxH}
                                    height={logoMaxH}
                                    sizes={`${logoMaxH}px`}
                                    className="h-auto w-auto max-h-full max-w-full object-contain object-left"
                                    style={{
                                        maxHeight: logoMaxH,
                                        maxWidth: '100%',
                                        width: 'auto',
                                        height: 'auto',
                                    }}
                                    priority
                                />
                            </div>
                        ) : (
                            splitText ? (
                                <>
                                    {firstWord}
                                    {restText ? <span className={`font-light text-zinc-700${isJoined ? '' : ' ml-1'}`}>{restText}</span> : null}
                                </>
                            ) : (
                                displayName
                            )
                        )}
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
                                {userDisplayName}
                            </p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Panel Admin</p>
                        </div>

                        <div className="w-10 h-10 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black shrink-0 overflow-hidden border border-gray-100 shadow-sm">
                            {userData?.image ? (
                                <img src={urlFor(userData.image).url()} className="w-full h-full object-cover" alt={userDisplayName} />
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

                            {/* ADMINISTRACIÓN: Solo Admin Principal */}
                            {userRole === 'Administrador Principal' && (
                                <button
                                    onClick={() => { setIsUserMenuOpen(false); router.push('/admin/administracion') }}
                                    className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase transition-colors ${pathname === '/admin/administracion' ? 'bg-[#F7F8FA] text-black' : 'text-zinc-700 hover:bg-[#F7F8FA]'}`}
                                >
                                    Administración
                                </button>
                            )}

                            {/* PREFERENCIAS: Admin Principal Y Administrador */}
                            {(userRole === 'Administrador Principal' || userRole === 'Administrador') && (
                                <button
                                    onClick={() => { setIsUserMenuOpen(false); router.push('/admin/preferencias') }}
                                    className={`w-full text-left px-6 py-3 text-[10px] font-black uppercase transition-colors ${pathname === '/admin/preferencias' ? 'bg-[#F7F8FA] text-black' : 'text-zinc-700 hover:bg-[#F7F8FA]'}`}
                                >
                                    Preferencias
                                </button>
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
