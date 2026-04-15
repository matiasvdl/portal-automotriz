'use client'

import { useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { useSettings } from '@/context/SettingsContext'
import { urlFor } from '@/sanity/lib/image'
import {
    resolveBrandLabel,
    resolveLogoMaxHeightPx,
    resolvePrimaryColor,
} from '@/lib/content-defaults'

export default function Navigation({ config: propConfig }: { config?: any }) {
    // Obtenemos los datos de apariencia y configuración desde el contexto
    const { appearance, config: contextConfig } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false);
    const config = propConfig || contextConfig;

    // --- PASO A: Extraemos el color primario dinámico ---
    const primaryColor = resolvePrimaryColor(appearance?.primaryColor);

    // Definición de los elementos del menú de navegación
    const menuItems = config?.navMenu?.length > 0 ? config.navMenu : [
        { title: 'Comprar un auto', path: '/catalogo' },
        { title: 'Vende tu auto', path: '/vender' },
        { title: 'Financiamiento', path: '/financiamiento' }
    ];

    // --- LÓGICA DE MARCA ---
    const brandName = resolveBrandLabel(appearance, config);
    const splitText = appearance?.splitText !== false;
    const isJoined = appearance?.isJoined === true;

    /**
     * Renderiza el logo en formato texto basándose en la configuración de Sanity.
     * Ahora el color secundario del texto se ajusta al color de marca.
     */
    const renderTextLogo = () => {
        const displayName = isJoined ? brandName.replace(/\s+/g, '') : brandName;
        if (!splitText) return <span>{displayName}</span>;

        const firstWord = brandName.split(" ")[0];
        const restOfName = isJoined
            ? brandName.replace(/\s+/g, '').substring(firstWord.length)
            : brandName.substring(firstWord.length);

        return (
            <>
                {firstWord}
                {/* PASO A: El color del texto secundario del logo ahora es dinámico */}
                <span
                    className={`font-light ${isJoined ? 'ml-0' : 'ml-1'}`}
                    style={{ color: primaryColor }}
                >
                    {restOfName}
                </span>
            </>
        );
    };

    const logoUrl = appearance?.logo ? urlFor(appearance.logo).url() : null;
    const logoMaxH = resolveLogoMaxHeightPx(appearance?.logoWidth);

    return (
        <nav className="sticky top-0 z-50 flex h-20 items-center overflow-visible border-b border-gray-100 bg-white text-left font-sans shadow-none">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                {/* LOGO: altura máxima desde admin; ancho proporcional con object-contain */}
                <div className="flex min-w-0 flex-1 items-center justify-start lg:flex-none">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
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

                {/* ENLACES DESKTOP (LG) */}
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

                {/* BOTÓN CONTACTO Y HAMBURGUESA */}
                <div className="flex items-center gap-4">
                    {/* PASO A: Botón con color dinámico de marca */}
                    <Link
                        href="/contacto"
                        className="hidden lg:block text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3.5 rounded-full transition-all active:scale-95 shadow-lg shadow-black/5"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Contacto
                    </Link>

                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-black transition-all"
                        aria-label="Abrir menú"
                    >
                        {isMenuOpen ? (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                        ) : (
                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M4 8h16M4 16h16" /></svg>
                        )}
                    </button>
                </div>
            </div>

            {/* MENÚ MÓVIL DESPLEGABLE */}
            {isMenuOpen && (
                <div className="lg:hidden absolute top-20 left-0 w-full bg-white border-b border-gray-100 p-6 flex flex-col gap-6 animate-in slide-in-from-top duration-300 z-40 shadow-xl">
                    {menuItems.map((link: any, i: number) => (
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
                    {/* PASO A: Botón móvil con color dinámico */}
                    <Link
                        href="/contacto"
                        onClick={() => setIsMenuOpen(false)}
                        className="text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl text-center"
                        style={{ backgroundColor: primaryColor }}
                    >
                        Contáctanos
                    </Link>
                </div>
            )}
        </nav>
    )
}