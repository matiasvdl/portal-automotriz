'use client'

import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'

export default function Navigation({ config: propConfig }: { config?: any }) {
    const { appearance, config: contextConfig } = useSettings();
    const config = propConfig || contextConfig;

    const menuItems = config?.navMenu?.length > 0 ? config.navMenu : [
        { title: 'Comprar un auto', path: '/catalogo' },
        { title: 'Vende tu auto', path: '/vender' },
        { title: 'Financiamiento', path: '/financiamiento' }
    ];

    // LÓGICA SIMPLIFICADA: Solo marca o VDL GROUP (Ignoramos SEO)
    const brandName = appearance?.brandName?.trim() || "VDL GROUP";

    const nameParts = brandName.split(" ");
    const firstWord = nameParts[0];
    const secondPart = nameParts.slice(1).join(" ");

    const logoUrl = appearance?.logo?.asset?._ref
        ? `https://cdn.sanity.io/images/${process.env.NEXT_PUBLIC_SANITY_PROJECT_ID}/${process.env.NEXT_PUBLIC_SANITY_DATASET}/${appearance.logo.asset._ref.replace('image-', '').replace('-png', '.png').replace('-jpg', '.jpg').replace('-webp', '.webp')}`
        : null;

    return (
        <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left font-sans">
            <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                <div className="flex items-center">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        {logoUrl ? (
                            <img src={logoUrl} alt={brandName} className="h-8 w-auto object-contain" />
                        ) : (
                            <>
                                {firstWord}<span className="font-light text-zinc-700 ml-1">{secondPart}</span>
                            </>
                        )}
                    </Link>
                </div>

                <div className="hidden lg:flex gap-12">
                    {menuItems.map((link: any, i: number) => (
                        <Link key={i} href={link.path || '#'} className="text-[10px] font-black uppercase tracking-[0.2em] text-[#333333] hover:text-black transition-colors">
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="flex items-center">
                    <Link href="/admin/ingresar" className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-8 py-3.5 rounded-full hover:bg-zinc-800 transition-all active:scale-95">
                        Ingresar
                    </Link>
                </div>
            </div>
        </nav>
    )
}