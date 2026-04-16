'use client'

import { useState, useEffect } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { client } from '@/sanity/lib/client'

interface FaqItem {
    _id: string
    question: string
    answer: string
}

export default function FAQClient() {
    const { contact, appearance, config } = useSettings()
    const primaryColor = appearance?.primaryColor || '#000000'

    const [openIndex, setOpenIndex] = useState<number | null>(0)
    const [faqs, setFaqs] = useState<FaqItem[]>([])

    useEffect(() => {
        const fetchFaqs = async () => {
            try {
                const data = await client.fetch<FaqItem[]>(`*[_type == "faq"] | order(order asc)`)
                if (data) setFaqs(data)
            } catch (error) {
                console.error('Error cargando FAQs:', error)
            }
        }
        fetchFaqs()
    }, [])

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
                    <div className="lg:col-span-7 space-y-4 order-2 lg:order-1">
                        {faqs.length > 0 ? (
                            faqs.map((faq, index) => (
                                <div
                                    key={faq._id || index}
                                    className="bg-white rounded-[25px] border border-gray-100 overflow-hidden transition-all shadow-none"
                                >
                                    <button
                                        onClick={() => setOpenIndex(openIndex === index ? null : index)}
                                        className="w-full p-6 text-left flex justify-between items-center group"
                                    >
                                        <span
                                            className="text-[11px] font-black uppercase tracking-wider transition-colors leading-tight"
                                            style={{ color: openIndex === index ? primaryColor : 'black' }}
                                        >
                                            {faq.question}
                                        </span>
                                        <svg
                                            className={`w-4 h-4 transition-transform duration-300 ${openIndex === index ? 'rotate-180' : 'text-zinc-300'}`}
                                            style={openIndex === index ? { color: primaryColor } : {}}
                                            fill="none" stroke="currentColor" viewBox="0 0 24 24"
                                        >
                                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                                        </svg>
                                    </button>

                                    <div
                                        className={`transition-all duration-300 ease-in-out ${openIndex === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'}`}
                                    >
                                        <div className="px-6 pb-6 text-[12px] font-medium text-zinc-500 leading-relaxed italic">
                                            &quot;{faq.answer}&quot;
                                        </div>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="bg-white rounded-[25px] p-10 text-center border border-gray-50">
                                <p className="text-[10px] font-black uppercase text-zinc-300 tracking-widest">Cargando preguntas frecuentes...</p>
                            </div>
                        )}
                    </div>

                    <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-none">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 leading-none">
                                {config?.faqContent?.ctaTitle?.trim() || '¿Aún tienes dudas?'}
                            </h4>
                            <p className="text-[11px] font-medium text-zinc-500 leading-relaxed mb-8">
                                {config?.faqContent?.ctaDescription?.trim() || 'Si no encuentras la respuesta que buscas, nuestro equipo de expertos está listo para asesorarte de forma personalizada.'}
                            </p>

                            <div className="space-y-4">
                                <a
                                    href={`https://wa.me/${contact.whatsapp.replace(/\D/g, '')}`}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="block w-full text-white text-center font-black text-[9px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl transition-all active:scale-95"
                                    style={{
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 20px 25px -5px ${primaryColor}33`
                                    }}
                                >
                                    {config?.faqContent?.ctaButtonLabel?.trim() || 'Hablar con un asesor'}
                                </a>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[25px] p-6 text-white shadow-none flex items-center gap-4">
                            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <p className="text-[10px] font-black uppercase tracking-widest">{config?.faqContent?.trustTitle?.trim() || 'Compra Protegida'}</p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">{config?.faqContent?.trustSubtitle?.trim() || 'Seguridad en cada paso del proceso'}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}
