'use client'

import { useState } from 'react'

/**
 * BUENA PRÁCTICA: Componentización interna para mantener el DRY (Don't Repeat Yourself).
 * Usamos InputField para asegurar que todos los campos sigan el diseño exacto de VDL.
 */
export default function VendeTuAutoPage() {
    const [formData, setFormData] = useState({
        make: '',
        model: '',
        year: '',
        mileage: '',
        name: '',
        phone: '',
        email: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        // BUENA PRÁCTICA: Codificar URI para evitar errores con caracteres especiales en WhatsApp.
        const message = `Hola VDL Motors! Quiero vender mi auto: ${formData.make} ${formData.model} (${formData.year}). Kilometraje: ${formData.mileage} KM. Mi contacto es ${formData.name}, Tel: ${formData.phone}`
        window.open(`https://wa.me/569XXXXXXXX?text=${encodeURIComponent(message)}`, '_blank')
    }

    return (
        <div className="bg-white min-h-screen pt-20 pb-10 antialiased text-black font-sans">
            <div className="max-w-4xl mx-auto px-6">

                {/* HEADER: Siguiendo el estilo de los títulos del detalle */}
                <header className="mb-12">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1 italic">
                        Tasación Profesional
                    </p>
                    <h1 className="text-4xl font-black uppercase tracking-tighter leading-tight">
                        Vende tu <span className="font-light text-zinc-400">Auto</span>
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">

                    {/* FORMULARIO: Estructura similar a la columna izquierda del detalle */}
                    <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-10">

                        {/* BLOQUE 1: VEHÍCULO */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black border-b border-gray-100 pb-3">
                                01. Información del Vehículo
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                <InputField label="Marca" name="make" placeholder="Ej: Mercedes Benz" value={formData.make} onChange={handleChange} />
                                <InputField label="Modelo" name="model" placeholder="Ej: G63 AMG" value={formData.model} onChange={handleChange} />
                                <InputField label="Año" name="year" placeholder="Ej: 2021" value={formData.year} onChange={handleChange} />
                                <InputField label="Kilometraje" name="mileage" placeholder="Ej: 45.000" value={formData.mileage} onChange={handleChange} />
                            </div>
                        </section>

                        {/* BLOQUE 2: CONTACTO */}
                        <section className="space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black border-b border-gray-100 pb-3">
                                02. Tus Datos de Contacto
                            </h3>
                            <div className="space-y-5">
                                <InputField label="Nombre Completo" name="name" placeholder="Tu nombre" value={formData.name} onChange={handleChange} />
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                    <InputField label="WhatsApp" name="phone" placeholder="+56 9" value={formData.phone} onChange={handleChange} />
                                    <InputField label="Email" name="email" type="email" placeholder="correo@ejemplo.cl" value={formData.email} onChange={handleChange} />
                                </div>
                            </div>
                        </section>

                        <div className="pt-4">
                            <button
                                type="submit"
                                className="w-full bg-black text-white text-center font-bold text-[12px] uppercase tracking-[0.15em] py-5 rounded-2xl hover:bg-zinc-800 transition-all shadow-sm active:scale-[0.98]"
                            >
                                Iniciar Tasación Online
                            </button>
                        </div>
                    </form>

                    {/* BARRA LATERAL INFORMATIVA: Estilo idéntico a la barra de precios/specs */}
                    <aside className="lg:col-span-5">
                        <div className="sticky top-32 space-y-5">
                            <div className="bg-[#FBFBFB] rounded-2xl p-8 border border-gray-100 shadow-sm">
                                <h4 className="text-[12px] font-black uppercase tracking-[0.2em] text-black mb-6">
                                    ¿Por qué VDL Motors?
                                </h4>
                                <div className="space-y-6">
                                    <FeatureItem
                                        title="Evaluación Virtual"
                                        desc="Tasamos tu auto sin que salgas de casa mediante fotos y video."
                                    />
                                    <FeatureItem
                                        title="Pago Inmediato"
                                        desc="Una vez acordado el precio, el pago es mediante transferencia directa."
                                    />
                                    <FeatureItem
                                        title="Gestión Documental"
                                        desc="Nos encargamos de todo el papeleo y trámites notariales."
                                    />
                                </div>
                                <div className="mt-10 pt-8 border-t border-gray-100 text-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-2">
                                        Cotiza en línea vía WhatsApp
                                    </p>
                                    <p className="text-[11px] font-black text-black uppercase">Atención Inmediata</p>
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
 * Reutiliza el diseño de los bloques de specs del detalle.
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
 * Mantiene la jerarquía visual de la marca.
 */
function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-1">
            <p className="text-[11px] font-black uppercase text-black tracking-tight italic">
                {title}
            </p>
            <p className="text-[11px] font-medium text-gray-500 leading-relaxed">
                {desc}
            </p>
        </div>
    )
}