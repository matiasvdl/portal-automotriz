'use client'

import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext' // Importamos el contexto

export default function Footer({ config: propConfig }: { config?: any }) {
    // 1. Obtenemos la apariencia y la configuración del contexto
    const { appearance, config: contextConfig } = useSettings();
    const config = propConfig || contextConfig;

    // --- LÓGICA DE MARCA DINÁMICA (Igual que en Navigation) ---
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

                {/* 1. Logo dinámico, descripción y Redes Sociales */}
                <div className="md:col-span-4 space-y-6">
                    <div className="space-y-4">
                        {/* El Logo ahora es dinámico según Sanity */}
                        <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase text-white block">
                            {renderTextLogo()}
                        </Link>

                        <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                            {config?.footerDescription}
                        </p>
                    </div>

                    {/* Iconos de Redes Sociales dinámicos */}
                    <div className="flex gap-5 pt-2">
                        {config?.instagram && (
                            <a href={config.instagram} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-all hover:scale-110">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.162 6.162 6.162 6.162-2.759 6.162-6.162-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z" />
                                </svg>
                            </a>
                        )}
                        {config?.facebook && (
                            <a href={config.facebook} target="_blank" rel="noopener noreferrer" className="text-zinc-400 hover:text-white transition-all hover:scale-110">
                                <svg className="w-5 h-5 fill-current" viewBox="0 0 24 24">
                                    <path d="M9 8h-3v4h3v12h5v-12h3.642l.358-4h-4v-1.667c0-.955.192-1.333 1.115-1.333h2.885v-5h-3.808c-3.596 0-5.192 1.583-5.192 4.615v3.385z" />
                                </svg>
                            </a>
                        )}
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