'use client'

import Link from 'next/link'

export default function Footer({ config }: { config?: any }) {
    return (
        <footer className="bg-black text-white pt-16 pb-8 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-6 grid grid-cols-1 md:grid-cols-12 gap-16 mb-12 text-left">

                {/* 1. Logo y descripción bajo el logo */}
                <div className="md:col-span-4 space-y-4">
                    <span className="text-2xl font-black italic tracking-tighter uppercase text-white">
                        VDL<span className="font-light text-zinc-500">MOTORS</span>
                    </span>
                    <p className="text-zinc-400 text-sm leading-relaxed max-w-xs font-medium">
                        {config?.footerDescription}
                    </p>
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

            {/* 4. Barra final: Copyright y frase dinámica en cursiva */}
            <div className="max-w-7xl mx-auto px-6 mt-16 pt-8 border-t border-white/10 flex justify-between items-center text-[10px] font-bold text-gray-500 uppercase tracking-[0.2em]">
                <p>© 2026 VDL MOTORS SPA | TODOS LOS DERECHOS RESERVADOS</p>
                <p className="italic font-medium text-white uppercase tracking-normal">
                    {config?.footerTagline || "TRANSFORMA TU CAMINO"}
                </p>
            </div>
        </footer>
    )
}