'use client'

import { useState } from 'react'
import { useSettings } from '@/context/SettingsContext'

export default function FAQPage() {
    const { contact } = useSettings()
    const [openIndex, setOpenIndex] = useState<number | null>(0)

    const faqs = [
        {
            question: "¿Cuáles son los requisitos para el financiamiento?",
            answer: "Los requisitos básicos incluyen ser mayor de 24 años, contar con al menos 1 año de antigüedad laboral, una renta líquida desde $500.000 y no tener deudas comerciales vigentes (Dicom)."
        },
        {
            question: "¿Reciben autos en parte de pago?",
            answer: "Sí, recibimos vehículos en parte de pago previa tasación. El auto debe estar en buen estado mecánico y con su documentación al día."
        },
        {
            question: "¿Cuánto demora el proceso de compra?",
            answer: "Si la compra es al contado, la transferencia puede quedar lista en el mismo día. En caso de financiamiento, la aprobación suele demorar entre 30 minutos a 2 horas hábiles."
        },
        {
            question: "¿Los autos cuentan con garantía?",
            answer: "Todos nuestros vehículos pasan por una rigurosa inspección de 150 puntos y cuentan con garantía mecánica legal. También ofrecemos opciones de extensión de garantía."
        },
        {
            question: "¿Realizan envíos a regiones?",
            answer: "Sí, coordinamos el despacho de vehículos a todo Chile a través de empresas de transporte especializadas. El costo varía según la ciudad de destino."
        }
    ]

    return (
        <div className="min-h-screen bg-[#F7F8FA] antialiased text-black font-sans">

            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">

                <header className="mb-8 text-left">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">
                        Centro de ayuda
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        Preguntas frecuentes
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    {/* SECCIÓN DE ACORDEONES */}
                    <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
                        {faqs.map((faq, index) => (
                            <div
                                key={index}
                                className="bg-white rounded-[25px] border border-gray-100 overflow-hidden transition-all shadow-none"
                            >
                                <button
                                    onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                    className="w-full p-6 text-left flex justify-between items-center group"
                                >
                                    <span className="text-[11px] font-black uppercase tracking-wider text-black group-hover:text-zinc-500 transition-colors leading-tight">
                                        {faq.question}
                                    </span>
                                    <svg
                                        className={`w-4 h-4 text-zinc-300 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : ''}`}
                                        fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                    >
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </button>

                                <div
                                    className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                >
                                    <div className="px-6 pb-6 text-[12px] font-medium text-zinc-500 leading-relaxed italic">
                                        "{faq.answer}"
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* BARRA LATERAL INFORMATIVA */}
                    <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-none">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 italic leading-none">
                                ¿Aún tienes dudas?
                            </h4>
                            <p className="text-[11px] font-medium text-zinc-500 leading-relaxed mb-8">
                                Si no encuentras la respuesta que buscas, nuestro equipo de expertos está listo para asesorarte de forma personalizada.
                            </p>

                            <div className="space-y-4">
                                <a
                                    href={`https://wa.me/${contact.whatsapp || "569XXXXXXXX"}`}
                                    target="_blank"
                                    className="block w-full bg-black text-white text-center font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95"
                                >
                                    Hablar con un asesor
                                </a>
                                <div className="text-center">
                                    <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-[0.1em]">Tiempo medio de respuesta</p>
                                    <p className="text-[10px] font-black text-black uppercase mt-1 leading-none">Menos de 15 minutos</p>
                                </div>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[25px] p-6 text-white shadow-none flex items-center gap-4">
                            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <p className="text-[10px] font-black uppercase tracking-widest">Compra Protegida</p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">Seguridad en cada paso del proceso</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}