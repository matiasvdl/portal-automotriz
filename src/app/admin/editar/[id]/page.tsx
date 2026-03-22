'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { eliminarAuto } from '@/app/admin/actions'

export default function EditarAutoPage() {
    const params = useParams()
    const router = useRouter()
    
    // Estados base
    const [car, setCar] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    
    // Estados para secciones comprimibles
    const [openSections, setOpenSections] = useState({
        datos: true,
        especificaciones: true,
        equipamiento: true,
        multimedia: true,
        descripcion: true
    })

    // Estados para campos controlados (Generación de Slug y Preview)
    const [make, setMake] = useState('')
    const [model, setModel] = useState('')
    const [year, setYear] = useState('')
    const [slug, setSlug] = useState('')
    const [listPrice, setListPrice] = useState(0)
    const [category, setCategory] = useState('')
    const [transmission, setTransmission] = useState('')
    const [fuel, setFuel] = useState('')
    const [engine, setEngine] = useState('')
    const [mileage, setMileage] = useState(0)

    useEffect(() => {
        const fetchCar = async () => {
            const query = `*[_type == "car" && _id == $id][0]{
                ...,
                "images": images[].asset->url,
                "exteriorImages": exteriorImages[].asset->url,
                "interiorImages": interiorImages[].asset->url
            }`
            const data = await client.fetch(query, { id: params.id })
            if (data) {
                setCar(data)
                setMake(data.make || '')
                setModel(data.model || '')
                setYear(data.year?.toString() || '')
                setSlug(data.slug?.current || '')
                setListPrice(data.listPrice || 0)
                setCategory(data.category || '')
                setTransmission(data.transmission || '')
                setFuel(data.fuel || '')
                setEngine(data.engine || '')
                setMileage(data.mileage || 0)
            }
            setLoading(false)
        }
        if (params.id) fetchCar()
    }, [params.id])

    // Lógica de generación automática de Slug
    useEffect(() => {
        if (make || model || year) {
            const autoSlug = `${make}-${model}-${year}`
                .toLowerCase()
                .trim()
                .replace(/[^\w\s-]/g, '') // Remueve caracteres especiales
                .replace(/[\s_-]+/g, '-') // Cambia espacios por guiones
                .replace(/^-+|-+$/g, ''); // Limpia extremos
            setSlug(autoSlug)
        }
    }, [make, model, year])

    const handleEliminar = async () => {
        if (confirm('¿Eliminar vehículo permanentemente de Sanity?')) {
            await eliminarAuto(car._id)
            router.push('/admin/dashboard')
        }
    }

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    if (loading) return <div className="min-h-screen bg-[#FBFBFB]" />

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-black font-sans antialiased pb-40 text-left">
            
            {/* Modal Zoom Estático */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-10" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-full object-contain" alt="Zoom" />
                    <button className="absolute top-10 right-10 text-white font-black text-[10px] uppercase tracking-widest">Cerrar [X]</button>
                </div>
            )}

            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none">
                <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center relative">
                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none">Matías</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">Admin</p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black">M</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-12 space-y-16">
                <header className="flex justify-between items-end border-b border-gray-100 pb-8 gap-4">
                    <div className="space-y-1 text-left flex-1">
                        <button onClick={() => router.back()} className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-2 text-black flex items-center gap-2 transition-colors">
                            <span>←</span> VOLVER A GESTIÓN
                        </button>
                        <h1 className="text-4xl font-black uppercase tracking-tighter leading-none text-black italic">
                            {make} <span className="font-light text-zinc-500">{model}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleEliminar} className="bg-red-50 text-red-600 text-[10px] font-black uppercase tracking-[0.2em] px-8 py-4 rounded-xl">Eliminar Registro</button>
                        <button className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-10 py-4 rounded-xl shadow-xl shadow-black/10">Guardar Cambios</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-16">
                    <div className="lg:col-span-2 space-y-16">
                        
                        {/* 01. DATOS Y PRECIOS */}
                        <Section title="01. Datos y Precios" isOpen={openSections.datos} onToggle={() => toggleSection('datos')}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Marca</label>
                                    <input value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Modelo</label>
                                    <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Enlace (Slug)</label>
                                    <input value={slug} readOnly className="w-full bg-[#F1F1F1] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none text-zinc-500 cursor-not-allowed" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Año</label>
                                    <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Etiqueta (Badge)</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none appearance-none">
                                        <option value="">Seleccionar...</option>
                                        {['Seminuevo', 'Recién Llegado', 'Oferta de la Semana', 'Reserva Online', 'Garantía VDL', 'Único Dueño', 'Oportunidad', 'Vendido'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Precio Lista (Contado)</label>
                                    <input type="number" value={listPrice} onChange={(e) => setListPrice(Number(e.target.value))} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" />
                                </div>
                                <Field label="Precio Financiado (Bono)" defaultValue={car?.financedPrice} type="number" />
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Kilometraje</label>
                                    <input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" />
                                </div>
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Motor (Cilindrada/Potencia)</label>
                                    <input value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" />
                                </div>
                                <Select label="Carrocería" defaultValue={car?.body} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} />
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Transmisión</label>
                                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none appearance-none">
                                        <option value="">Seleccionar...</option>
                                        <option value="Automática">Automática</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <Select label="Tracción" defaultValue={car?.drivetrain} options={['Delantera', 'Trasera', '4x4', '4x2']} />
                                <div className="space-y-2">
                                    <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Combustible</label>
                                    <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none appearance-none">
                                        <option value="">Seleccionar...</option>
                                        {['Bencina', 'Diésel', 'Híbrido', 'Eléctrico'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <Select label="Color" defaultValue={car?.color} options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} />
                                <Field label="Ubicación" defaultValue={car?.location} />
                            </div>
                        </Section>

                        {/* 02. ESPECIFICACIONES DETALLADAS */}
                        <Section title="02. Especificaciones Detalladas" isOpen={openSections.especificaciones} onToggle={() => toggleSection('especificaciones')}>
                            <div className="space-y-12">
                                <SpecGroup title="General">
                                    <Field label="Cilindrada (Ej: 1.6L)" defaultValue={car?.specsGeneral?.cilindrada} />
                                    <Field label="Cilindros (Ej: 4)" defaultValue={car?.specsGeneral?.cilindros} />
                                    <Field label="Potencia (Ej: 110 HP)" defaultValue={car?.specsGeneral?.potencia} />
                                </SpecGroup>
                                <SpecGroup title="Historial">
                                    <Field label="Dueños" defaultValue={car?.specsHistory?.duenos} />
                                    <Field label="Mantenciones" defaultValue={car?.specsHistory?.mantenciones} />
                                    <Field label="Historial Autofact" defaultValue={car?.specsHistory?.historial} />
                                </SpecGroup>
                                <SpecGroup title="Interior">
                                    <Field label="Número de Pasajeros" defaultValue={car?.specsInterior?.pasajeros} />
                                    <Field label="Material Asientos" defaultValue={car?.specsInterior?.materialAsientos} />
                                </SpecGroup>
                                <SpecGroup title="Exterior">
                                    <Field label="Número Puertas" defaultValue={car?.specsExterior?.puertas} />
                                    <Field label="Diámetro Rin" defaultValue={car?.specsExterior?.rin} />
                                    <Field label="Tipo Rin" defaultValue={car?.specsExterior?.tipoRin} />
                                    <Field label="Tipo Luces" defaultValue={car?.specsExterior?.luces} />
                                </SpecGroup>
                                <SpecGroup title="Confort">
                                    <Field label="Botón Encendido" defaultValue={car?.specsComfort?.encendido} />
                                    <Field label="Control Crucero" defaultValue={car?.specsComfort?.crucero} />
                                    <Field label="Sensor Distancia" defaultValue={car?.specsComfort?.sensorDistancia} />
                                    <Field label="Aire Acondicionado" defaultValue={car?.specsComfort?.aire} />
                                    <Field label="Asistencia Estacionamiento" defaultValue={car?.specsComfort?.estacionamiento} />
                                </SpecGroup>
                                <SpecGroup title="Seguridad">
                                    <Field label="Bolsas de Aire Delanteras" defaultValue={car?.specsSecurity?.airbagsDelanteros} />
                                    <Field label="Número total de Airbags" defaultValue={car?.specsSecurity?.airbagsTotales} />
                                    <Field label="Cantidad de discos de freno" defaultValue={car?.specsSecurity?.frenosDisco} />
                                    <Field label="Frenos ABS" defaultValue={car?.specsSecurity?.abs} />
                                    <Field label="Control de estabilidad" defaultValue={car?.specsSecurity?.estabilidad} />
                                </SpecGroup>
                                <SpecGroup title="Entretenimiento">
                                    <Field label="Pantalla Táctil" defaultValue={car?.specsEntertainment?.pantalla} />
                                    <Field label="Apple CarPlay / Android Auto" defaultValue={car?.specsEntertainment?.carplay} />
                                    <Field label="Bluetooth" defaultValue={car?.specsEntertainment?.bluetooth} />
                                    <Field label="Radio" defaultValue={car?.specsEntertainment?.radio} />
                                </SpecGroup>
                            </div>
                        </Section>

                        {/* 03. EQUIPAMIENTO Y CARACTERÍSTICAS */}
                        <Section title="03. Equipamiento / Características" isOpen={openSections.equipamiento} onToggle={() => toggleSection('equipamiento')}>
                            <div className="space-y-4">
                                <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">Tags de Equipamiento (Separados por coma)</label>
                                <input 
                                    defaultValue={car?.features?.join(', ')} 
                                    placeholder="Enter tag and press ENTER..."
                                    className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none" 
                                />
                            </div>
                        </Section>

                        {/* 04. GESTIÓN MULTIMEDIA */}
                        <Section title="04. Gestión Multimedia" isOpen={openSections.multimedia} onToggle={() => toggleSection('multimedia')}>
                             <div className="space-y-12">
                                <ImageGrid label="Imágenes Principales" images={car?.images} onImageClick={setSelectedImage} />
                                <ImageGrid label="Fotos Detalles de Exterior" images={car?.exteriorImages} onImageClick={setSelectedImage} />
                                <ImageGrid label="Fotos Detalles de Interior" images={car?.interiorImages} onImageClick={setSelectedImage} />
                             </div>
                        </Section>

                        {/* 05. DESCRIPCIÓN */}
                        <Section title="05. Descripción" isOpen={openSections.descripcion} onToggle={() => toggleSection('descripcion')}>
                            <textarea defaultValue={car?.description} rows={10} placeholder="Escribe los detalles adicionales del vehículo..." className="w-full bg-[#F9F9F9] border border-transparent p-8 rounded-[35px] text-[12px] font-medium outline-none resize-none" />
                        </Section>
                    </div>

                    {/* SIDEBAR: VISTA PREVIA CARCARD */}
                    <div className="space-y-8">
                        <div className="sticky top-32 space-y-6">
                            <p className="text-[10px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-2">Vista Previa Web Pública</p>
                            
                            <div className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm w-full max-w-[340px]">
                                <div className="relative h-48 w-full overflow-hidden" onClick={() => setSelectedImage(car?.images?.[0] || car?.imageUrl)}>
                                    <div className="absolute top-0 left-0 z-10 bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-br-xl">
                                        {category?.toUpperCase() || 'OPORTUNIDAD'}
                                    </div>
                                    <img src={car?.images?.[0] || car?.imageUrl} className="w-full h-full object-cover cursor-pointer" alt="Preview" />
                                </div>

                                <div className="p-6 space-y-4 text-left">
                                    <div className="space-y-1">
                                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                                            {year} • {transmission?.toUpperCase() || 'AUTOMÁTICA'}
                                        </p>
                                        <h3 className="text-[14px] font-black text-black uppercase tracking-tighter leading-none">
                                            {make} {model}
                                        </h3>
                                    </div>

                                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-50">
                                        <div>
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Kilómetros</p>
                                            <p className="text-[9px] font-black text-black uppercase">{(mileage || 0).toLocaleString()} KM</p>
                                        </div>
                                        <div className="border-x border-gray-50 px-2 text-center">
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Motor</p>
                                            <p className="text-[9px] font-black text-black uppercase">{engine || '2.0L'}</p>
                                        </div>
                                        <div className="text-right">
                                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest leading-none mb-1">Combustible</p>
                                            <p className="text-[9px] font-black text-black uppercase">{fuel?.toUpperCase() || 'BENCINA'}</p>
                                        </div>
                                    </div>

                                    <div className="flex justify-between items-end pt-2">
                                        <div className="space-y-0.5">
                                            <p className="text-[10px] text-zinc-300 font-bold line-through italic leading-none">${((listPrice || 0) * 1.1).toLocaleString('es-CL')}</p>
                                            <p className="text-xl font-black text-black tracking-tighter leading-none">${listPrice?.toLocaleString('es-CL')}</p>
                                        </div>
                                        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center">
                                            <svg className="w-4 h-4 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                                            </svg>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    )
}

/* --- COMPONENTES AUXILIARES ESTÁTICOS --- */

function Section({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
    return (
        <section className="space-y-8">
            <button 
                onClick={onToggle}
                className="w-full flex justify-between items-center group"
            >
                <h3 className="text-[12px] font-black uppercase tracking-[0.3em] text-black border-l-4 border-black pl-4 text-left">{title}</h3>
                <span className="text-[10px] font-bold text-zinc-400 group-hover:text-black transition-colors">
                    {isOpen ? 'COMPRIMIR −' : 'EXPANDIR +'}
                </span>
            </button>
            {isOpen && (
                <div className="bg-white p-10 rounded-[40px] border border-gray-100 shadow-sm">
                    {children}
                </div>
            )}
        </section>
    )
}

function SpecGroup({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-6 pt-10 border-t border-gray-50 first:border-t-0 first:pt-0">
            <h4 className="text-[10px] font-black uppercase text-zinc-300 tracking-[0.2em] text-left">{title}</h4>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-left">{children}</div>
        </div>
    )
}

function Field({ label, value, defaultValue, type = "text", onChange, readOnly, className }: any) {
    return (
        <div className="space-y-2">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest leading-none">{label}</label>
            <input 
                type={type} 
                value={value}
                defaultValue={defaultValue}
                onChange={onChange}
                readOnly={readOnly}
                className={`w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none ${className}`} 
            />
        </div>
    )
}

function Select({ label, value, defaultValue, options, onChange }: any) {
    return (
        <div className="space-y-2 text-left">
            <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest leading-none">{label}</label>
            <select 
                value={value} 
                defaultValue={defaultValue}
                onChange={onChange}
                className="w-full bg-[#F9F9F9] border border-transparent p-4 rounded-2xl text-[11px] font-bold outline-none appearance-none cursor-pointer"
            >
                <option value="">Seleccionar...</option>
                {options.map((opt: any) => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )
}

function ImageGrid({ label, images, onImageClick }: { label: string, images: string[], onImageClick: (url: string) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    return (
        <div className="space-y-4 pt-8 border-t border-gray-50 first:border-t-0 first:pt-0 text-left">
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" />
            <div className="flex justify-between items-center pr-2">
                <label className="text-[9px] font-black uppercase text-zinc-400 ml-1 tracking-widest">{label}</label>
                <button onClick={() => fileInputRef.current?.click()} className="text-[8px] font-black uppercase text-black border-b border-black">+ Add Item</button>
            </div>
            <div className="grid grid-cols-4 md:grid-cols-6 gap-4">
                {images?.map((img, i) => (
                    <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-100 border border-gray-100 group relative cursor-pointer" onClick={() => onImageClick(img)}>
                        <img src={img} className="w-full h-full object-cover" alt="car" />
                        <div className="absolute inset-0 bg-red-500/80 opacity-0 hover:opacity-100 flex items-center justify-center text-[7px] font-black text-white uppercase transition-opacity">Eliminar</div>
                    </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-xl border-2 border-dashed border-gray-100 flex items-center justify-center hover:bg-gray-50 transition-colors">
                    <span className="text-xl text-gray-200">+</span>
                </button>
            </div>
        </div>
    )
}