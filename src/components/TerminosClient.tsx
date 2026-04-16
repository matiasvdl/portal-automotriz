'use client'

import { useSettings } from '@/context/SettingsContext'

export default function TerminosClient() {
    // 1. Obtenemos los datos que el Layout ya cargó desde Sanity
    const { config, appearance } = useSettings()

    // 2. Usamos el nombre de marca configurado
    const nombreSitio = appearance?.brandName || config?.siteName || ''

    return (
        <div className="antialiased text-black font-sans no-scrollbar">
            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
                <header className="mb-8 text-left leading-none">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">
                        Información Legal
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        Términos y Condiciones
                    </h1>
                </header>

                {/* Tarjeta blanca estilo VDL MOTORS */}
                <div className="max-w-7xl bg-white rounded-[25px] border border-gray-100 p-8 md:p-12 shadow-none">
                    {config?.termsAndConditions ? (
                        <div className="whitespace-pre-line text-zinc-600 text-[12px] font-medium leading-relaxed tracking-tight">
                            {config.termsAndConditions}
                        </div>
                    ) : (
                        <div className="py-10 text-center leading-none">
                            <p className="text-[10px] font-black text-zinc-300 uppercase italic tracking-widest leading-none">
                                El contenido legal está siendo actualizado para {nombreSitio}
                            </p>
                        </div>
                    )}
                </div>

                {/* Pie de página con la fecha de Sanity */}
                <p className="mt-8 px-4 text-[9px] font-bold text-zinc-400 uppercase tracking-tight italic leading-none">
                    Última actualización: {config?.lastLegalUpdate || '2026'} • {nombreSitio}
                </p>
            </main>
        </div>
    )
}
