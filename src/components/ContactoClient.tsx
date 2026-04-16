'use client'

import { useState } from 'react'
import type { CSSProperties, HTMLInputTypeAttribute } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { sendContactEmail } from '@/app/actions/contact'

type ContactFormData = {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}

type FormFieldProps = {
    label: string
    name: keyof ContactFormData
    placeholder?: string
    value: string
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    primaryColor: string
    type?: HTMLInputTypeAttribute
}

type FormSelectProps = {
    label: string
    name: keyof ContactFormData
    value: string
    options: string[]
    onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => void
    primaryColor: string
}

export default function ContactoClient() {
    // Extraemos appearance para el color dinámico (Paso A)
    const { contact, appearance, config } = useSettings()
    const primaryColor = appearance?.primaryColor || '#000000'

    const [isSubmitting, setIsSubmitting] = useState(false)
    const [submitted, setSubmitted] = useState(false)

    const [formData, setFormData] = useState<ContactFormData>({
        name: '',
        email: '',
        phone: '',
        subject: 'Consulta General',
        message: ''
    })

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value })
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)

        try {
            const result = await sendContactEmail(formData)

            if (result.success) {
                setSubmitted(true)
                setFormData({ name: '', email: '', phone: '', subject: 'Consulta General', message: '' })
            } else {
                alert("Error al enviar el correo. Por favor, intenta de nuevo.")
            }
        } catch (error) {
            console.error(error)
            alert("Ocurrió un error en el servidor.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] antialiased text-black font-sans">
            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">

                <header className="mb-8 text-left">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">
                        Atención personalizada
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        Canales de contacto
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

                    <div className="lg:col-span-7 order-2 lg:order-1">
                        <form onSubmit={handleSubmit} className="bg-white rounded-[25px] border border-gray-100 p-7 space-y-9 shadow-none">

                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-black border-b border-gray-50 pb-4 leading-none">
                                    01. Envíanos un mensaje
                                </h3>

                                {submitted ? (
                                    <div className="py-12 text-center animate-in fade-in zoom-in duration-500">
                                        {/* Círculo de éxito con color dinámico */}
                                        <div
                                            className="w-12 h-12 text-white rounded-full flex items-center justify-center mx-auto mb-4"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M5 13l4 4L19 7" /></svg>
                                        </div>
                                        <h4 className="font-black uppercase text-[11px] mb-1">¡Mensaje enviado con éxito!</h4>
                                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mb-6">Te responderemos a la brevedad.</p>
                                        <button
                                            type="button"
                                            onClick={() => setSubmitted(false)}
                                            className="text-[9px] font-black underline uppercase tracking-widest hover:text-zinc-500 transition-colors"
                                        >
                                            Enviar otro mensaje
                                        </button>
                                    </div>
                                ) : (
                                    <div className="space-y-5">
                                        <InputField
                                            label="Nombre Completo"
                                            name="name"
                                            placeholder="Tu nombre"
                                            value={formData.name}
                                            onChange={handleChange}
                                            primaryColor={primaryColor}
                                        />
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                            <InputField
                                                label="Correo Electrónico"
                                                name="email"
                                                type="email"
                                                placeholder="ejemplo@correo.com"
                                                value={formData.email}
                                                onChange={handleChange}
                                                primaryColor={primaryColor}
                                            />
                                            <InputField
                                                label="Teléfono"
                                                name="phone"
                                                placeholder="+56 9"
                                                value={formData.phone}
                                                onChange={handleChange}
                                                primaryColor={primaryColor}
                                            />
                                        </div>
                                        <FormSelect
                                            label="Asunto"
                                            name="subject"
                                            value={formData.subject}
                                            options={['Consulta General', 'Post-Venta', 'Financiamiento', 'Agendar Visita']}
                                            onChange={handleChange}
                                            primaryColor={primaryColor}
                                        />
                                        <div className="flex flex-col space-y-2.5 text-left leading-none">
                                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">Mensaje</label>
                                            <textarea
                                                name="message"
                                                value={formData.message}
                                                onChange={handleChange}
                                                placeholder="Escribe tu mensaje aquí..."
                                                rows={5}
                                                required
                                                className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-medium outline-none focus:ring-1 resize-none leading-relaxed transition-all placeholder:text-zinc-300"
                                                style={{ '--tw-ring-color': primaryColor } as CSSProperties}
                                            />
                                        </div>

                                        <div className="pt-2">
                                            <button
                                                type="submit"
                                                disabled={isSubmitting}
                                                className="w-full text-white text-center font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl shadow-black/10 transition-all active:scale-95 disabled:opacity-50"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {isSubmitting ? 'Procesando...' : 'Enviar mensaje'}
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </section>
                        </form>
                    </div>

                    <aside className="lg:col-span-5 order-1 lg:order-2 space-y-6">
                        <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-none">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-8 leading-none text-left">
                                Información de Contacto
                            </h4>

                            <div className="space-y-8">
                                <ContactDetail
                                    label="Ubicación"
                                    value={contact.address || "Dirección no disponible"}
                                    primaryColor={primaryColor}
                                    icon={<>
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </>}
                                />
                                <ContactDetail
                                    label="Correo"
                                    value={contact.email || config?.maintenanceContent?.contactEmail || ""}
                                    primaryColor={primaryColor}
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />}
                                />
                                <ContactDetail
                                    label="WhatsApp"
                                    value={contact.whatsapp ? `+${contact.whatsapp}` : "No disponible"}
                                    primaryColor={primaryColor}
                                    icon={<path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 18h.01M8 21h8a2 2 0 002-2V5a2 2 0 00-2-2H8a2 2 0 00-2 2v14a2 2 0 002 2z" />}
                                />
                            </div>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    )
}

/** COMPONENTES AUXILIARES **/

function InputField({ label, name, placeholder, value, onChange, primaryColor, type = "text" }: FormFieldProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
            <input
                type={type} name={name} value={value} onChange={onChange} placeholder={placeholder} required
                className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none focus:ring-1 transition-all placeholder:text-zinc-300"
                style={{ '--tw-ring-color': primaryColor } as CSSProperties}
            />
        </div>
    )
}

function FormSelect({ label, name, value, options, onChange, primaryColor }: FormSelectProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1">{label}</label>
            <div className="relative">
                <select
                    name={name} value={value} onChange={onChange}
                    className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-black uppercase outline-none focus:ring-1 appearance-none cursor-pointer"
                    style={{ '--tw-ring-color': primaryColor } as CSSProperties}
                >
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    )
}

function ContactDetail({ label, value, icon, primaryColor }: { label: string, value: string, icon: React.ReactNode, primaryColor: string }) {
    return (
        <div className="flex gap-4 items-start text-left">
            <div className="w-8 h-8 bg-[#F7F8FA] rounded-lg flex items-center justify-center shrink-0" style={{ color: primaryColor }}>
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">{icon}</svg>
            </div>
            <div className="leading-tight">
                <p className="text-[8px] font-bold text-zinc-300 uppercase tracking-widest mb-1">{label}</p>
                <p className="text-[11px] font-extrabold text-black uppercase tracking-tight">{value}</p>
            </div>
        </div>
    )
}
