'use client'

import { useState, useRef, ChangeEvent, KeyboardEvent } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { writeClient } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'

// --- CONFIGURACIÓN DE PREVISUALIZACIÓN ---
const builder = imageUrlBuilder(writeClient)
function urlFor(source: any) {
    return builder.image(source)
}

// --- INTERFACES PARA TYPESCRIPT (0 ERRORES) ---
interface SanityImage {
    _type: 'image';
    _key: string;
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

    // --- ESTADO PARA EL MENÚ DE PERFIL ---
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    // Referencias para inputs de archivos
    const mainImagesRef = useRef<HTMLInputElement>(null)
    const exteriorImagesRef = useRef<HTMLInputElement>(null)
    const interiorImagesRef = useRef<HTMLInputElement>(null)

    // ESTADO CON LOS 46 CAMPOS EXACTOS
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

    // --- MANEJADORES ---
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
        const files = e.target.files; if (!files || files.length === 0) return
        setIsSubmitting(true)
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const asset = await writeClient.assets.upload('image', file)
                return {
                    _type: 'image' as const,
                    _key: Math.random().toString(36).substring(2),
                    asset: { _type: 'reference' as const, _ref: asset._id }
                }
            })
            const uploadedImages = await Promise.all(uploadPromises)
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ...uploadedImages] }))
        } catch (error) {
            console.error(error)
            alert("Error al subir. Revisa los permisos de tu Token.")
        } finally { setIsSubmitting(false) }
    }

    const removeImage = (field: 'images' | 'exteriorImages' | 'interiorImages', index: number) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
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
            await writeClient.create(doc)
            router.push('/admin/dashboard')
        } catch (error) {
            console.error(error)
            alert('Error al publicar. Revisa los permisos de escritura.')
        } finally { setIsSubmitting(false) }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40 text-left">

            {/* --- NAVEGACIÓN CON MENÚ --- */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 flex items-center shadow-none">
                <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center relative">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>

                    <div className="relative">
                        <div
                            onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                            className="flex items-center gap-3 cursor-pointer select-none group"
                        >
                            <div className="text-right hidden sm:block leading-none">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none text-black group-hover:text-zinc-600 transition-colors">Matías</p>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Admin</p>
                            </div>
                            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black group-hover:bg-zinc-800 transition-all shadow-none">M</div>
                        </div>

                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-4 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/5 z-20 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:bg-[#F7F8FA] transition-colors">Mi cuenta</button>
                                    <button className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:bg-[#F7F8FA] transition-colors">Preferencias</button>
                                    <div className="h-[1px] bg-gray-50 mx-4 my-1"></div>
                                    <button onClick={() => router.push('/')} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">Cerrar sesión</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex justify-between items-end mb-9 gap-4">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 italic leading-none">Gestión de vehículos</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Nuevo Vehículo</h1>
                    </div>
                    <div className="flex items-center gap-3 mb-0.5">
                        <Link href="/admin/dashboard" className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-zinc-200 rounded-xl hover:border-black transition-all whitespace-nowrap">volver</Link>
                        <button type="submit" form="car-form" onClick={handleSubmit} disabled={isSubmitting} className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap disabled:opacity-50">
                            {isSubmitting ? 'Guardando...' : 'Publicar Vehículo'}
                        </button>
                    </div>
                </header>

                <form id="car-form" className="space-y-8">
                    {/* BLOQUE 1: IDENTIDAD Y COMERCIAL */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Identidad y Comercial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            <FormGroup label="Marca" value={formData.make} onChange={(v) => handleChange('make', v)} />
                            <FormGroup label="Modelo" value={formData.model} onChange={(v) => handleChange('model', v)} />
                            <div className="flex flex-col space-y-2 text-left leading-none">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Enlace (Slug)</label>
                                <div className="flex gap-2 h-[42px]">
                                    <input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-4 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all" />
                                    <button type="button" onClick={generateSlug} className="bg-[#F0F2F5] px-4 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all whitespace-nowrap flex items-center justify-center h-full">Generar</button>
                                </div>
                            </div>
                            <FormGroup label="Año" type="number" value={formData.year} onChange={(v) => handleChange('year', parseInt(v) || 0)} />
                            <FormSelect label="Etiqueta (Badge)" value={formData.category} options={['Seminuevo', 'Recién Llegado', 'Oferta de la Semana', 'Reserva Online', 'Garantía VDL', 'Único Dueño', 'Oportunidad', 'Vendido']} onChange={(v) => handleChange('category', v)} />
                            <FormGroup label="Precio Lista" type="number" value={formData.listPrice} onChange={(v) => handleChange('listPrice', parseInt(v) || 0)} />
                            <FormGroup label="Precio Financiado" type="number" value={formData.financedPrice} onChange={(v) => handleChange('financedPrice', parseInt(v) || 0)} />
                            <FormGroup label="Kilometraje" type="number" value={formData.mileage} onChange={(v) => handleChange('mileage', parseInt(v) || 0)} />
                        </div>
                    </div>

                    {/* BLOQUE 2: FICHA TÉCNICA */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Ficha Técnica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-7">
                            <div className="md:col-span-2"><FormGroup label="Motor" value={formData.engine} onChange={(v) => handleChange('engine', v)} /></div>
                            <FormSelect label="Carrocería" value={formData.body} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} onChange={(v) => handleChange('body', v)} />
                            <FormSelect label="Transmisión" value={formData.transmission} options={['Automática', 'Manual']} onChange={(v) => handleChange('transmission', v)} />
                            <FormSelect label="Tracción" value={formData.drivetrain} options={['Delantera', 'Trasera', '4x4', '4x2']} onChange={(v) => handleChange('drivetrain', v)} />
                            <FormSelect label="Combustible" value={formData.fuel} options={['Bencina', 'Diésel', 'Híbrido', 'Eléctrico']} onChange={(v) => handleChange('fuel', v)} />
                            <FormSelect label="Color" value={formData.color} options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} onChange={(v) => handleChange('color', v)} />
                            <div className="md:col-span-1"><FormGroup label="Ubicación" value={formData.location} onChange={(v) => handleChange('location', v)} /></div>
                        </div>
                    </div>

                    {/* BLOQUE 3: GENERAL E HISTORIAL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: General</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Cilindrada" value={formData.specsGeneral.cilindrada} onChange={(v) => handleNestedChange('specsGeneral', 'cilindrada', v)} />
                                <FormGroup label="Cilindros" value={formData.specsGeneral.cilindros} onChange={(v) => handleNestedChange('specsGeneral', 'cilindros', v)} />
                                <FormGroup label="Potencia" value={formData.specsGeneral.potencia} onChange={(v) => handleNestedChange('specsGeneral', 'potencia', v)} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Historial</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Dueños" value={formData.specsHistory.duenos} onChange={(v) => handleNestedChange('specsHistory', 'duenos', v)} />
                                <FormGroup label="Mantenciones" value={formData.specsHistory.mantenciones} onChange={(v) => handleNestedChange('specsHistory', 'mantenciones', v)} />
                                <FormGroup label="Historial Autofact" value={formData.specsHistory.historial} onChange={(v) => handleNestedChange('specsHistory', 'historial', v)} />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 4: EXTERIOR E INTERIOR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 leading-none">Especificaciones: Exterior</h3>
                            <div className="grid grid-cols-2 gap-7">
                                <FormGroup label="Nº Puertas" value={formData.specsExterior.puertas} onChange={(v) => handleNestedChange('specsExterior', 'puertas', v)} />
                                <FormGroup label="Diámetro Rin" value={formData.specsExterior.rin} onChange={(v) => handleNestedChange('specsExterior', 'rin', v)} />
                                <FormGroup label="Tipo Rin" value={formData.specsExterior.tipoRin} onChange={(v) => handleNestedChange('specsExterior', 'tipoRin', v)} />
                                <FormGroup label="Luces" value={formData.specsExterior.luces} onChange={(v) => handleNestedChange('specsExterior', 'luces', v)} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 leading-none">Especificaciones: Interior</h3>
                            <div className="grid grid-cols-1 gap-7">
                                <FormGroup label="Nº Pasajeros" value={formData.specsInterior.pasajeros} onChange={(v) => handleNestedChange('specsInterior', 'pasajeros', v)} />
                                <FormGroup label="Material Asientos" value={formData.specsInterior.materialAsientos} onChange={(v) => handleNestedChange('specsInterior', 'materialAsientos', v)} />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 5: ADICIONALES */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Detalles Técnicos Adicionales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-10">
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Confort</p>
                                <FormGroup label="Botón de Encendido" value={formData.specsComfort.encendido} onChange={(v) => handleNestedChange('specsComfort', 'encendido', v)} />
                                <FormGroup label="Control de Crucero" value={formData.specsComfort.crucero} onChange={(v) => handleNestedChange('specsComfort', 'crucero', v)} />
                                <FormGroup label="Sensor de Distancia" value={formData.specsComfort.sensorDistancia} onChange={(v) => handleNestedChange('specsComfort', 'sensorDistancia', v)} />
                                <FormGroup label="Aire Acondicionado" value={formData.specsComfort.aire} onChange={(v) => handleNestedChange('specsComfort', 'aire', v)} />
                                <FormGroup label="Asistencia Estacionamiento" value={formData.specsComfort.estacionamiento} onChange={(v) => handleNestedChange('specsComfort', 'estacionamiento', v)} />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Seguridad</p>
                                <FormGroup label="Bolsas de Aire Delanteras" value={formData.specsSecurity.airbagsDelanteros} onChange={(v) => handleNestedChange('specsSecurity', 'airbagsDelanteros', v)} />
                                <FormGroup label="Número total de Airbags" value={formData.specsSecurity.airbagsTotales} onChange={(v) => handleNestedChange('specsSecurity', 'airbagsTotales', v)} />
                                <FormGroup label="Cantidad discos freno" value={formData.specsSecurity.frenosDisco} onChange={(v) => handleNestedChange('specsSecurity', 'frenosDisco', v)} />
                                <FormGroup label="Frenos ABS" value={formData.specsSecurity.abs} onChange={(v) => handleNestedChange('specsSecurity', 'abs', v)} />
                                <FormGroup label="Control estabilidad" value={formData.specsSecurity.estabilidad} onChange={(v) => handleNestedChange('specsSecurity', 'estabilidad', v)} />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Entretenimiento</p>
                                <FormGroup label="Pantalla Táctil" value={formData.specsEntertainment.pantalla} onChange={(v) => handleNestedChange('specsEntertainment', 'pantalla', v)} />
                                <FormGroup label="Apple CarPlay / Android Auto" value={formData.specsEntertainment.carplay} onChange={(v) => handleNestedChange('specsEntertainment', 'carplay', v)} />
                                <FormGroup label="Bluetooth" value={formData.specsEntertainment.bluetooth} onChange={(v) => handleNestedChange('specsEntertainment', 'bluetooth', v)} />
                                <FormGroup label="Radio" value={formData.specsEntertainment.radio} onChange={(v) => handleNestedChange('specsEntertainment', 'radio', v)} />
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-3 shadow-none text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Multimedia y Extras</h3>
                        <div className="space-y-2.5 text-left">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Equipamiento (ENTER)</label>
                            <input value={currentTag} onChange={(e) => setCurrentTag(e.target.value)} onKeyDown={addTag} className="w-full bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black leading-none" />
                            <div className="flex flex-wrap gap-2 pt-1 leading-none">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-black text-white text-[9px] font-black uppercase tracking-widest px-3 py-2 rounded-lg flex items-center gap-2 leading-none">
                                        {tag} <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <input type="file" multiple className="hidden" ref={mainImagesRef} onChange={(e) => handleImageUpload(e, 'images')} />
                        <input type="file" multiple className="hidden" ref={exteriorImagesRef} onChange={(e) => handleImageUpload(e, 'exteriorImages')} />
                        <input type="file" multiple className="hidden" ref={interiorImagesRef} onChange={(e) => handleImageUpload(e, 'interiorImages')} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-7 leading-none pt-4">
                            <ImageUploadPlaceholder label="Imágenes Principales" images={formData.images} field="images" onRemove={removeImage} onClick={() => mainImagesRef.current?.click()} />
                            <ImageUploadPlaceholder label="Fotos Detalles Exterior" images={formData.exteriorImages} field="exteriorImages" onRemove={removeImage} onClick={() => exteriorImagesRef.current?.click()} />
                            <ImageUploadPlaceholder label="Fotos Detalles Interior" images={formData.interiorImages} field="interiorImages" onRemove={removeImage} onClick={() => interiorImagesRef.current?.click()} />
                        </div>

                        <div className="space-y-2.5 pt-4 text-left">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Descripción</label>
                            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={6} className="w-full bg-[#F7F8FA] border-none rounded-2xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black resize-none leading-relaxed" />
                        </div>
                    </div>
                </form>
            </main>
        </div>
    )
}

// --- AUXILIARES CON TIPADO ESTRICTO ---
interface FGProps { label: string; value: string | number | undefined; onChange: (v: string) => void; type?: string; placeholder?: string; }
function FormGroup({ label, value, onChange, type = "text", placeholder = "" }: FGProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input type={type} placeholder={placeholder} value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none" />
        </div>
    )
}

interface FSProps { label: string; value: string | undefined; options: string[]; onChange: (v: string) => void; }
function FormSelect({ label, value, options, onChange }: FSProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <div className="relative leading-none">
                <select value={value ?? ''} onChange={(e) => onChange(e.target.value)} className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer leading-none">
                    {options.map(opt => <option key={opt} value={opt}>{opt}</option>)}
                </select>
                <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400"><svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" /></svg></div>
            </div>
        </div>
    )
}

function ImageUploadPlaceholder({ label, images, field, onClick, onRemove }: any) {
    return (
        <div className="flex flex-col space-y-3 text-left leading-none">
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label} {images.length > 0 && `(${images.length})`}</p>
            <div onClick={onClick} className="aspect-video bg-[#F7F8FA] border-2 border-dashed border-zinc-100 rounded-[25px] flex flex-col items-center justify-center group hover:border-black transition-all cursor-pointer">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400">Añadir Imagen</p>
            </div>
            {images.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {images.map((img: any, i: number) => (
                        <div key={img._key || i} className="relative aspect-video group leading-none">
                            <img src={urlFor(img).width(200).url()} className="w-full h-full object-cover rounded-2xl border border-zinc-100" alt="Preview" />
                            <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(field, i); }} className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10">
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}