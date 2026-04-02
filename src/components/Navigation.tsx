'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'

export default function Navigation({ config: propConfig }: { config?: any }) {
    const { appearance, config: contextConfig } = useSettings();
    const [isMenuOpen, setIsMenuOpen] = useState(false); // Estado para el menú móvil
    const config = propConfig || contextConfig;

    const menuItems = config?.navMenu?.length > 0 ? config.navMenu : [
        { title: 'Comprar un auto', path: '/catalogo' },
        { title: 'Vende tu auto', path: '/vender' },
        { title: 'Financiamiento', path: '/financiamiento' }
    ];

    // --- LÓGICA DE MARCA (MANTENIDA IDÉNTICA) ---
    const brandName = appearance?.brandName?.trim() || "VDL GROUP";
    const splitText = appearance?.splitText !== false;
    const isJoined = appearance?.isJoined === true;

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
                <span className={`font-light text-zinc-700 ${isJoined ? 'ml-0' : 'ml-1'}`}>
                    {restOfName}
                </span>
            </>
        );
    };

    const logoUrl = appearance?.logo?.asset?._ref
        ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${appearance.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}`
        : null;

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left font-sans">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                {/* LOGO */}
                <div className="flex items-center">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} className="h-8 w-auto object-contain" />
                        ) : (
                            renderTextLogo()
                        )}
                    </Link>
                </div>

                {/* ENLACES DESKTOP (LG) */}
                <div className="hidden lg:flex gap-12">
                    {menuItems.map((link: any, i: number) => (
                        <Link key={i} href={link.path || '#'} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333] hover:text-black transition-colors">
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* BOTÓN CONTACTO Y HAMBURGUESA */}
                <div className="flex items-center gap-4">
                    {/* Botón Ingresar: Se oculta en móvil para no saturar, se verá dentro del menú desplegable */}
                    <Link href="/contacto" className="hidden lg:block bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3.5 rounded-full hover:bg-zinc-800 transition-all active:scale-95">
                        Contacto
                    </Link>

                    {/* BOTÓN HAMBURGUESA (SÓLO MÓVIL) */}
                    <button
                        onClick={() => setIsMenuOpen(!isMenuOpen)}
                        className="lg:hidden p-2 text-black transition-all"
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
                    <Link
                        href="/contacto"
                        onClick={() => setIsMenuOpen(false)}
                        className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-2xl text-center"
                    >
                        Contáctanos
                    </Link>
                </div>
            )}
        </nav>
    )
}