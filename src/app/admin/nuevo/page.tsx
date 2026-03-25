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

            {/* NAV PRINCIPAL VDL */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none px-10">
                <div className="max-w-full mx-auto w-full flex justify-between items-center relative">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-right leading-none">
                            <p className="text-[11px] font-black uppercase tracking-widest text-black leading-none">Matías</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase mt-1 leading-none">Admin</p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black">M</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-full mx-auto px-10 py-12">
                <header className="flex justify-between items-end mb-12 gap-4">
                    <div className="text-left flex-1 space-y-1">
                        <p className="text-[8px] font-black text-zinc-300 uppercase tracking-[0.3em] mb-0.5 italic leading-none">Autos</p>
                        <h1 className="text-3xl font-black uppercase tracking-tighter italic leading-none">Nuevo Vehículo</h1>
                    </div>
                    <Link href="/admin/dashboard" className="text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-zinc-200 rounded-xl hover:border-black transition-all mb-0.5">
                        ← Volver
                    </Link>
                </header>

                <form className="space-y-10">

                    {/* BLOQUE 1: DATOS PRINCIPALES (image_6e0b97.png) */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-8 shadow-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                            <FormGroup label="Marca" />
                            <FormGroup label="Modelo" />
                            <div className="space-y-2">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Enlace (Slug)</label>
                                <div className="flex gap-2">
                                    <input className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all" />
                                    <button type="button" className="bg-zinc-100 px-6 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-colors">Generate</button>
                                </div>
                            </div>
                            <FormGroup label="Año" type="number" />
                            <FormSelect label="Etiqueta (Badge)" options={['Seminuevo', 'Recién Llegado', 'Oportunidad', 'Vendido']} />
                            <FormGroup label="Precio Lista (Contado)" type="number" />
                            <FormGroup label="Precio Financiado (Bono)" type="number" />
                            <FormGroup label="Kilometraje" />
                        </div>
                    </div>

                    {/* BLOQUE 2: FICHA TÉCNICA (image_6e0bd5.png) */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-8 shadow-none">
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
                            <div className="lg:col-span-2">
                                <FormGroup label="Motor (Cilindrada/Potencia)" placeholder="Ej: 3.0L V6 o 2.0 Turbo" />
                            </div>
                            <FormSelect label="Carrocería" options={['Sedán', 'SUV', 'Hatchback', 'Coupé', 'Pick-up', 'Convertible']} />
                            <FormSelect label="Transmisión" options={['Automática', 'Manual', 'PDK', 'DCT']} />
                            <FormSelect label="Tracción" options={['RWD', 'AWD', '4WD', 'FWD']} />
                            <FormSelect label="Combustible" options={['Bencina', 'Diesel', 'Híbrido', 'Eléctrico']} />
                            <FormSelect label="Color" options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plata', 'Gris Nardo']} />
                            <div className="lg:col-span-1">
                                <FormGroup label="Ubicación" placeholder="Metropolitana de Santiago" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 3: ESPECIFICACIONES GENERAL E HISTORIAL (image_6e1680.png) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-8 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Especificaciones: General</h3>
                            <div className="space-y-6">
                                <FormGroup label="Cilindrada (Ej: 1.6L)" />
                                <FormGroup label="Cilindros (Ej: 4)" />
                                <FormGroup label="Potencia (Ej: 110 HP)" />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-8 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Especificaciones: Historial</h3>
                            <div className="space-y-6">
                                <FormGroup label="Dueños (Ej: Único dueño)" />
                                <FormGroup label="Mantenciones (Ej: Al día en concesionario)" />
                                <FormGroup label="Historial Autofact (Ej: 100% limpio)" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 4: EXTERIOR E INTERIOR (image_6e16c2.png / image_6e16e1.png) */}
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-10">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-8 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Especificaciones: Exterior</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormGroup label="Número de Puertas" type="number" />
                                <FormGroup label="Diámetro de Rin" />
                                <FormGroup label="Tipo de Rin" />
                                <FormGroup label="Tipo de Luces" />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-8 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Especificaciones: Interior</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <FormGroup label="Número de Pasajeros" type="number" />
                                <FormGroup label="Material Asientos" />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 5: EQUIPAMIENTO, SEGURIDAD Y ENTRETENIMIENTO (Varias Capturas) */}
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-10">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-6 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Equipamiento y Confort</h3>
                            <CheckboxBlock items={['Botón de Encendido', 'Control de Crucero', 'Sensor de Distancia', 'Aire Acondicionado', 'Asistencia de Estacionamiento']} />
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-6 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Seguridad</h3>
                            <div className="space-y-6">
                                <CheckboxBlock items={['Bolsas de Aire Delanteras', 'Frenos ABS', 'Control de estabilidad']} />
                                <FormGroup label="Número total de Airbags" type="number" />
                                <FormGroup label="Cantidad de discos de freno" type="number" />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-6 shadow-none">
                            <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Entretenimiento</h3>
                            <CheckboxBlock items={['Pantalla Táctil', 'Apple CarPlay / Android Auto', 'Bluetooth', 'Radio']} />
                        </div>
                    </div>

                    {/* BLOQUE 6: MULTIMEDIA Y DESCRIPCIÓN (image_6e1717.png / image_6e171d.png) */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-10 space-y-12 shadow-none">
                        <h3 className="text-[11px] font-black uppercase tracking-widest text-zinc-300 border-b border-gray-50 pb-4 italic leading-none">Multimedia y Extras</h3>

                        <div className="space-y-4">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Equipamiento / Características (Presiona ENTER)</label>
                            <input
                                type="text"
                                value={currentTag}
                                onChange={(e) => setCurrentTag(e.target.value)}
                                onKeyDown={addTag}
                                placeholder="Enter tag and press ENTER..."
                                className="w-full bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none"
                            />
                            <div className="flex flex-wrap gap-2 pt-2">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-2 leading-none">
                                        {tag}
                                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-zinc-500 hover:text-white transition-colors leading-none">✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <ImageUploadPlaceholder label="Imágenes Principales" />
                            <ImageUploadPlaceholder label="Fotos Detalles de Exterior" />
                            <ImageUploadPlaceholder label="Fotos Detalles de Interior" />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Descripción</label>
                            <textarea
                                rows={10}
                                className="w-full bg-[#F7F8FA] border-none rounded-2xl p-6 text-sm font-medium outline-none focus:ring-1 focus:ring-black transition-all resize-none leading-none"
                            />
                        </div>
                    </div>

                    {/* ACCIÓN FINAL STICKY */}
                    <div className="flex justify-end gap-4 sticky bottom-10 z-30 leading-none">
                        <button type="submit" className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-12 py-5 rounded-[20px] shadow-2xl shadow-black/20 hover:scale-[1.02] active:scale-95 transition-all leading-none">
                            Publicar Vehículo
                        </button>
                    </div>

                </form>
            </main>
        </div>
    )
}

