'use client'

import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { writeClient } from '@/sanity/lib/client'
import imageUrlBuilder from '@sanity/image-url'
import AdminNavigation from '@/components/AdminNavigation'

// --- CONFIGURACIÓN DE PREVISUALIZACIÓN ---
const builder = imageUrlBuilder(writeClient)
function urlFor(source: any) {
    return builder.image(source)
}

// --- INTERFACES PARA TYPESCRIPT ---
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

export default function EditarVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [tags, setTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState('')

    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

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

    useEffect(() => {
        const fetchCar = async () => {
            try {
                const car = await writeClient.fetch(`*[_type == "car" && _id == $id][0]`, { id })
                if (car) {
                    setFormData({
                        make: car.make || '',
                        model: car.model || '',
                        slug: car.slug?.current || '',
                        year: car.year || new Date().getFullYear(),
                        category: car.category || 'Seminuevo',
                        listPrice: car.listPrice || 0,
                        financedPrice: car.financedPrice || 0,
                        mileage: car.mileage || 0,
                        engine: car.engine || '',
                        body: car.body || 'SUV',
                        transmission: car.transmission || 'Automática',
                        drivetrain: car.drivetrain || 'Delantera',
                        fuel: car.fuel || 'Bencina',
                        color: car.color || 'Blanco',
                        location: car.location || 'Metropolitana de Santiago',
                        specsGeneral: {
                            cilindrada: car.specsGeneral?.cilindrada || '',
                            cilindros: car.specsGeneral?.cilindros || '',
                            potencia: car.specsGeneral?.potencia || ''
                        },
                        specsHistory: {
                            duenos: car.specsHistory?.duenos || '',
                            mantenciones: car.specsHistory?.mantenciones || '',
                            historial: car.specsHistory?.historial || ''
                        },
                        specsExterior: {
                            puertas: car.specsExterior?.puertas || '',
                            rin: car.specsExterior?.rin || '',
                            tipoRin: car.specsExterior?.tipoRin || '',
                            luces: car.specsExterior?.luces || ''
                        },
                        specsComfort: {
                            encendido: car.specsComfort?.encendido || '',
                            crucero: car.specsComfort?.crucero || '',
                            sensorDistancia: car.specsComfort?.sensorDistancia || '',
                            aire: car.specsComfort?.aire || '',
                            estacionamiento: car.specsComfort?.estacionamiento || ''
                        },
                        specsSecurity: {
                            airbagsDelanteros: car.specsSecurity?.airbagsDelanteros || '',
                            airbagsTotales: car.specsSecurity?.airbagsTotales || '',
                            frenosDisco: car.specsSecurity?.frenosDisco || '',
                            abs: car.specsSecurity?.abs || '',
                            estabilidad: car.specsSecurity?.estabilidad || ''
                        },
                        specsInterior: {
                            pasajeros: car.specsInterior?.pasajeros || '',
                            materialAsientos: car.specsInterior?.materialAsientos || ''
                        },
                        specsEntertainment: {
                            pantalla: car.specsEntertainment?.pantalla || '',
                            carplay: car.specsEntertainment?.carplay || '',
                            bluetooth: car.specsEntertainment?.bluetooth || '',
                            radio: car.specsEntertainment?.radio || ''
                        },
                        description: car.description || '',
                        images: car.images || [],
                        exteriorImages: car.exteriorImages || [],
                        interiorImages: car.interiorImages || []
                    })
                    setTags(car.features || [])
                }
            } catch (error) {
                console.error(error)
            } finally {
                setIsLoading(false)
            }
        }
        fetchCar()
    }, [id])

    const handleChange = (field: keyof CarFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNestedChange = (group: keyof CarFormData, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [group]: { ...(prev[group] as Record<string, any>), [field]: value }
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
            const uploaded = await Promise.all(uploadPromises)
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ...uploaded] }))
        } catch (error) { alert("Error al subir imagen") }
        finally { setIsSubmitting(false) }
    }

    const removeImage = (field: 'images' | 'exteriorImages' | 'interiorImages', index: number) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
    }

    // NUEVA FUNCIÓN PARA PROCESAR COMAS Y BOTÓN
    const handleAddTags = () => {
        if (!currentTag.trim()) return;

        // Separamos por comas, limpiamos espacios y filtramos duplicados/vacíos
        const newTags = currentTag
            .split(',')
            .map(tag => tag.trim())
            .filter(tag => tag !== "" && !tags.includes(tag));

        setTags([...tags, ...newTags]);
        setCurrentTag('');
    };

    const addTag = (e: KeyboardEvent) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            handleAddTags();
        }
    }

    const handleSubmit = async (e?: React.FormEvent) => {
        if (e) e.preventDefault()
        setIsSubmitting(true)
        try {
            const doc = {
                ...formData,
                slug: { _type: 'slug', current: formData.slug },
                features: tags
            }
            await writeClient.patch(id).set(doc).commit()
            router.push('/admin/dashboard')
        } catch (error) {
            alert('Error al guardar cambios.')
        } finally { setIsSubmitting(false) }
    }

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar este vehículo permanentemente?')) {
            setIsSubmitting(true)
            try {
                await writeClient.delete(id)
                router.push('/admin/dashboard')
            } catch (error) {
                alert('Error al eliminar el vehículo.')
                setIsSubmitting(false)
            }
        }
    }

    if (isLoading) return null

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-32 sm:pb-40 text-left">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex justify-between items-end mb-9 gap-4">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Editor de inventario</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Editar Vehículo</h1>
                    </div>
                    {/* ACCIONES DESKTOP */}
                    <div className="hidden sm:flex items-center gap-3">
                        <button
                            onClick={handleDelete}
                            disabled={isSubmitting}
                            className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-red-100 text-red-500 rounded-xl hover:bg-red-50 transition-all disabled:opacity-50"
                        >
                            Eliminar Vehículo
                        </button>
                        <Link href="/admin/dashboard" className="text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 border border-zinc-200 rounded-xl hover:border-black transition-all">Cancelar</Link>
                        <button onClick={() => handleSubmit()} disabled={isSubmitting} className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </header>

                <form id="car-form" className="space-y-8">
                    {/* BLOQUE 1: IDENTIDAD */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Identidad y Comercial</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <FormGroup label="Marca" value={formData.make} onChange={(val: string) => handleChange('make', val)} />
                            <FormGroup label="Modelo" value={formData.model} onChange={(val: string) => handleChange('model', val)} />
                            <div className="flex flex-col space-y-2.5 text-left leading-none">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Enlace (Slug)</label>
                                <div className="flex gap-2 h-[42px]">
                                    <input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black" />
                                    <button type="button" onClick={generateSlug} className="bg-[#F0F2F5] px-4 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all h-full">Generar</button>
                                </div>
                            </div>
                            <FormGroup label="Año" type="number" value={formData.year} onChange={(val: string) => handleChange('year', parseInt(val) || 0)} />
                            <FormSelect label="Etiqueta (Badge)" value={formData.category} options={['Seminuevo', 'Recién Llegado', 'Oferta de la Semana', 'Reserva Online', 'Garantía VDL', 'Único Dueño', 'Oportunidad', 'Vendido']} onChange={(val: string) => handleChange('category', val)} />
                            <FormGroup label="Precio Lista" type="number" value={formData.listPrice} onChange={(val: string) => handleChange('listPrice', parseInt(val) || 0)} />
                            <FormGroup label="Precio Financiado" type="number" value={formData.financedPrice} onChange={(val: string) => handleChange('financedPrice', parseInt(val) || 0)} />
                            <FormGroup label="Kilometraje" type="number" value={formData.mileage} onChange={(val: string) => handleChange('mileage', parseInt(val) || 0)} />
                        </div>
                    </div>

                    {/* BLOQUE 2: FICHA TÉCNICA */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Ficha Técnica</h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <div className="md:col-span-2">
                                <FormGroup label="Motor (Cilindrada/Potencia)" value={formData.engine} onChange={(val: string) => handleChange('engine', val)} />
                            </div>
                            <FormSelect label="Carrocería" value={formData.body} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} onChange={(val: string) => handleChange('body', val)} />
                            <FormSelect label="Transmisión" value={formData.transmission} options={['Automática', 'Manual']} onChange={(val: string) => handleChange('transmission', val)} />
                            <FormSelect label="Tracción" value={formData.drivetrain} options={['Delantera', 'Trasera', '4x4', '4x2']} onChange={(val: string) => handleChange('drivetrain', val)} />
                            <FormSelect label="Combustible" value={formData.fuel} options={['Bencina', 'Diésel', 'Híbrido', 'Eléctrico']} onChange={(val: string) => handleChange('fuel', val)} />
                            <FormSelect label="Color" value={formData.color} options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} onChange={(val: string) => handleChange('color', val)} />
                            <div className="md:col-span-1">
                                <FormGroup label="Ubicación" value={formData.location} onChange={(val: string) => handleChange('location', val)} />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 3: GENERAL E HISTORIAL */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: General</h3>
                            <FormGroup label="Cilindrada" value={formData.specsGeneral?.cilindrada} onChange={(val: string) => handleNestedChange('specsGeneral', 'cilindrada', val)} />
                            <FormGroup label="Cilindros" value={formData.specsGeneral?.cilindros} onChange={(val: string) => handleNestedChange('specsGeneral', 'cilindros', val)} />
                            <FormGroup label="Potencia" value={formData.specsGeneral?.potencia} onChange={(val: string) => handleNestedChange('specsGeneral', 'potencia', val)} />
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Especificaciones: Historial</h3>
                            <FormGroup label="Dueños" value={formData.specsHistory?.duenos} onChange={(val: string) => handleNestedChange('specsHistory', 'duenos', val)} />
                            <FormGroup label="Mantenciones" value={formData.specsHistory?.mantenciones} onChange={(val: string) => handleNestedChange('specsHistory', 'mantenciones', val)} />
                            <FormGroup label="Historial Autofact" value={formData.specsHistory?.historial} onChange={(val: string) => handleNestedChange('specsHistory', 'historial', val)} />
                        </div>
                    </div>

                    {/* BLOQUE 4: EXTERIOR E INTERIOR */}
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 leading-none">Especificaciones: Exterior</h3>
                            <div className="grid grid-cols-2 gap-5">
                                <FormGroup label="Número de Puertas" value={formData.specsExterior.puertas} onChange={(val: string) => handleNestedChange('specsExterior', 'puertas', val)} />
                                <FormGroup label="Diámetro de Rin" value={formData.specsExterior.rin} onChange={(val: string) => handleNestedChange('specsExterior', 'rin', val)} />
                                <FormGroup label="Tipo de Rin" value={formData.specsExterior.tipoRin} onChange={(val: string) => handleNestedChange('specsExterior', 'tipoRin', val)} />
                                <FormGroup label="Tipo de Luces" value={formData.specsExterior.luces} onChange={(val: string) => handleNestedChange('specsExterior', 'luces', val)} />
                            </div>
                        </div>
                        <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-4 leading-none">Especificaciones: Interior</h3>
                            <FormGroup label="Número de Pasajeros" value={formData.specsInterior.pasajeros} onChange={(val: string) => handleNestedChange('specsInterior', 'pasajeros', val)} />
                            <FormGroup label="Material Asientos" value={formData.specsInterior.materialAsientos} onChange={(val: string) => handleNestedChange('specsInterior', 'materialAsientos', val)} />
                        </div>
                    </div>

                    {/* BLOQUE 5: DETALLES ADICIONALES */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-5 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Detalles Técnicos Adicionales</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Confort</p>
                                <FormGroup label="Botón de Encendido" value={formData.specsComfort.encendido} onChange={(val: string) => handleNestedChange('specsComfort', 'encendido', val)} />
                                <FormGroup label="Control de Crucero" value={formData.specsComfort.crucero} onChange={(val: string) => handleNestedChange('specsComfort', 'crucero', val)} />
                                <FormGroup label="Sensor de Distancia" value={formData.specsComfort.sensorDistancia} onChange={(val: string) => handleNestedChange('specsComfort', 'sensorDistancia', val)} />
                                <FormGroup label="Aire Acondicionado" value={formData.specsComfort.aire} onChange={(val: string) => handleNestedChange('specsComfort', 'aire', val)} />
                                <FormGroup label="Asistencia Estacionamiento" value={formData.specsComfort.estacionamiento} onChange={(val: string) => handleNestedChange('specsComfort', 'estacionamiento', val)} />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Seguridad</p>
                                <FormGroup label="Bolsas de Aire Delanteras" value={formData.specsSecurity.airbagsDelanteros} onChange={(val: string) => handleNestedChange('specsSecurity', 'airbagsDelanteros', val)} />
                                <FormGroup label="Número total de Airbags" value={formData.specsSecurity.airbagsTotales} onChange={(val: string) => handleNestedChange('specsSecurity', 'airbagsTotales', val)} />
                                <FormGroup label="Cantidad discos freno" value={formData.specsSecurity.frenosDisco} onChange={(val: string) => handleNestedChange('specsSecurity', 'frenosDisco', val)} />
                                <FormGroup label="Frenos ABS" value={formData.specsSecurity.abs} onChange={(val: string) => handleNestedChange('specsSecurity', 'abs', val)} />
                                <FormGroup label="Control estabilidad" value={formData.specsSecurity.estabilidad} onChange={(val: string) => handleNestedChange('specsSecurity', 'estabilidad', val)} />
                            </div>
                            <div className="space-y-6">
                                <p className="text-[9px] font-black text-zinc-600 uppercase leading-none ml-1">Entretenimiento</p>
                                <FormGroup label="Pantalla Táctil" value={formData.specsEntertainment.pantalla} onChange={(val: string) => handleNestedChange('specsEntertainment', 'pantalla', val)} />
                                <FormGroup label="Apple CarPlay / Android Auto" value={formData.specsEntertainment.carplay} onChange={(val: string) => handleNestedChange('specsEntertainment', 'carplay', val)} />
                                <FormGroup label="Bluetooth" value={formData.specsEntertainment.bluetooth} onChange={(val: string) => handleNestedChange('specsEntertainment', 'bluetooth', val)} />
                                <FormGroup label="Radio" value={formData.specsEntertainment.radio} onChange={(val: string) => handleNestedChange('specsEntertainment', 'radio', val)} />
                            </div>
                        </div>
                    </div>

                    {/* BLOQUE 6: MULTIMEDIA Y EXTRAS */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-7 space-y-3 shadow-none text-left">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Multimedia y Extras</h3>
                        <div className="space-y-2.5 text-left">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Equipamiento / Características (Comas o ENTER)</label>
                            <div className="flex gap-2 h-[45px]">
                                <input
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder="Aire Acondicionado, Bluetooth, Llantas..."
                                    className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black leading-none"
                                />
                                <button
                                    type="button"
                                    onClick={handleAddTags}
                                    className="bg-black text-white px-6 rounded-xl text-[9px] font-black uppercase tracking-widest hover:bg-zinc-800 transition-all active:scale-95"
                                >
                                    Agregar
                                </button>
                            </div>
                            <div className="flex flex-wrap gap-2 pt-1 leading-none">
                                {tags.map(tag => (
                                    <span key={tag} className="bg-black text-white text-[9px] font-black uppercase px-3 py-2 rounded-lg flex items-center gap-2 leading-none">
                                        {tag} <button type="button" onClick={() => setTags(tags.filter(t => t !== tag))}>✕</button>
                                    </span>
                                ))}
                            </div>
                        </div>

                        <input type="file" multiple className="hidden" ref={mainImagesRef} onChange={(e) => handleImageUpload(e, 'images')} />
                        <input type="file" multiple className="hidden" ref={exteriorImagesRef} onChange={(e) => handleImageUpload(e, 'exteriorImages')} />
                        <input type="file" multiple className="hidden" ref={interiorImagesRef} onChange={(e) => handleImageUpload(e, 'interiorImages')} />

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5 leading-none pt-1">
                            <ImageUploadPlaceholder label="Imágenes Principales" images={formData.images} field="images" onRemove={removeImage} onClick={() => mainImagesRef.current?.click()} />
                            <ImageUploadPlaceholder label="Fotos Detalles Exterior" images={formData.exteriorImages} field="exteriorImages" onRemove={removeImage} onClick={() => exteriorImagesRef.current?.click()} />
                            <ImageUploadPlaceholder label="Fotos Detalles Interior" images={formData.interiorImages} field="interiorImages" onRemove={removeImage} onClick={() => interiorImagesRef.current?.click()} />
                        </div>

                        <div className="space-y-2.5 pt-2 text-left">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Descripción</label>
                            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={6} className="w-full bg-[#F7F8FA] border-none rounded-2xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black resize-none leading-relaxed" />
                        </div>
                    </div>
                </form>
            </main>

            {/* ACCIONES MÓVIL: Barra Inferior */}
            <div className="sm:hidden fixed bottom-0 left-0 right-0 bg-white/90 backdrop-blur-md border-t border-gray-100 p-4 z-[110] flex items-center gap-3">
                <button
                    onClick={handleDelete}
                    className="w-12 h-12 flex items-center justify-center border border-red-100 text-red-500 rounded-2xl bg-red-50/50"
                >
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                    </svg>
                </button>
                <Link href="/admin/dashboard" className="flex-1 h-12 flex items-center justify-center border border-zinc-200 rounded-2xl text-[10px] font-black uppercase tracking-widest text-zinc-500">
                    Cancelar
                </Link>
                <button
                    onClick={() => handleSubmit()}
                    disabled={isSubmitting}
                    className="flex-[2] h-12 bg-black text-white rounded-2xl text-[10px] font-black uppercase tracking-widest shadow-lg shadow-black/20"
                >
                    {isSubmitting ? '...' : 'Guardar'}
                </button>
            </div>
        </div>
    )
}

