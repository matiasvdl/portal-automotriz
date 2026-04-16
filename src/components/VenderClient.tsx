'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties, HTMLInputTypeAttribute } from 'react'
import { useSettings } from '@/context/SettingsContext'

type SellFormData = {
    firstName: string
    lastName: string
    phone: string
    email: string
    make: string
    model: string
    year: string
    mileage: string
    transmission: string
    fuel: string
    condition: string
    additionalDetails: string
}

type SellFieldProps = {
    label: string
    name: keyof SellFormData
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    primaryColor: string
    type?: HTMLInputTypeAttribute
}

type SellSelectProps = {
    label: string
    name: keyof SellFormData
    value: string
    options: string[]
    onChange: (name: keyof SellFormData, value: string) => void
    primaryColor: string
}

export default function VenderClient() {
    const { contact, appearance, config } = useSettings()

    const primaryColor = appearance?.primaryColor || '#000000'
    const brandName = appearance?.brandName || appearance?.Sitename || config?.siteName || ''
    const sellSteps = config?.sellContent?.steps?.filter((step) => step?.title || step?.description) || [
        { title: '1. Envía tus datos', description: 'Completa el formulario con la información básica de tu vehículo.' },
        { title: '2. Tasación en línea', description: 'Nuestros ejecutivos analizarán los datos para darte una oferta preliminar.' },
        { title: '3. Inspección física', description: 'Coordinamos una revisión rápida en nuestras sucursales o domicilio.' },
        { title: '4. Pago inmediato', description: 'Si estás de acuerdo, cerramos el contrato y recibes tu pago al instante.' },
    ]

    const [isSubmitting, setIsSubmitting] = useState(false)

    const [formData, setFormData] = useState<SellFormData>({
        firstName: '',
        lastName: '',
        phone: '',
        email: '',
        make: '',
        model: '',
        year: '',
        mileage: '',
        transmission: 'Automática',
        fuel: 'Bencina',
        condition: 'Excelente',
        additionalDetails: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSelectChange = (name: keyof SellFormData, value: string) => {
        setFormData({ ...formData, [name]: value })
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        const destinationNumber = contact.whatsapp.replace(/\D/g, '')

        const message = `Hola ${brandName}! Me interesa vender mi auto.%0A` +
            `- Cliente: ${formData.firstName} ${formData.lastName}%0A` +
            `- Vehículo: ${formData.make} ${formData.model} (${formData.year})%0A` +
            `- KM: ${formData.mileage}%0A` +
            `- Transmisión: ${formData.transmission}%0A` +
            `- Estado: ${formData.condition}%0A` +
            `- Detalles: ${formData.additionalDetails || 'Sin detalles adicionales'}`

        window.open(`https://wa.me/${destinationNumber}?text=${message}`, '_blank')
        setTimeout(() => setIsSubmitting(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] antialiased text-black font-sans">
            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
                <header className="mb-8 text-left">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">
                        {config?.sellContent?.eyebrow?.trim() || 'Tasación inmediata'}
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        {config?.sellContent?.title?.trim() || 'Vende tu vehículo'}
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <form onSubmit={handleSubmit} className="lg:col-span-7 order-2 lg:order-1">
                        <div className="bg-white rounded-[25px] border border-gray-100 p-7 space-y-9 shadow-none">
                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-black border-b border-gray-50 pb-4 leading-none">
                                    01. Datos de Contacto
                                </h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Nombre" name="firstName" placeholder="Juan" value={formData.firstName} onChange={handleChange} primaryColor={primaryColor} />
                                        <InputField label="Apellido" name="lastName" placeholder="Pérez" value={formData.lastName} onChange={handleChange} primaryColor={primaryColor} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Teléfono / WhatsApp" name="phone" placeholder="+56 9" value={formData.phone} onChange={handleChange} primaryColor={primaryColor} />
                                        <InputField label="Correo Electrónico" name="email" placeholder="ejemplo@correo.com" value={formData.email} onChange={handleChange} primaryColor={primaryColor} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-black border-b border-gray-50 pb-4 leading-none">
                                    02. Información del Vehículo
                                </h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Marca" name="make" placeholder="Ej: Mercedes Benz" value={formData.make} onChange={handleChange} primaryColor={primaryColor} />
                                        <InputField label="Modelo" name="model" placeholder="Ej: G63 AMG" value={formData.model} onChange={handleChange} primaryColor={primaryColor} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Año" name="year" placeholder="Ej: 2021" value={formData.year} onChange={handleChange} primaryColor={primaryColor} />
                                        <InputField label="Kilometraje" name="mileage" placeholder="Ej: 45.000" value={formData.mileage} onChange={handleChange} primaryColor={primaryColor} />
                                    </div>
                                </div>
                            </section>

                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-black border-b border-gray-50 pb-4 leading-none">
                                    03. Estado y Consultas
                                </h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                                        <FormSelect label="Transmisión" name="transmission" value={formData.transmission} options={['Automática', 'Manual']} onChange={handleSelectChange} primaryColor={primaryColor} />
                                        <FormSelect label="Combustible" name="fuel" value={formData.fuel} options={['Bencina', 'Diésel', 'Híbrido', 'Eléctrico']} onChange={handleSelectChange} primaryColor={primaryColor} />
                                        <FormSelect label="Condición" name="condition" value={formData.condition} options={['Excelente', 'Bueno', 'Regular']} onChange={handleSelectChange} primaryColor={primaryColor} />
                                    </div>
                                    <div className="flex flex-col space-y-2.5 text-left leading-none">
                                        <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Detalles adicionales o expectativas de precio</label>
                                        <textarea
                                            name="additionalDetails"
                                            value={formData.additionalDetails}
                                            onChange={handleChange}
                                            placeholder="Cuéntanos sobre mantenciones, dueños o si tiene algún detalle estético."
                                            rows={4}
                                            className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-medium outline-none resize-none leading-relaxed transition-all placeholder:text-zinc-300 shadow-none"
                                            style={{ '--tw-ring-color': primaryColor } as CSSProperties}
                                        />
                                    </div>
                                </div>
                            </section>

                            <div className="pt-0">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full text-white text-center font-black text-[9px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl transition-all active:scale-95 disabled:opacity-50"
                                    style={{
                                        backgroundColor: primaryColor,
                                        boxShadow: `0 20px 25px -5px ${primaryColor}33`
                                    }}
                                >
                                    {isSubmitting ? 'Enviando...' : 'Solicitar Tasación'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-none">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 leading-none">
                                ¿Cómo funciona?
                            </h4>
                            <div className="space-y-6">
                                {sellSteps.map((step, index) => (
                                    <FeatureItem
                                        key={`${step.title || 'step'}-${index}`}
                                        title={step.title || `Paso ${index + 1}`}
                                        desc={step.description || ''}
                                    />
                                ))}
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[25px] p-6 text-white shadow-none flex items-center gap-4">
                            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0">
                                <svg className="w-4 h-4" style={{ color: primaryColor }} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                                </svg>
                            </div>
                            <div className="leading-tight">
                                <p className="text-[10px] font-black uppercase tracking-widest">{config?.sellContent?.trustTitle?.trim() || 'Compra Segura'}</p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5">{config?.sellContent?.trustSubtitle?.trim() || 'Pagamos al contado y de forma segura'}</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

function InputField({ label, name, placeholder, value, onChange, primaryColor, type = "text" }: SellFieldProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none transition-all placeholder:text-zinc-300 placeholder:font-normal shadow-none"
                style={{ '--tw-ring-color': primaryColor } as CSSProperties}
            />
        </div>
    )
}

function FormSelect({ label, name, value, options, onChange, primaryColor }: SellSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        window.addEventListener('mousedown', handlePointerDown)
        return () => window.removeEventListener('mousedown', handlePointerDown)
    }, [])

    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <div className="relative leading-none" ref={containerRef}>
                <button
                    type="button"
                    onClick={() => setIsOpen((prev) => !prev)}
                    className="w-full min-h-[46px] bg-[#F7F8FA] border border-gray-200 rounded-2xl px-5 pr-12 text-[10px] font-bold uppercase outline-none cursor-pointer leading-none shadow-none text-left transition-colors hover:border-gray-300"
                    style={{
                        '--tw-ring-color': primaryColor,
                        borderColor: isOpen ? `${primaryColor}55` : undefined,
                    } as CSSProperties}
                >
                    <span className="block truncate pr-2">{value}</span>
                </button>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                </div>

                {isOpen && (
                    <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-20 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                        <div className="max-h-64 overflow-y-auto py-2">
                            {options.map((opt) => {
                                const isSelected = opt === value

                                return (
                                    <button
                                        key={opt}
                                        type="button"
                                        onClick={() => {
                                            onChange(name, opt)
                                            setIsOpen(false)
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-bold uppercase transition-colors ${isSelected ? 'bg-[#F7F8FA] text-black' : 'text-zinc-600 hover:bg-[#F7F8FA]'}`}
                                    >
                                        <span className="pr-4">{opt}</span>
                                        {isSelected && <span className="sr-only">Seleccionado</span>}
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                )}
            </div>
        </div>
    )
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-1 text-left leading-tight">
            <p className="text-[10px] font-black uppercase text-black tracking-tighter leading-none">{title}</p>
            <p className="text-[10px] font-medium text-zinc-500 leading-none">{desc}</p>
        </div>
    )
}
