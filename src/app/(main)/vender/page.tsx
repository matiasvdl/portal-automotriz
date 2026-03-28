'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function VendeTuAutoPage() {
    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-20 no-scrollbar">
            <style jsx global>{`
                ::-webkit-scrollbar { display: none !important; }
                .main-scroll { height: 100vh; overflow-y: auto; scrollbar-width: none; }
            `}</style>

            <div className="main-scroll no-scrollbar">

                <main className="max-w-6xl mx-auto px-6 py-12 md:py-16">

                    {/* Header Alineado a la Izquierda */}
                    <header className="mb-12 text-left">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-1 italic leading-none">Gestión de Ventas</p>
                        <h1 className="text-3xl font-black uppercase tracking-tighter leading-none text-black">
                            Vende tu vehículo
                        </h1>
                        <p className="mt-4 text-[13px] text-zinc-500 font-medium max-w-xl leading-relaxed">
                            Completa los detalles de tu auto y nos pondremos en contacto contigo para una tasación oficial.
                        </p>
                    </header>

                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                        {/* Formulario Principal */}
                        <div className="lg:col-span-2 bg-white rounded-[30px] border border-gray-100 p-8 md:p-10 space-y-10">

                            {/* Sección 1 */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 border-b border-gray-50 pb-4 leading-none">1. Información del Auto</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <VenderInput label="Marca" placeholder="Ej: BMW" />
                                    <VenderInput label="Modelo" placeholder="Ej: X5" />
                                    <VenderInput label="Año" placeholder="2024" />
                                    <VenderInput label="Kilometraje" placeholder="10.000" />
                                    <VenderInput label="Versión / Motor" placeholder="xDrive 40i" />
                                    <VenderInput label="Patente" placeholder="ABCD12" />
                                </div>
                            </div>

                            {/* Sección 2 */}
                            <div className="space-y-6">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-800 border-b border-gray-50 pb-4 leading-none">2. Tus Datos</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <VenderInput label="Nombre Completo" placeholder="Matías Vidal" />
                                    <VenderInput label="WhatsApp" placeholder="+56 9..." />
                                </div>
                            </div>

                            <button className="w-full bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl shadow-black/5 hover:bg-zinc-900 transition-all active:scale-[0.99]">
                                Enviar Datos de Venta
                            </button>
                        </div>

                        {/* Sidebar de Beneficios - Versión Minimalista y Sobria */}
                        <aside className="space-y-6">
                            <div className="bg-white rounded-[35px] border border-gray-100 p-10 shadow-none">

                                {/* Título Principal Actualizado (Sin efecto) */}
                                <h4 className="text-[11px] font-black uppercase tracking-[0.2em] text-zinc-700 leading-none pb-4 border-b border-gray-50 mb-10">
                                    ¿Por qué vender con nosotros?
                                </h4>

                                {/* Estructura Limpia de Texto */}
                                <div className="space-y-10">
                                    <div>
                                        <p className="text-[13px] font-black uppercase tracking-tighter text-black mb-2">
                                            Tasación Rápida
                                        </p>
                                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                                            Respuesta en menos de <span className="text-black font-bold">24 horas hábiles</span> con una oferta real.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[13px] font-black uppercase tracking-tighter text-black mb-2">
                                            Pago Inmediato
                                        </p>
                                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                                            Transferencia directa y segura a tu cuenta una vez que el vehículo sea revisado.
                                        </p>
                                    </div>

                                    <div>
                                        <p className="text-[13px] font-black uppercase tracking-tighter text-black mb-2">
                                            Sin Trámites
                                        </p>
                                        <p className="text-[11px] font-medium text-zinc-500 leading-relaxed">
                                            Gestión documental completa. Nosotros nos encargamos de todo el <span className="text-black font-bold">papeleo legal</span>.
                                        </p>
                                    </div>
                                </div>

                                {/* Separación y Call to Action Sutil al final */}
                                <div className="mt-12 pt-8 border-t border-gray-50 flex flex-col items-center text-center">
                                    <p className="text-[9px] font-black text-zinc-400 uppercase tracking-widest mb-3">Atención Directa</p>
                                    <button className="text-[11px] font-black uppercase tracking-tighter border-b-2 border-black pb-1 hover:text-zinc-600 hover:border-zinc-300 transition-all">
                                        Cotiza vía WhatsApp →
                                    </button>
                                </div>
                            </div>
                        </aside>

                    </div>
                </main>

            </div>
        </div>
    )
}

function VenderInput({ label, placeholder }: { label: string; placeholder: string }) {
    return (
        <div className="flex flex-col space-y-2 text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
            <input
                type="text"
                placeholder={placeholder}
                className="w-full h-[48px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all text-black placeholder:text-zinc-300"
            />
        </div>
    )
}

function InfoItem({ title, desc }: { title: string; desc: string }) {
    return (
        <div className="leading-tight">
            <p className="text-[11px] font-black uppercase text-black mb-1 leading-none">{title}</p>
            <p className="text-[10px] font-medium text-zinc-500 leading-normal">{desc}</p>
        </div>
    )
}