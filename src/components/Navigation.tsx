'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/context/SettingsContext'
import { urlFor } from '@/sanity/lib/image'
import {
    resolveBrandLabel,
    resolveBrandTextParts,
    resolveLogoMaxHeightPx,
    resolvePrimaryColor,
} from '@/lib/content-defaults'

interface NavigationLink {
    title: string
    path: string
}

interface NavigationConfig {
    navMenu?: NavigationLink[]
    siteName?: string | null
    branchesPageEnabled?: boolean
}

export default function Navigation({ config: propConfig }: { config?: NavigationConfig }) {
    const { appearance, config: contextConfig } = useSettings()
    const [isMenuOpen, setIsMenuOpen] = useState(false)
    const config = (propConfig || contextConfig) as NavigationConfig
    const primaryColor = resolvePrimaryColor(appearance?.primaryColor)

    const baseMenuItems: NavigationLink[] = (config?.navMenu?.length ?? 0) > 0 ? config.navMenu ?? [] : [
        { title: 'Comprar un auto', path: '/catalogo' },
        { title: 'Vende tu auto', path: '/vender' },
        { title: 'Financiamiento', path: '/financiamiento' },
    ]
    const menuItems = baseMenuItems.filter((item) => item.path !== '/sucursales')

    const brandName = resolveBrandLabel(appearance, config)
    const { splitText, isJoined, firstWord, displayName, restText } = resolveBrandTextParts(brandName, {
        splitText: appearance?.splitText,
        isJoined: appearance?.isJoined,
    })

    const renderTextLogo = () => {
        if (!splitText) return <span>{displayName}</span>

        return (
            <>
                {firstWord}
                {restText ? (
                    <span
                        className={`font-light text-zinc-700 ${isJoined ? 'ml-0' : 'ml-1'}`}
                    >
                        {restText}
                    </span>
                ) : null}
            </>
        )
    }

    const logoUrl = appearance?.logo ? urlFor(appearance.logo).url() : null
    const logoMaxH = resolveLogoMaxHeightPx(appearance?.logoWidth)

    return (
        <nav className="sticky top-0 z-50 flex h-20 items-center overflow-visible border-b border-gray-100 bg-white text-left font-sans shadow-none">
            <div className="mx-auto flex w-full max-w-7xl items-center justify-between px-6">
                <div className="flex min-w-0 flex-1 items-center justify-start lg:flex-none">
                    <Link href="/" className="flex items-center text-2xl font-black italic uppercase tracking-tighter text-black">
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
                                    sizes={`(max-width: 1024px) 50vw, ${logoMaxH}px`}
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
                            renderTextLogo()
                        )}
                    </Link>
                </div>

                <div className="hidden gap-12 lg:flex">
                    {menuItems.map((link, i: number) => (
                        <Link
                            key={i}
                            href={link.path || '#'}
                            className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333] transition-colors hover:text-black"
                        >
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center gap-4">
                    <Link
                        href="/contacto"
                        className="hidden rounded-full px-6 py-3.5 text-[9px] font-black uppercase tracking-[0.2em] text-white shadow-lg shadow-black/5 transition-all active:scale-95 lg:block"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Contacto
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="p-2 text-black transition-all lg:hidden"
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 8h16M4 16h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {isMenuOpen && (
                <div className="animate-in slide-in-from-top absolute left-0 top-20 z-40 flex w-full flex-col gap-6 border-b border-gray-100 bg-white p-6 shadow-xl duration-300 lg:hidden">
                    {menuItems.map((link, i: number) => (
                        <Link
                            key={i}
                            href={link.path || '#'}
                            onClick={() => setIsMenuOpen(false)}
                            className="text-[11px] font-black uppercase tracking-[0.2em] text-[#333333]"
                        >
                            {link.title}
                        </Link>
                    ))}
                    <hr className="border-gray-50" />
                    <Link
                        href="/contacto"
                        onClick={() => setIsMenuOpen(false)}
                        className="rounded-2xl py-4 text-center text-[10px] font-black uppercase tracking-[0.2em] text-white"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Contáctanos
                    </Link>
                </div>
            )}
        </nav>
    )
}
