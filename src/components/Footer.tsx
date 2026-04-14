'use client'

import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext' // Importamos el contexto

export default function Footer({ config: propConfig }: { config?: any }) {
    // 1. Obtenemos la apariencia y la configuración del contexto
    const { appearance, config: contextConfig } = useSettings();
    const config = propConfig || contextConfig;

    // --- LÓGICA DE MARCA DINÁMICA ---
    const brandName = appearance?.brandName?.trim() || "VDL MOTORS";
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
                <span className={`font-light text-zinc-500 ${isJoined ? 'ml-0' : 'ml-1'}`}>
                    {restOfName}
                </span>
            </>
        );
    };

    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12 text-left">

                {/* 1. Logo dinámico y descripción */}
                <div className="md:col-span-4 space-y-6">
                    <div className="space-y-4">
                        <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase text-white block">
                            {renderTextLogo()}
                        </Link>

                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                            {config?.footerDescription}
                        </p>
                    </div>
                </div>

                {/* 2. Enlaces Columna 1 */}
                <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
                    {config?.footerLinks?.slice(0, 3).map((link: any, i: number) => (
                        <Link key={i} href={link.path || '#'} className="block hover:text-white transition-colors">
                            {link.title}
                        </Link>
                    ))}
                </div>

                {/* 3. Enlaces Columna 2 + Selector de País */}
                <div className="md:col-span-3 space-y-4 text-sm font-medium text-gray-400">
                    {config?.footerLinks?.slice(3).map((link: any, i: number) => (
                        <Link key={i} href={link.path || '#'} className="block hover:text-white transition-colors">
                            {link.title}
                        </Link>
                    ))}
                    <div className="flex items-center gap-2 pt-4 opacity-50 text-white">
                        <span className="text-[10px] font-bold border border-white px-1.5 py-0.5 rounded uppercase tracking-tighter">CL</span>
                        <span className="text-sm font-normal">Chile</span>
                    </div>
                </div>
            </div>

            {/* 4. Barra final: Copyright dinámico */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex flex-col md:flex-row justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em] gap-4">
                <Link
                    href="/admin/ingresar"
                    className="cursor-default hover:text-gray-500 transition-none ml-0.5"
                >
                    <p className="text-center md:text-left select-none">
                        © 2026 {config?.siteName || brandName} | TODOS LOS DERECHOS RESERVADOS
                    </p>
                </Link>

                <p className="hidden md:block italic font-medium text-white uppercase tracking-normal">
                    {config?.footerTagline || ""}
                </p>
            </div>
        </footer>
    )
}