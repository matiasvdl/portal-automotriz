'use client'

import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { client } from '@/sanity/lib/client'

// --- Tipos para TypeScript ---
interface SanityImage {
    _type: 'image';
    asset: { _type: 'reference'; _ref: string };
}

interface CarFormData {
    make: string; model: string; slug: string; year: number;
    category: string; listPrice: number; financedPrice: number; mileage: number;
    engine: string; body: string; transmission: string; drivetrain: string;
    fuel: string; color: string; location: string;
    specsGeneral: { cilindrada: string; cilindros: string; potencia: string };
    specsHistory: { duenos: string; mantenciones: string; historial: string };
    specsExterior: { puertas: string; rin: string; tipoRin: string; luces: string };
    specsComfort: { encendido: string; crucero: string; sensorDistancia: string; aire: string; estacionamiento: string };
    specsSecurity: { airbagsDelanteros: string; airbagsTotales: string; frenosDisco: string; abs: string; estabilidad: string };
    specsInterior: { pasajeros: string; materialAsientos: string };
    specsEntertainment: { pantalla: string; carplay: string; bluetooth: string; radio: string };
    description: string;
    images: SanityImage[];
    exteriorImages: SanityImage[];
    interiorImages: SanityImage[];
}

export default function NuevoVehiculoPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [tags, setTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState('')

    // Referencias para inputs de archivos
    const mainImagesRef = useRef<HTMLInputElement>(null)
    const exteriorImagesRef = useRef<HTMLInputElement>(null)
    const interiorImagesRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<CarFormData>({
        make: '', model: '', slug: '', year: new Date().getFullYear(),
        category: 'Seminuevo', listPrice: 0, financedPrice: 0, mileage: 0,
        engine: '', body: 'SUV', transmission: 'Automática', drivetrain: 'Delantera',
        fuel: 'Bencina', color: 'Blanco', location: 'Metropolitana de Santiago',
        specsGeneral: { cilindrada: '', cilindros: '', potencia: '' },
        specsHistory: { duenos: '', mantenciones: '', historial: '' },
        specsExterior: { puertas: '', rin: '', tipoRin: '', luces: '' },
        specsComfort: { encendido: '', crucero: '', sensorDistancia: '', aire: '', estacionamiento: '' },
        specsSecurity: { airbagsDelanteros: '', airbagsTotales: '', frenosDisco: '', abs: '', estabilidad: '' },
        specsInterior: { pasajeros: '', materialAsientos: '' },
        specsEntertainment: { pantalla: '', carplay: '', bluetooth: '', radio: '' },
        description: '',
        images: [], exteriorImages: [], interiorImages: []
    })

    // --- Lógica Funcional ---
    const handleChange = (field: keyof CarFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNestedChange = (group: keyof CarFormData, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [group]: { ...(prev[group] as any), [field]: value }
        }))
    }

    const generateSlug = () => {
        const generated = `${formData.make}-${formData.model}-${formData.year}`
            .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        handleChange('slug', generated)
    }

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'images' | 'exteriorImages' | 'interiorImages') => {
        const files = e.target.files; if (!files) return
        setIsSubmitting(true)
        try {
            const uploads = Array.from(files).map(async (file) => {
                const asset = await client.assets.upload('image', file)
                return { _type: 'image' as const, asset: { _type: 'reference' as const, _ref: asset._id } }
            })
            const uploaded = await Promise.all(uploads)
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ...uploaded] }))
        } catch (error) { alert("Error al subir imagen") }
        finally { setIsSubmitting(false) }
    }

    const addTag = (e: KeyboardEvent) => {
        if (e.key === 'Enter' && currentTag.trim()) {
            e.preventDefault()
            if (!tags.includes(currentTag.trim())) {
                setTags([...tags, currentTag.trim()])
            }
            setCurrentTag('')
        }
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        try {
            const doc = {
                _type: 'car',
                ...formData,
                slug: { _type: 'slug', current: formData.slug },
                features: tags
            }
            await client.create(doc)
            router.push('/admin/dashboard')
        } catch (error) { alert('Error al guardar en Sanity') }
        finally { setIsSubmitting(false) }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40">
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
                            onClick={handleSubmit}
                            disabled={isSubmitting}
                            className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50"
                        >
                            {isSubmitting ? 'Guardando...' : 'Publicar Vehículo'}
                        </button>
                    </div>
                </header>

                <form id="car-form" className="space-y-8">

                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Identidad y Comercial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            <FormGroup label="Marca" value={formData.make} onChange={(v: string) => handleChange('make', v)} />
                            <FormGroup label="Modelo" value={formData.model} onChange={(v: string) => handleChange('model', v)} />

                            <div className="flex flex-col space-y-2 text-left">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Enlace (Slug)</label>
                                <div className="flex gap-2 h-[42px]">
                                    <input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-4 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all" />
                                    <button type="button" onClick={generateSlug} className="bg-[#F0F2F5] px-4 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all whitespace-nowrap flex items-center justify-center h-full">Generar</button>
                                </div>
                            </div>

                            <FormGroup label="Año" type="number" value={formData.year} onChange={(v: string) => handleChange('year', parseInt(v) || 0)} />
                            <FormSelect label="Etiqueta (Badge)" value={formData.category} options={['Seminuevo', 'Recién Llegado', 'Oportunidad', 'Vendido']} onChange={(v: string) => handleChange('category', v)} />
                            <FormGroup label="Precio Lista (Contado)" type="number" value={formData.listPrice} onChange={(v: string) => handleChange('listPrice', parseInt(v) || 0)} />
                            <FormGroup label="Precio Financiado (Bono)" type="number" value={formData.financedPrice} onChange={(v: string) => handleChange('financedPrice', parseInt(v) || 0)} />
                            <FormGroup label="Kilometraje" type="number" value={formData.mileage} onChange={(v: string) => handleChange('mileage', parseInt(v) || 0)} />
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Ficha Técnica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            <div className="md:col-span-2">
                                <FormGroup label="Motor (Cilindrada/Potencia)" value={formData.engine} onChange={(v: string) => handleChange('engine', v)} />
                            </div>
                            <FormSelect label="Carrocería" value={formData.body} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} onChange={(v: string) => handleChange('body', v)} />
                            <FormSelect label="Transmisión" value={formData.transmission} options={['Automática', 'Manual']} onChange={(v: string) => handleChange('transmission', v)} />
                            <FormSelect label="Tracción" value={formData.drivetrain} options={['Delantera', 'Trasera', '4x4', '4x2']} onChange={(v: string) => handleChange('drivetrain', v)} />
                            <FormSelect label="Combustible" value={formData.fuel} options={['Bencina', 'Diésel', 'Híbrido', 'Eléctrico']} onChange={(v: string) => handleChange('fuel', v)} />
                            <FormSelect label="Color" value={formData.color} options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} onChange={(v: string) => handleChange('color', v)} />
                            <div className="md:col-span-1">
                                <FormGroup label="Ubicación" value={formData.location} onChange={(v: string) => handleChange('location', v)} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: General</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Cilindrada (Ej: 1.6L)" value={formData.specsGeneral.cilindrada} onChange={(v: string) => handleNestedChange('specsGeneral', 'cilindrada', v)} />
                                <FormGroup label="Cilindros (Ej: 4)" value={formData.specsGeneral.cilindros} onChange={(v: string) => handleNestedChange('specsGeneral', 'cilindros', v)} />
                                <FormGroup label="Potencia (Ej: 110 HP)" value={formData.specsGeneral.potencia} onChange={(v: string) => handleNestedChange('specsGeneral', 'potencia', v)} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Historial</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Dueños (Ej: Único dueño)" value={formData.specsHistory.duenos} onChange={(v: string) => handleNestedChange('specsHistory', 'duenos', v)} />
                                <FormGroup label="Mantenciones (Ej: Al día en concesionario)" value={formData.specsHistory.mantenciones} onChange={(v: string) => handleNestedChange('specsHistory', 'mantenciones', v)} />
                                <FormGroup label="Historial Autofact (Ej: 100% limpio)" value={formData.specsHistory.historial} onChange={(v: string) => handleNestedChange('specsHistory', 'historial', v)} />
                            </div>
                        </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Exterior</h3>
                            <div className="grid grid-cols-2 gap-7">
                                <FormGroup label="Número de Puertas" value={formData.specsExterior.puertas} onChange={(v: string) => handleNestedChange('specsExterior', 'puertas', v)} />
                                <FormGroup label="Diámetro de Rin" value={formData.specsExterior.rin} onChange={(v: string) => handleNestedChange('specsExterior', 'rin', v)} />
                                <FormGroup label="Tipo de Rin" value={formData.specsExterior.tipoRin} onChange={(v: string) => handleNestedChange('specsExterior', 'tipoRin', v)} />
                                <FormGroup label="Tipo de Luces" value={formData.specsExterior.luces} onChange={(v: string) => handleNestedChange('specsExterior', 'luces', v)} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Interior</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Número de Pasajeros" value={formData.specsInterior.pasajeros} onChange={(v: string) => handleNestedChange('specsInterior', 'pasajeros', v)} />
                                <FormGroup label="Material Asientos" value={formData.specsInterior.materialAsientos} onChange={(v: string) => handleNestedChange('specsInterior', 'materialAsientos', v)} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Detalles Técnicos Adicionales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Confort</p>
                                <FormGroup label="Botón de Encendido" value={formData.specsComfort.encendido} onChange={(v: string) => handleNestedChange('specsComfort', 'encendido', v)} />
                                <FormGroup label="Control de Crucero" value={formData.specsComfort.crucero} onChange={(v: string) => handleNestedChange('specsComfort', 'crucero', v)} />
                                <FormGroup label="Sensor de Distancia" value={formData.specsComfort.sensorDistancia} onChange={(v: string) => handleNestedChange('specsComfort', 'sensorDistancia', v)} />
                                <FormGroup label="Aire Acondicionado" value={formData.specsComfort.aire} onChange={(v: string) => handleNestedChange('specsComfort', 'aire', v)} />
                                <FormGroup label="Estacionamiento" value={formData.specsComfort.estacionamiento} onChange={(v: string) => handleNestedChange('specsComfort', 'estacionamiento', v)} />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Seguridad</p>
                                <FormGroup label="Bolsas de Aire Delanteras" value={formData.specsSecurity.airbagsDelanteros} onChange={(v: string) => handleNestedChange('specsSecurity', 'airbagsDelanteros', v)} />
                                <FormGroup label="Número total de Airbags" value={formData.specsSecurity.airbagsTotales} onChange={(v: string) => handleNestedChange('specsSecurity', 'airbagsTotales', v)} />
                                <FormGroup label="Cantidad de discos de freno" value={formData.specsSecurity.frenosDisco} onChange={(v: string) => handleNestedChange('specsSecurity', 'frenosDisco', v)} />
                                <FormGroup label="Frenos ABS" value={formData.specsSecurity.abs} onChange={(v: string) => handleNestedChange('specsSecurity', 'abs', v)} />
                                <FormGroup label="Control de estabilidad" value={formData.specsSecurity.estabilidad} onChange={(v: string) => handleNestedChange('specsSecurity', 'estabilidad', v)} />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Entretenimiento</p>
                                <FormGroup label="Pantalla Táctil" value={formData.specsEntertainment.pantalla} onChange={(v: string) => handleNestedChange('specsEntertainment', 'pantalla', v)} />
                                <FormGroup label="Apple CarPlay / Android Auto" value={formData.specsEntertainment.carplay} onChange={(v: string) => handleNestedChange('specsEntertainment', 'carplay', v)} />
                                <FormGroup label="Bluetooth" value={formData.specsEntertainment.bluetooth} onChange={(v: string) => handleNestedChange('specsEntertainment', 'bluetooth', v)} />
                                <FormGroup label="Radio" value={formData.specsEntertainment.radio} onChange={(v: string) => handleNestedChange('specsEntertainment', 'radio', v)} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-3 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Multimedia y Extras</h3>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Equipamiento / Características (ENTER)</label>
                            <input value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={addTag} className="w-full bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none" />
                            <div className="flex flex-wrap gap-2 pt-1 leading-none">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-2 leading-none">
                                        {tag}
                                        <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))} className="text-zinc-500 hover:text-white transition-colors leading-none">✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        {/* Inputs de carga reales (ocultos) */}
                        <input type="file" multiple className="hidden" ref={mainImagesRef} onChange={(e) => handleImageUpload(e, 'images')} />
                        <input type="file" multiple className="hidden" ref={exteriorImagesRef} onChange={(e) => handleImageUpload(e, 'exteriorImages')} />
                        <input type="file" multiple className="hidden" ref={interiorImagesRef} onChange={(e) => handleImageUpload(e, 'interiorImages')} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-7">
                            <ImageUploadPlaceholder label="Imágenes Principales" count={formData.images.length} onClick={() => mainImagesRef.current?.click()} />
                            <ImageUploadPlaceholder label="Detalles Exterior" count={formData.exteriorImages.length} onClick={() => exteriorImagesRef.current?.click()} />
                            <ImageUploadPlaceholder label="Detalles Interior" count={formData.interiorImages.length} onClick={() => interiorImagesRef.current?.click()} />
                        </div>

                        <div className="space-y-2.5">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Descripción</label>
                            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={10} className="w-full bg-[#F7F8FA] border-none rounded-2xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black transition-all resize-none leading-relaxed" />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}