// --- AUXILIARES TIPADOS ---
interface FGProps { label: string; value: string | number | undefined; onChange: (v: string) => void; type?: string; placeholder?: string; }
function FormGroup({ label, value, onChange, type = "text", placeholder = "" }: FGProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value ?? ''}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all leading-none"
            />
        </div>
    )
}

interface FSProps { label: string; value: string | undefined; options: string[]; onChange: (v: string) => void; }
function FormSelect({ label, value, options, onChange }: FSProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <div className="relative leading-none">
                <select
                    value={value ?? ''}
                    onChange={(e) => onChange(e.target.value)}
                    className="w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-black uppercase outline-none focus:ring-1 focus:ring-black appearance-none cursor-pointer leading-none"
                >
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
            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label} {images?.length > 0 && `(${images.length})`}</p>
            <div onClick={onClick} className="aspect-video bg-[#F7F8FA] border-2 border-dashed border-zinc-100 rounded-[25px] flex flex-col items-center justify-center group hover:border-black transition-all cursor-pointer">
                <div className="w-10 h-10 bg-white rounded-full flex items-center justify-center mb-3 group-hover:bg-black group-hover:text-white transition-all shadow-none">
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                </div>
                <p className="text-[8px] font-black uppercase tracking-widest leading-none text-zinc-400">Añadir Imagen</p>
            </div>
            {images?.length > 0 && (
                <div className="grid grid-cols-2 gap-3 mt-2">
                    {images.map((img: any, i: number) => (
                        <div key={img._key || i} className="relative aspect-video group leading-none">
                            <img src={urlFor(img).width(200).url()} className="w-full h-full object-cover rounded-2xl border border-zinc-100" alt="Preview" />
                            <button
                                type="button"
                                onClick={(e) => { e.stopPropagation(); onRemove(field, i); }}
                                className="absolute -top-1.5 -right-1.5 w-6 h-6 bg-black text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all z-10"
                            >
                                <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" />
                                </svg>
                            </button>
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}