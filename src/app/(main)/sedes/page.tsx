'use client'

import { useSettings } from '@/context/SettingsContext'

export default function SedesPage() {
    const { contact } = useSettings()

    return (
        <div className="min-h-screen bg-[#F7F8FA] antialiased text-black font-sans">

            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">

                <header className="mb-8 text-left">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">
                        Presencia VDL
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        Nuestras Sedes
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* COLUMNA PRINCIPAL */}
                    <div className="lg:col-span-7 space-y-8 order-2 lg:order-1">

                        {/* CARD: OPERACIÓN ONLINE */}
                        <div className="bg-white rounded-[25px] border border-gray-100 p-8 shadow-none relative overflow-hidden">
                            {/* Icono de fondo renovado: Monitor/Digital */}
                            <div className="absolute top-0 right-0 p-8 opacity-[0.03]">
                                <svg className="w-32 h-32" fill="none" stroke="currentColor" strokeWidth="1.5" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" d="M9 17.25v1.007a3 3 0 01-.879 2.122L7.5 21h9l-.621-.621A3 3 0 0115 18.257V17.25m6-12V15a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 15V5.25m18 0A2.25 2.25 0 0018.75 3H5.25A2.25 2.25 0 003 5.25m18 0V12a2.25 2.25 0 01-2.25 2.25H5.25A2.25 2.25 0 013 12V5.25" />
                                </svg>
                            </div>

                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black border-b border-gray-50 pb-5 leading-none mb-6">
                                01. Modelo 100% Digital
                            </h3>
                            <p className="text-[13px] font-medium text-zinc-600 leading-relaxed mb-6">
                                En VDL Motors hemos evolucionado. Actualmente operamos bajo un modelo **100% Online**, lo que nos permite reducir costos operativos y ofrecerte **mejores precios de mercado** y una gestión mucho más ágil.
                            </p>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <SedeFeature title="Atención a Domicilio" desc="Inspeccionamos y entregamos vehículos directamente en tu hogar." />
                                <SedeFeature title="Gestión Remota" desc="Financiamiento y trámites notariales sin que tengas que moverte." />
                            </div>
                        </div>

                        {/* CARD: REGIÓN DE O'HIGGINS */}
                        <div className="bg-white rounded-[25px] border border-gray-100 p-8 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-black border-b border-gray-50 pb-5 leading-none mb-6">
                                02. Zona de Operación Principal
                            </h3>
                            <div className="flex items-start gap-6">
                                {/* Icono de mapa refinado */}
                                <div className="w-12 h-12 bg-[#F7F8FA] rounded-2xl flex items-center justify-center shrink-0">
                                    <svg className="w-5 h-5 text-black" fill="none" stroke="currentColor" strokeWidth="2.5" viewBox="0 0 24 24">
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M15 10.5a3 3 0 11-6 0 3 3 0 016 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1115 0z" />
                                    </svg>
                                </div>
                                <div>
                                    <h4 className="text-[14px] font-black uppercase tracking-tight mb-2">Región de O'Higgins</h4>
                                    <p className="text-[12px] font-medium text-zinc-500 leading-relaxed italic">
                                        "Nuestro foco estratégico de expansión se encuentra en la VI Región. Contamos con cobertura prioritaria en **Rancagua, Machalí, San Fernando y alrededores**, garantizando visitas técnicas en menos de 24 horas."
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* BARRA LATERAL */}
                    <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-none">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 italic leading-none">¿Quieres agendar una visita?</h4>
                            <p className="text-[11px] font-medium text-zinc-500 leading-relaxed mb-8">
                                Si estás en la Región de O'Higgins o Santiago, coordinamos la revisión del vehículo en el lugar que más te acomode.
                            </p>

                            <a
                                href={`https://wa.me/${contact.whatsapp || "569XXXXXXXX"}`}
                                target="_blank"
                                className="block w-full bg-black text-white text-center font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95"
                            >
                                Agendar con un Ejecutivo
                            </a>
                        </div>

                        <div className="bg-zinc-900 rounded-[25px] p-6 text-white shadow-none flex items-center gap-4">
                            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <p className="text-[10px] font-black uppercase tracking-widest">Atención Flexible</p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">Nos adaptamos a tus horarios</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

function SedeFeature({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-1.5 text-left">
            <h5 className="text-[9px] font-black uppercase text-black tracking-wider">{title}</h5>
            <p className="text-[10px] font-medium text-zinc-400 leading-tight">{desc}</p>
        </div>
    )
}