function FormGroup({ label, type = "text", placeholder = "" }: { label: string, type?: string, placeholder?: string }) {
    return (
        <div className="space-y-2 leading-none text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input type={type} placeholder={placeholder} className="w-full bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none" />
        </div>
    )
}

function FormSelect({ label, options }: { label: string, options: string[] }) {
    return (
        <div className="space-y-2 leading-none text-left">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <select className="w-full bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer leading-none">
                {options.map(opt => <option key={opt}>{opt}</option>)}
            </select>
        </div>
    )
}

function CheckboxBlock({ items }: { items: string[] }) {
    return (
        <div className="space-y-4 text-left">
            {items.map(item => (
                <label key={item} className="flex items-center gap-4 cursor-pointer group leading-none">
                    <div className="w-6 h-6 rounded-lg border-2 border-gray-100 flex items-center justify-center group-hover:border-black transition-colors leading-none">
                        <input type="checkbox" className="hidden" />
                        <div className="w-3 h-3 bg-black rounded-sm opacity-0 group-has-[:checked]:opacity-100 transition-opacity leading-none" />
                    </div>
                    <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-500 group-hover:text-black transition-colors leading-none">{item}</span>
                </label>
            ))}
        </div>
    )
}

function ImageUploadPlaceholder({ label }: { label: string }) {
    return (
        <div className="space-y-4 text-left">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</p>
            <div className="aspect-video bg-[#F7F8FA] border-2 border-dashed border-zinc-100 rounded-[25px] flex flex-col items-center justify-center group hover:border-black transition-all cursor-pointer leading-none">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all leading-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest leading-none">Add item</p>
            </div>
        </div>
    )
}