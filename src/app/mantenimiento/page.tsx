'use client'

import Link from 'next/link'

export default function MantenimientoPage() {
    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center justify-center p-6 text-center">
            {/* BRANDING */}
            <div className="text-4xl font-black italic tracking-tighter uppercase mb-12">
                VDL<span className="font-light text-zinc-500">MOTORS</span>
            </div>

            {/* MENSAJE PRINCIPAL */}
            <div className="space-y-4 mb-12">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 leading-none">Ajustes de inventario</p>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                    VOLVEMOS<br />PRONTO.
                </h1>
            </div>

            {/* CUADRO DE INFO */}
            <div className="max-w-md bg-[#F7F8FA] rounded-[30px] p-8 border border-gray-100">
                <p className="text-xs font-bold leading-relaxed text-zinc-600 mb-6">
                    Estamos actualizando nuestro catálogo para ofrecerte los mejores vehículos seminuevos de Santiago.
                </p>
                <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">Contacto Directo</p>
                    <p className="text-sm font-black italic tracking-tight uppercase">contacto@vdlmotors.cl</p>
                </div>
            </div>

            {/* FOOTER DISCRETO */}
            <div className="fixed bottom-10">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">© 2026 VDL Motors SpA</p>
            </div>
        </div>
    )
}