// --- COMPONENTES AUXILIARES CON TIPOS ---
function FormGroup({ label, value, onChange, type = "text", placeholder = "" }: { label: string, value: any, onChange: (v: string) => void, type?: string, placeholder?: string }) {
    return (
        <div className="flex flex-col space-y-2 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input type={type} placeholder={placeholder} value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none" />
        </div>
    )
}

function FormSelect({ label, value, options, onChange }: { label: string, value: any, options: string[], onChange: (v: string) => void }) {
    return (
        <div className="flex flex-col space-y-2 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <div className="relative leading-none">
                <select value={value} onChange={(e) => onChange(e.target.value)} className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer leading-none">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg>
                </div>
            </div>
        </div>
    )
}

function ImageUploadPlaceholder({ label, count, onClick }: { label: string, count: number, onClick: () => void }) {
    return (
        <div className="flex flex-col space-y-2 text-left leading-none">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label} {count > 0 && `(${count})`}</p>
            <div onClick={onClick} className="aspect-video bg-[#F7F8FA] border-2 border-dashed border-zinc-100 rounded-[25px] flex flex-col items-center justify-center group hover:border-black transition-all cursor-pointer leading-none">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400">{count > 0 ? 'Añadir más' : 'Añadir Imagen'}</p>
            </div>
        </div>
    )
}