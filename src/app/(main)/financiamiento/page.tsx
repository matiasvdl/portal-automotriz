'use client'

import { useState, useEffect } from 'react'
import { client } from '@/sanity/lib/client'
import { useSettings } from '@/context/SettingsContext'

export default function FinanciamientoPage() {
    const { contact, appearance } = useSettings()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [availableCars, setAvailableCars] = useState<any[]>([])

    const [formData, setFormData] = useState({
        firstName: '',
        lastName: '',
        rut: '',
        phone: '',
        birthDate: '',
        nationality: 'Chilena',
        employmentStatus: 'Dependiente',
        income: '',
        entryDate: '',
        dicom: 'No',
        carInterest: '',
        downPayment: '',
        termMonths: '36 meses',
        additionalInquiries: ''
    })

    // Función para dar formato de puntos (1.000.000)
    const formatCLP = (value: string) => {
        const cleanValue = value.replace(/\D/g, "");
        if (!cleanValue) return "";
        return new Intl.NumberFormat('es-CL').format(parseInt(cleanValue));
    }

    // 1. FETCH DE VEHÍCULOS (Solo una vez al montar)
    useEffect(() => {
        const fetchCars = async () => {
            try {
                // Usamos listPrice que es el campo real en tu esquema
                const query = `*[_type == "car"] | order(make asc) { make, model, listPrice }`
                const cars = await client.fetch(query)
                setAvailableCars(cars)

                // Selección inicial por defecto si hay stock
                if (cars.length > 0) {
                    setFormData(prev => ({
                        ...prev,
                        carInterest: `${cars[0].make} ${cars[0].model}`
                    }))
                }
            } catch (error) {
                console.error("Error al cargar autos")
            }
        }
        fetchCars()
    }, [])

    // VARIABLES DINÁMICAS DESDE ADMIN/SANITY
    const minPercent = appearance?.minDepositPercent || 30;
    const minIncomeValue = appearance?.minIncome || 500000;
    const minWorkText = appearance?.minWorkExperience || "Mínimo 1 año de continuidad laboral.";

    const selectedCarData = availableCars.find(c => `${c.make} ${c.model}` === formData.carInterest);
    const calculatedDeposit = selectedCarData?.listPrice ? (selectedCarData.listPrice * minPercent) / 100 : 0;

    // 2. ACTUALIZACIÓN AUTOMÁTICA DEL CAMPO DE PIE
    useEffect(() => {
        if (calculatedDeposit > 0) {
            setFormData(prev => ({
                ...prev,
                downPayment: formatCLP(Math.floor(calculatedDeposit).toString())
            }))
        }
    }, [formData.carInterest, calculatedDeposit])

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
        const { name, value } = e.target;

        // Aplicar formato si es el Pie o la Renta
        if (name === 'downPayment' || name === 'income') {
            setFormData({ ...formData, [name]: formatCLP(value) });
        } else {
            setFormData({ ...formData, [name]: value });
        }
    }

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault()

        // Limpiamos los puntos para la validación numérica
        const userDownPayment = parseInt(formData.downPayment.replace(/\./g, '')) || 0;

        if (userDownPayment < calculatedDeposit) {
            alert(`El pie mínimo para este vehículo es de $${Math.floor(calculatedDeposit).toLocaleString('es-CL')} (${minPercent}%).`);
            return;
        }

        setIsSubmitting(true)
        const destinationNumber = contact.whatsapp || "569XXXXXXXX"

        const message = `Hola VDL Motors! Solicito evaluación de crédito automotriz.%0A` +
            `- Cliente: ${formData.firstName} ${formData.lastName}%0A` +
            `- RUT: ${formData.rut}%0A` +
            `- Auto: ${formData.carInterest}%0A` +
            `- Pie Solicitado: $${formData.downPayment}%0A` +
            `- Plazo: ${formData.termMonths}%0A` +
            `- Consultas: ${formData.additionalInquiries || 'Sin consultas adicionales'}`

        window.open(`https://wa.me/${destinationNumber}?text=${message}`, '_blank')
        setTimeout(() => setIsSubmitting(false), 2000)
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] antialiased text-black font-sans">
            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
                <header className="mb-8 text-left">
                    <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">
                        Gestión de créditos
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        Financiamiento Automotriz
                    </h1>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
                    <form onSubmit={handleSubmit} className="lg:col-span-7 order-2 lg:order-1">
                        <div className="bg-white rounded-[25px] border border-gray-100 p-7 space-y-9 shadow-none">

                            {/* 01. DATOS PERSONALES */}
                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-800 border-b border-gray-50 pb-4 leading-none">
                                    01. Datos del Solicitante
                                </h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Nombre" name="firstName" placeholder="Juan" value={formData.firstName} onChange={handleChange} />
                                        <InputField label="Apellido" name="lastName" placeholder="Pérez" value={formData.lastName} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="RUT" name="rut" placeholder="12.345.678-9" value={formData.rut} onChange={handleChange} />
                                        <InputField label="Fecha de Nacimiento" name="birthDate" type="date" value={formData.birthDate} onChange={handleChange} />
                                    </div>
                                    <FormSelect label="Nacionalidad" name="nationality" value={formData.nationality} options={['Chilena', 'Extranjera']} onChange={handleChange} />
                                </div>
                            </section>

                            {/* 02. LABORAL */}
                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-800 border-b border-gray-50 pb-4 leading-none">
                                    02. Situación Laboral y Renta
                                </h3>
                                <div className="space-y-5">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <FormSelect label="Ocupación" name="employmentStatus" value={formData.employmentStatus} options={['Dependiente', 'Independiente', 'Empresa']} onChange={handleChange} />
                                        {/* Renta con formato puntos */}
                                        <InputField label="Renta Líquida Mensual" name="income" type="text" placeholder="Ej: 900.000" value={formData.income} onChange={handleChange} />
                                    </div>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        <InputField label="Antigüedad Laboral" name="entryDate" placeholder="Ej: 1 año" value={formData.entryDate} onChange={handleChange} />
                                        <FormSelect label="Dicom" name="dicom" value={formData.dicom} options={['No', 'Sí']} onChange={handleChange} />
                                    </div>
                                </div>
                            </section>

                            {/* 03. VEHÍCULO */}
                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-800 border-b border-gray-50 pb-4 leading-none">
                                    03. Vehículo e Inversión
                                </h3>
                                <div className="space-y-5">
                                    <FormSelect
                                        label="Auto de Interés"
                                        name="carInterest"
                                        value={formData.carInterest}
                                        options={availableCars.map(c => `${c.make} ${c.model}`)}
                                        onChange={handleChange}
                                    />

                                    {calculatedDeposit > 0 && (
                                        <div className="bg-[#F7F8FA] p-4 rounded-2xl border border-dashed border-gray-200 flex justify-between items-center transition-all animate-in fade-in duration-500">
                                            <div className="leading-tight">
                                                <p className="text-[8px] font-black uppercase text-zinc-400">Pie Mínimo Requerido ({minPercent}%)</p>
                                                <p className="text-sm font-black text-black mt-1">${Math.floor(calculatedDeposit).toLocaleString('es-CL')}</p>
                                            </div>
                                            <div className="text-right">
                                                <p className="text-[8px] font-black uppercase text-zinc-400">Precio Lista</p>
                                                <p className="text-[10px] font-bold text-zinc-600 mt-1">${selectedCarData?.listPrice.toLocaleString('es-CL')}</p>
                                            </div>
                                        </div>
                                    )}

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                                        {/* Pie con formato puntos */}
                                        <InputField label="Monto de Pie que deseas dar" name="downPayment" type="text" placeholder="Ej: 5.000.000" value={formData.downPayment} onChange={handleChange} />
                                        <FormSelect label="Plazo Deseado" name="termMonths" value={formData.termMonths} options={['12 meses', '24 meses', '36 meses', '48 meses']} onChange={handleChange} />
                                    </div>
                                </div>
                            </section>

                            {/* 04. CONSULTAS */}
                            <section className="space-y-6">
                                <h3 className="text-[9px] font-black uppercase tracking-widest text-zinc-800 border-b border-gray-50 pb-4 leading-none">
                                    04. Consultas Adicionales
                                </h3>
                                <div className="flex flex-col space-y-2.5 text-left leading-none">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">¿Tienes alguna duda o comentario?</label>
                                    <textarea
                                        name="additionalInquiries"
                                        value={formData.additionalInquiries}
                                        onChange={handleChange}
                                        placeholder="Ej: ¿Reciben auto en parte de pago?, ¿Tienen seguro automotriz?, etc."
                                        rows={4}
                                        className="w-full bg-[#F7F8FA] border-none rounded-xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black resize-none leading-relaxed transition-all placeholder:text-zinc-300 shadow-none"
                                    />
                                </div>
                            </section>

                            <div className="pt-0">
                                <button
                                    type="submit"
                                    disabled={isSubmitting}
                                    className="w-full bg-black text-white text-center font-black text-[10px] uppercase tracking-[0.2em] py-4 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95 disabled:opacity-50"
                                >
                                    {isSubmitting ? 'Procesando...' : 'Solicitar Evaluación Automotriz'}
                                </button>
                            </div>
                        </div>
                    </form>

                    <aside className="lg:col-span-5 order-1 lg:order-2 space-y-4">
                        <div className="bg-white rounded-[25px] p-8 border border-gray-100 shadow-none">
                            <h4 className="text-[10px] font-black uppercase tracking-widest text-black mb-6 leading-none">Requisitos para el Crédito</h4>
                            <div className="space-y-6">
                                <FeatureItem title="Antigüedad" desc={minWorkText} />
                                <FeatureItem title="Renta Mínima" desc={`Ingresos desde $${formatCLP(minIncomeValue.toString())} líquidos mensuales.`} />
                                <FeatureItem title="Historial" desc="Sin deudas comerciales vigentes (Dicom)." />
                                <FeatureItem title="Pie Mínimo" desc={`Se requiere al menos un ${minPercent}% de pie según perfil.`} />
                            </div>
                            <div className="mt-10 pt-6 border-t border-gray-100 text-center leading-tight">
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest mb-2 leading-none">Cotiza en línea vía WhatsApp</p>
                                <p className="text-[10px] font-black text-black uppercase italic tracking-tight leading-none">Evaluación 100% Digital</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[25px] p-5 text-white shadow-none flex items-center gap-4">
                            <div className="w-9 h-9 bg-white/10 rounded-full flex items-center justify-center shrink-0 transition-none">
                                <svg className="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" /></svg>
                            </div>
                            <div className="leading-tight transition-none">
                                <p className="text-[10px] font-black uppercase tracking-widest leading-none">Proceso Seguro</p>
                                <p className="text-[8px] text-zinc-500 font-bold uppercase tracking-tighter mt-0.5 leading-none">Evaluación directa con VDL Motors</p>
                            </div>
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    )
}

function InputField({ label, name, placeholder, value, onChange, type = "text" }: any) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                name={name}
                value={value}
                onChange={onChange}
                placeholder={placeholder}
                required
                className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all placeholder:text-zinc-300 placeholder:font-normal shadow-none"
            />
        </div>
    )
}

function FormSelect({ label, name, value, options, onChange }: any) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none transition-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <div className="relative leading-none">
                <select name={name} value={value} onChange={onChange} className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer leading-none shadow-none">
                    {options.map((opt: string) => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    )
}

function FeatureItem({ title, desc }: { title: string, desc: string }) {
    return (
        <div className="space-y-1 text-left leading-tight transition-none">
            <p className="text-[10px] font-black uppercase text-black tracking-tighter leading-none">{title}</p>
            <p className="text-[10px] font-medium text-zinc-500 leading-none">{desc}</p>
        </div>
    )
}