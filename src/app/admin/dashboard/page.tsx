'use client'

import { useState, useEffect, useRef } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { eliminarAuto } from '@/app/admin/actions'

export default function EditarAutoPage() {
    const params = useParams()
    const router = useRouter()
    
    // ESTADOS
    const [car, setCar] = useState<any>(null)
    const [loading, setLoading] = useState(true)
    const [selectedImage, setSelectedImage] = useState<string | null>(null)
    const [openSections, setOpenSections] = useState({
        datos: true,
        specs: true,
        multimedia: true,
        descripcion: true
    })

    // Estados para Slug y Preview
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

    useEffect(() => {
        if (make || model || year) {
            const autoSlug = `${make}-${model}-${year}`.toLowerCase().trim()
                .replace(/[^\w\s-]/g, '').replace(/[\s_-]+/g, '-').replace(/^-+|-+$/g, '')
            setSlug(autoSlug)
        }
    }, [make, model, year])

    const toggleSection = (section: keyof typeof openSections) => {
        setOpenSections(prev => ({ ...prev, [section]: !prev[section] }))
    }

    const handleEliminar = async () => {
        if (confirm('¿Eliminar vehículo permanentemente?')) {
            await eliminarAuto(car._id)
            router.push('/admin/dashboard')
        }
    }

    if (loading) return <div className="min-h-screen bg-[#FBFBFB]" />

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-black font-sans antialiased pb-20 text-left text-[11px]">
            
            {/* Modal Zoom */}
            {selectedImage && (
                <div className="fixed inset-0 z-[100] bg-black flex items-center justify-center p-4" onClick={() => setSelectedImage(null)}>
                    <img src={selectedImage} className="max-w-full max-h-full object-contain" alt="Zoom" />
                </div>
            )}

            {/* Nav Header Compacto */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-14 flex items-center shadow-none">
                <div className="max-w-7xl mx-auto px-4 w-full flex justify-between items-center relative">
                    <Link href="/" className="text-lg font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[10px] font-black uppercase leading-none">Matías</p>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase mt-0.5">Admin</p>
                        </div>
                        <div className="w-7 h-7 bg-black rounded-full flex items-center justify-center text-white text-[9px] font-black">M</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-4 py-6">
                <header className="flex justify-between items-center border-b border-gray-100 pb-4 mb-6 gap-4">
                    <div className="space-y-0.5">
                        <button onClick={() => router.back()} className="text-[8px] font-black text-zinc-400 uppercase tracking-widest mb-1 flex items-center gap-1">
                            ← VOLVER
                        </button>
                        <h1 className="text-xl font-black uppercase tracking-tighter leading-none text-black italic">
                            {make} <span className="font-light text-zinc-500">{model}</span>
                        </h1>
                    </div>
                    <div className="flex items-center gap-2">
                        <button onClick={handleEliminar} className="bg-red-50 text-red-600 text-[8px] font-black uppercase px-4 py-2.5 rounded-lg">Eliminar</button>
                        <button className="bg-black text-white text-[8px] font-black uppercase px-6 py-2.5 rounded-lg shadow-lg shadow-black/10">Guardar</button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                    <div className="lg:col-span-2 space-y-4">
                        
                        {/* 01. DATOS Y PRECIOS */}
                        <Section title="01. Datos y Precios" isOpen={openSections.datos} onToggle={() => toggleSection('datos')}>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-3">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Marca</label>
                                    <input value={make} onChange={(e) => setMake(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none border border-transparent focus:border-black" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Modelo</label>
                                    <input value={model} onChange={(e) => setModel(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none border border-transparent focus:border-black" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Enlace (Slug)</label>
                                    <input value={slug} readOnly className="w-full bg-[#F1F1F1] p-2 rounded-lg font-bold text-zinc-500 cursor-not-allowed border border-transparent" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Año</label>
                                    <input type="number" value={year} onChange={(e) => setYear(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none border border-transparent focus:border-black" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Etiqueta (Badge)</label>
                                    <select value={category} onChange={(e) => setCategory(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none appearance-none cursor-pointer">
                                        {['Seminuevo', 'Recién Llegado', 'Oferta de la Semana', 'Reserva Online', 'Garantía VDL', 'Único Dueño', 'Oportunidad', 'Vendido'].map(opt => (
                                            <option key={opt} value={opt}>{opt}</option>
                                        ))}
                                    </select>
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Precio Lista</label>
                                    <input type="number" value={listPrice} onChange={(e) => setListPrice(Number(e.target.value))} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none" />
                                </div>
                                <Field label="Bono Financiamiento" value={car?.financedPrice} type="number" />
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Kilometraje</label>
                                    <input type="number" value={mileage} onChange={(e) => setMileage(Number(e.target.value))} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none" />
                                </div>
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Motor</label>
                                    <input value={engine} onChange={(e) => setEngine(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none" />
                                </div>
                                <Select label="Carrocería" value={car?.body} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} />
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Transmisión</label>
                                    <select value={transmission} onChange={(e) => setTransmission(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none appearance-none">
                                        <option value="Automática">Automática</option>
                                        <option value="Manual">Manual</option>
                                    </select>
                                </div>
                                <Select label="Tracción" value={car?.drivetrain} options={['Delantera', 'Trasera', '4x4', '4x2']} />
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Combustible</label>
                                    <select value={fuel} onChange={(e) => setFuel(e.target.value)} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none appearance-none">
                                        {['Bencina', 'Diésel', 'Híbrido', 'Eléctrico'].map(opt => <option key={opt} value={opt}>{opt}</option>)}
                                    </select>
                                </div>
                                <Select label="Color" value={car?.color} options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} />
                            </div>
                        </Section>

                        {/* 02. ESPECIFICACIONES DETALLADAS */}
                        <Section title="02. Especificaciones" isOpen={openSections.specs} onToggle={() => toggleSection('specs')}>
                            <div className="space-y-6">
                                <SpecGroup title="General">
                                    <Field label="Cilindrada" value={car?.specsGeneral?.cilindrada} />
                                    <Field label="Cilindros" value={car?.specsGeneral?.cilindros} />
                                    <Field label="Potencia" value={car?.specsGeneral?.potencia} />
                                </SpecGroup>
                                <SpecGroup title="Interior">
                                    <Field label="Nº Pasajeros" value={car?.specsInterior?.pasajeros} />
                                    <Field label="Mat. Asientos" value={car?.specsInterior?.materialAsientos} />
                                </SpecGroup>
                                <SpecGroup title="Exterior">
                                    <Field label="Puertas" value={car?.specsExterior?.puertas} />
                                    <Field label="Rin" value={car?.specsExterior?.rin} />
                                    <Field label="Luces" value={car?.specsExterior?.luces} />
                                </SpecGroup>
                                <SpecGroup title="Equipamiento">
                                    <Field label="Encendido" value={car?.specsComfort?.encendido} />
                                    <Field label="Aire" value={car?.specsComfort?.aire} />
                                    <Field label="Sensores" value={car?.specsComfort?.sensorDistancia} />
                                </SpecGroup>
                                <SpecGroup title="Seguridad">
                                    <Field label="Airbags" value={car?.specsSecurity?.airbagsTotales} />
                                    <Field label="ABS" value={car?.specsSecurity?.abs} />
                                    <Field label="Estabilidad" value={car?.specsSecurity?.estabilidad} />
                                </SpecGroup>
                                <SpecGroup title="Multimedia">
                                    <Field label="CarPlay" value={car?.specsEntertainment?.carplay} />
                                    <Field label="Bluetooth" value={car?.specsEntertainment?.bluetooth} />
                                </SpecGroup>
                            </div>
                        </Section>

                        {/* 03. GESTIÓN MULTIMEDIA */}
                        <Section title="03. Imágenes y Multimedia" isOpen={openSections.multimedia} onToggle={() => toggleSection('multimedia')}>
                             <div className="space-y-6">
                                <div className="space-y-1">
                                    <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">Tags Características</label>
                                    <input defaultValue={car?.features?.join(', ')} placeholder="Tag1, Tag2..." className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none" />
                                </div>
                                <ImageGrid label="Principales" images={car?.images} onImageClick={setSelectedImage} />
                                <ImageGrid label="Exterior" images={car?.exteriorImages} onImageClick={setSelectedImage} />
                                <ImageGrid label="Interior" images={car?.interiorImages} onImageClick={setSelectedImage} />
                             </div>
                        </Section>

                        {/* 04. DESCRIPCIÓN */}
                        <Section title="04. Descripción" isOpen={openSections.descripcion} onToggle={() => toggleSection('descripcion')}>
                            <textarea defaultValue={car?.description} rows={6} className="w-full bg-[#F9F9F9] p-4 rounded-xl font-medium outline-none resize-none" />
                        </Section>
                    </div>

                    {/* SIDEBAR PREVIEW MINI */}
                    <div className="space-y-4">
                        <div className="sticky top-20">
                            <p className="text-[8px] font-black uppercase text-zinc-400 mb-2 ml-1">Previsualización</p>
                            <div className="bg-white rounded-xl overflow-hidden border border-gray-100 shadow-sm scale-90 origin-top">
                                <div className="relative h-40 overflow-hidden" onClick={() => setSelectedImage(car?.images?.[0] || car?.imageUrl)}>
                                    <div className="absolute top-0 left-0 z-10 bg-black text-white text-[7px] font-black px-3 py-1.5 rounded-br-lg">{category?.toUpperCase() || 'STOCK'}</div>
                                    <img src={car?.images?.[0] || car?.imageUrl} className="w-full h-full object-cover cursor-pointer" />
                                </div>
                                <div className="p-4 space-y-3">
                                    <div>
                                        <p className="text-[8px] font-bold text-zinc-400 uppercase italic leading-none mb-1">{year} • {transmission || 'AUT'}</p>
                                        <h3 className="text-xs font-black text-black uppercase leading-none">{make} {model}</h3>
                                    </div>
                                    <div className="grid grid-cols-3 gap-1 py-2 border-y border-gray-50 text-[7px]">
                                        <div><p className="text-zinc-400 mb-0.5">Kms</p><p className="font-black">{(mileage || 0).toLocaleString()}</p></div>
                                        <div><p className="text-zinc-400 mb-0.5">Motor</p><p className="font-black">{engine || '2.0'}</p></div>
                                        <div><p className="text-zinc-400 mb-0.5">Comb.</p><p className="font-black">{fuel?.substring(0,4).toUpperCase() || 'BENC'}</p></div>
                                    </div>
                                    <div className="flex justify-between items-end">
                                        <div><p className="text-[14px] font-black text-black leading-none">${listPrice?.toLocaleString('es-CL')}</p></div>
                                        <div className="w-6 h-6 rounded-full border border-gray-100 flex items-center justify-center">
                                            <svg className="w-2 h-2 text-zinc-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
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

/* COMPONENTES COMPACTOS */

function Section({ title, children, isOpen, onToggle }: { title: string, children: React.ReactNode, isOpen: boolean, onToggle: () => void }) {
    return (
        <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
            <button onClick={onToggle} className="w-full flex justify-between items-center p-4 bg-white hover:bg-zinc-50 transition-colors">
                <h3 className="text-[10px] font-black uppercase tracking-widest text-black border-l-2 border-black pl-3">{title}</h3>
                <span className="text-[10px] font-bold text-zinc-400">{isOpen ? '− COMPRIMIR' : '+ EXPANDIR'}</span>
            </button>
            {isOpen && <div className="p-5 pt-0 border-t border-gray-50">{children}</div>}
        </div>
    )
}

function SpecGroup({ title, children }: { title: string, children: React.ReactNode }) {
    return (
        <div className="space-y-3">
            <h4 className="text-[7px] font-black uppercase text-zinc-300 tracking-[0.2em]">{title}</h4>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">{children}</div>
        </div>
    )
}

function Field({ label, value, type = "text" }: { label: string, value: any, type?: string }) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">{label}</label>
            <input type={type} defaultValue={value || ''} className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none" />
        </div>
    )
}

function Select({ label, value, options }: { label: string, value: any, options: string[] }) {
    return (
        <div className="space-y-1">
            <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">{label}</label>
            <select className="w-full bg-[#F9F9F9] p-2 rounded-lg font-bold outline-none appearance-none">
                <option value={value}>{value || 'Seleccionar...'}</option>
                {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
            </select>
        </div>
    )
}

function ImageGrid({ label, images, onImageClick }: { label: string, images: string[], onImageClick: (url: string) => void }) {
    const fileInputRef = useRef<HTMLInputElement>(null)
    return (
        <div className="space-y-2 pt-4 border-t border-gray-50">
            <input type="file" ref={fileInputRef} className="hidden" multiple accept="image/*" />
            <div className="flex justify-between items-center pr-1">
                <label className="text-[8px] font-black uppercase text-zinc-400 tracking-widest">{label}</label>
                <button onClick={() => fileInputRef.current?.click()} className="text-[7px] font-black uppercase border-b border-black">+ ADD</button>
            </div>
            <div className="grid grid-cols-6 md:grid-cols-8 gap-2">
                {images?.map((img, i) => (
                    <div key={i} className="aspect-square rounded-md overflow-hidden bg-gray-100 border border-gray-100 relative group cursor-pointer" onClick={() => onImageClick(img)}>
                        <img src={img} className="w-full h-full object-cover" />
                    </div>
                ))}
                <button onClick={() => fileInputRef.current?.click()} className="aspect-square rounded-md border border-dashed border-gray-200 flex items-center justify-center text-zinc-300">+</button>
            </div>
        </div>
    )
}