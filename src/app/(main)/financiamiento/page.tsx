'use client'

import { useState } from 'react'

/**
 * BUENA PRÁCTICA: Centralización de datos de contacto.
 * Permite cambiar el número de WhatsApp en un solo lugar para todo el sitio.
 */
const WHATSAPP_NUMBER = "569XXXXXXXX"

export default function FinanciamientoPage() {
    const [formData, setFormData] = useState({
        rut: '',
        name: '',
        phone: '',
        income: '',
        carInterest: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // BUENA PRÁCTICA: Mensaje estructurado para facilitar la preventa al ejecutivo.
        const message = `Hola VDL Motors! Solicito evaluación de financiamiento.%0A- Nombre: ${formData.name}%0A- RUT: ${formData.rut}%0A- Renta: ${formData.income}%0A- Auto de interés: ${formData.carInterest}`
        window.open(`https://wa.me/${WHATSAPP_NUMBER}?text=${message}`, '_blank')
    }

    return (
        <div className="bg-white min-h-screen pt-20 pb-10 antialiased text-black font-sans">
            <div className="max-w-4xl mx-auto px-6">

                {/* HEADER: Estilo coherente con el catálogo */}
                <header className="mb-12">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1 italic">
                        Aprobación en Minutos
                    </p>
                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight">
                        Crédito <span className="font-light text-zinc-400">Automotriz</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* FORMULARIO DE EVALUACIÓN */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">

                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black border-b border-gray-100 pb-3">
                                01. Datos del Solicitante
                            </h3>
                            <div className="space-y-5">
                                <InputField label="Nombre Completo" name="name" placeholder="Ej: Juan Pérez" value={formData.name} onChange={handleChange} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="RUT" name="rut" placeholder="12.345.678-9" value={formData.rut} onChange={handleChange} />
                                    <InputField label="Teléfono / WhatsApp" name="phone" placeholder="+56 9" value={formData.phone} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black border-b border-gray-100 pb-3">
                                02. Información Financiera
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Renta Líquida Aprox." name="income" placeholder="Ej: 900.000" value={formData.income} onChange={handleChange} />
                                <InputField label="Auto que te interesa" name="carInterest" placeholder="Ej: Mercedes G63" value={formData.carInterest} onChange={handleChange} />
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-black text-white text-center font-bold text-[12px] uppercase tracking-[0.15em] py-5 rounded-2xl hover:bg-zinc-800 transition-all shadow-sm active:scale-[0.98]"
                            >
                                Solicitar Evaluación Previa
                            </button>
                        </div>
                    </form>

                    {/* BARRA LATERAL: Beneficios y Requisitos (Igual que el Aside de detalles) */}
                    <aside className="lg:col-span-5">
                        <div className="sticky top-32 space-y-5">
                            <div className="bg-[#FBFBFB] rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-black mb-6 italic">
                                    Requisitos Básicos
                                </h4>
                                <div className="space-y-6">
                                    <FeatureItem
                                        title="Antigüedad Laboral"
                                        desc="Mínimo 1 año de continuidad laboral o 2 años si eres independiente."
                                    />
                                    <FeatureItem
                                        title="Renta Mínima"
                                        desc="Se requiere una renta líquida desde $500.000 para evaluación."
                                    />
                                    <FeatureItem
                                        title="Comportamiento"
                                        desc="Sin registros comerciales vigentes (Dicom)."
                                    />
                                </div>

                                <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">
                                        Cotiza en línea vía WhatsApp
                                    </p>
                                    <p className="text-[11px] font-black text-black uppercase italic">Evaluación 100% Digital</p>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>
        </div>
    )
}

/**
 * COMPONENTE: InputField
 * Estilo VDL: Etiquetas en gris claro, inputs en fondo gris suave.
 */
function InputField({ label, name, placeholder, value, onChange, type = "text" }: any) {
    return (
        <div className="flex flex-col space-y-2">
            <label className="text-[10px] font-black uppercase tracking-tight text-gray-400 ml-1">
                {label}
            </label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className="bg-[#FBFBFB] border border-gray-100 px-5 py-4 rounded-2xl text-[13px] font-bold uppercase tracking-tight focus:outline-none focus:border-black transition-colors placeholder:text-zinc-300 placeholder:font-normal placeholder:normal-case"
            />
        </div>
    )
}

/**
 * COMPONENTE: FeatureItem
 */
function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-black uppercase text-black tracking-tight">
                {title}
            </p>
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                {desc}
            </p>
        </div>
    )
}