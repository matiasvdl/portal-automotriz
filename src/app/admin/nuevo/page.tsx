'use client'

import { useState } from 'react'
import Link from 'next/link'

export default function NuevoVehiculoPage() {
    const [tags, setTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState('')

    const addTag = (e: React.KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault()
            if (!tags.includes(currentTag.trim())) {
                setTags([...tags, currentTag.trim()])
            }
            setCurrentTag('')
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40">

            {/* Nav Principal - Centrado max-w-7xl */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none">
                <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center relative">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block leading-none">
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none text-black">Matías</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Admin</p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black">M</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                {/* Header Compacto con botones alineados */}
                <header className="flex justify-between items-end mb-9 gap-4">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 italic leading-none">
                            Panel de administración
                        </p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            Nuevo Vehículo
                        </h1>
                    </div>

                    <div className="flex items-center gap-3 mb-0.5">
                        <Link
                            href="/admin/dashboard"
                            className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-zinc-200 rounded-xl hover:border-black transition-all whitespace-nowrap"
                        >
                            ir a inventario
                        </Link>
                        <button
                            type="submit"
                            form="car-form"
                            className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap"
                        >
                            Publicar Vehículo
                        </button>
                    </div>
                </header>

                <form id="car-form" className="space-y-8">

                    {/* BLOQUE 1: IDENTIDAD Y COMERCIAL */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Identidad y Comercial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            <FormGroup label="Marca" />
                            <FormGroup label="Modelo" />

                            {/* BLOQUE SLUG - ALINEACIÓN DE BOTÓN */}
                            <div className="flex flex-col space-y-2 text-left">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Enlace (Slug)</label>
                                <div className="flex gap-2 h-[42px]">
                                    <input className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-4 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all" />
                                    <button type="button" className="bg-[#F0F2F5] px-4 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all whitespace-nowrap flex items-center justify-center h-full">Generar</button>
                                </div>
                            </div>

                            <FormGroup label="Año" type="number" />
                            <FormSelect label="Etiqueta (Badge)" options={['Seminuevo', 'Recién Llegado', 'Oferta de la Semana', 'Reserva Online', 'Garantía VDL', 'Único Dueño', 'Oportunidad', 'Vendido']} />
                            <FormGroup label="Precio Lista (Contado)" type="number" />
                            <FormGroup label="Precio Financiado (Bono)" type="number" />
                            <FormGroup label="Kilometraje" type="number" />
                        </div>
                    </div>

                    {/* BLOQUE 2: FICHA TÉCNICA */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Ficha Técnica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            <div className="md:col-span-2">
                                <FormGroup label="Motor (Cilindrada/Potencia)" />
                            </div>
                            <FormSelect label="Carrocería" options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} />
                            <FormSelect label="Transmisión" options={['Automática', 'Manual']} />
                            <FormSelect label="Tracción" options={['Delantera', 'Trasera', '4x4', '4x2']} />
                            <FormSelect label="Combustible" options={['Bencina', 'Diésel', 'Híbrido', 'Eléctrico']} />
                            <FormSelect label="Color" options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} />
                            <div className="md:col-span-1">
                                <FormGroup label="Ubicación" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 3: GENERAL E HISTORIAL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: General</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Cilindrada (Ej: 1.6L)" />
                                <FormGroup label="Cilindros (Ej: 4)" />
                                <FormGroup label="Potencia (Ej: 110 HP)" />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Historial</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Dueños (Ej: Único dueño)" />
                                <FormGroup label="Mantenciones (Ej: Al día en concesionario)" />
                                <FormGroup label="Historial Autofact (Ej: 100% limpio)" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 4: EXTERIOR E INTERIOR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Exterior</h3>
                            <div className="grid grid-cols-2 gap-7">
                                <FormGroup label="Número de Puertas" />
                                <FormGroup label="Diámetro de Rin" />
                                <FormGroup label="Tipo de Rin" />
                                <FormGroup label="Tipo de Luces" />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Interior</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Número de Pasajeros" />
                                <FormGroup label="Material Asientos" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 5: Detalles Técnicos Adicionales*/}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Detalles Técnicos Adicionales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Confort</p>
                                <FormGroup label="Botón de Encendido" />
                                <FormGroup label="Control de Crucero" />
                                <FormGroup label="Sensor de Distancia" />
                                <FormGroup label="Aire Acondicionado" />
                                <FormGroup label="Asistencia de Estacionamiento" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Seguridad</p>
                                <FormGroup label="Bolsas de Aire Delanteras" />
                                <FormGroup label="Número total de Airbags" />
                                <FormGroup label="Cantidad de discos de freno" />
                                <FormGroup label="Frenos ABS" />
                                <FormGroup label="Control de estabilidad" />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Entretenimiento</p>
                                <FormGroup label="Pantalla Táctil" />
                                <FormGroup label="Apple CarPlay / Android Auto" />
                                <FormGroup label="Bluetooth" />
                                <FormGroup label="Radio" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 6: MULTIMEDIA Y DESCRIPCIÓN */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-3 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Multimedia y Extras</h3>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Equipamiento / Características (ENTER)</label>
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={addTag}
                                placeholder=""
                                className="w-full bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none"
                            />
                            <div className="flex flex-wrap gap-2 pt-1 leading-none">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-2 leading-none">
                                        {tag}
                                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-zinc-500 hover:text-white transition-colors leading-none">✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                            <ImageUploadPlaceholder label="Imágenes Principales" />
                            <ImageUploadPlaceholder label="Detalles Exterior" />
                            <ImageUploadPlaceholder label="Detalles Interior" />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Descripción</label>
                            <textarea rows={10} className="w-full bg-[#F7F8FA] border-none rounded-2xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black transition-all resize-none leading-relaxed" />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}

// COMPONENTES AUXILIARES CON EL ESPACIADO CORRECTO (space-y-3)
function FormGroup({ label, type = "text", placeholder = "" }: { label: string, type?: string, placeholder?: string }) {
    return (
        <div className="flex flex-col space-y-2 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none"
            />
        </div>
    )
}

function FormSelect({ label, options }: { label: string, options: string[] }) {
    return (
        <div className="flex flex-col space-y-2 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <div className="relative leading-none">
                <select className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer leading-none">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    )
}

function ImageUploadPlaceholder({ label }: { label: string }) {
    return (
        <div className="flex flex-col space-y-2 text-left leading-none">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</p>
            <div className="aspect-video bg-[#F7F8FA] border-2 border-dashed border-zinc-100 rounded-[25px] flex flex-col items-center justify-center group hover:border-black transition-all cursor-pointer leading-none">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400">Añadir Imagen</p>
            </div>
        </div>
    )
}