'use client'
/* eslint-disable @next/next/no-img-element */

import { useState, useRef, ChangeEvent, KeyboardEvent, useEffect, use } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
// Importamos el cliente de lectura (seguro para el cliente) y las acciones de servidor
import { client as readClient } from '@/sanity/lib/client'
import { uploadSanityImage } from '@/app/actions/vehiculosActions'
import { saveCarAction, deleteCarAction } from '@/app/actions/carActions'
import { syncBrandDatabaseAction } from '@/app/actions/brandActions' // Acción para sincronizar la base de datos
import imageUrlBuilder from '@sanity/image-url'
import AdminNavigation from '@/components/AdminNavigation'
import AdminSoftSelect from '@/components/AdminSoftSelect'
import AdminCombobox from '@/components/AdminCombobox'
import AdminCollapsibleCard from '@/components/AdminCollapsibleCard'

// --- CONFIGURACIÓN DE PREVISUALIZACIÓN ---
// Usamos el cliente de lectura para evitar errores de token en el navegador
const builder = imageUrlBuilder(readClient)
function urlFor(source: SanityImage) {
    return builder.image(source)
}

// --- FUNCIONES DE FORMATO CHILENO (MILÉSIMAS CON PUNTOS) ---
const formatChileanNumber = (value: number | string) => {
    if (value === 0 || value === '0') return '0';
    if (!value) return '';
    // Quitamos cualquier cosa que no sea número
    const num = value.toString().replace(/\D/g, '');
    // Insertamos los puntos cada 3 dígitos
    return num.replace(/\B(?=(\d{3})+(?!\d))/g, ".");
};

const parseChileanNumber = (value: string) => {
    // Quitamos los puntos para volver a tener un número entero puro para la base de datos
    return parseInt(value.replace(/\./g, '')) || 0;
};

// --- INTERFACES PARA TYPESCRIPT ---
interface SanityImage {
    _type: 'image';
    _key: string;
    asset: { _type: 'reference'; _ref: string };
}

interface CarFormData {
    make: string;
    model: string;
    version: string;
    slug: string;
    year: number;
    category: string;
    listPrice: number;
    financedPrice: number;
    mileage: number;
    engine: string;
    body: string;
    transmission: string;
    drivetrain: string;
    fuel: string;
    color: string;
    location: string;
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

interface BrandModel {
    modelName: string;
    versions?: string[];
}

interface BrandOption {
    name: string;
    models?: BrandModel[];
}

type NestedCarGroupKey =
    | 'specsGeneral'
    | 'specsHistory'
    | 'specsExterior'
    | 'specsComfort'
    | 'specsSecurity'
    | 'specsInterior'
    | 'specsEntertainment';

export default function EditarVehiculoPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = use(params)
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isLoading, setIsLoading] = useState(true)
    const [tags, setTags] = useState<string[]>([])
    const [currentTag, setCurrentTag] = useState('')
    const [expandedSections, setExpandedSections] = useState({
        identidad: true,
        ficha: true,
        specsGeneralHistorial: true,
        specsExteriorInterior: true,
        detalles: true,
        multimedia: true,
    })

    // --- ESTADOS PARA LA BASE DE DATOS DE MARCAS/MODELOS ---
    const [dbBrands, setDbBrands] = useState<BrandOption[]>([])

    const mainImagesRef = useRef<HTMLInputElement>(null)
    const exteriorImagesRef = useRef<HTMLInputElement>(null)
    const interiorImagesRef = useRef<HTMLInputElement>(null)

    const [formData, setFormData] = useState<CarFormData>({
        make: '',
        model: '',
        version: '',
        slug: '',
        year: new Date().getFullYear(),
        category: 'Seminuevo',
        listPrice: 0,
        financedPrice: 0,
        mileage: 0,
        engine: '',
        body: 'SUV',
        transmission: 'Automática',
        drivetrain: 'Delantera',
        fuel: 'Bencina',
        color: 'Blanco',
        location: '',
        specsGeneral: { cilindrada: '', cilindros: '', potencia: '' },
        specsHistory: { duenos: '', mantenciones: '', historial: '' },
        specsExterior: { puertas: '', rin: '', tipoRin: '', luces: '' },
        specsComfort: { encendido: '', crucero: '', sensorDistancia: '', aire: '', estacionamiento: '' },
        specsSecurity: { airbagsDelanteros: '', airbagsTotales: '', frenosDisco: '', abs: '', estabilidad: '' },
        specsInterior: { pasajeros: '', materialAsientos: '' },
        specsEntertainment: { pantalla: '', carplay: '', bluetooth: '', radio: '' },
        description: '',
        images: [],
        exteriorImages: [],
        interiorImages: []
    })

    useEffect(() => {
        const loadData = async () => {
            try {
                // 1. Cargar la base de datos de marcas
                const brands = await readClient.fetch(`*[_type == "brand"] | order(name asc) { name, models }`)
                setDbBrands(brands)

                // 2. Cargar los datos del vehículo actual
                const car = await readClient.fetch(`*[_type == "car" && _id == $id][0]`, { id })

                if (car) {
                    setFormData({
                        make: car.make || '',
                        model: car.model || '',
                        version: car.version || '',
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
                        location: car.location || '',
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
                console.error("Error al cargar datos:", error)
            } finally {
                setIsLoading(false)
            }
        }
        loadData()
    }, [id])

    const handleChange = (field: keyof CarFormData, value: string | number) => {
        setFormData(prev => ({ ...prev, [field]: value }))
    }

    const handleNestedChange = (group: NestedCarGroupKey, field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            [group]: { ...prev[group], [field]: value }
        }))
    }

    const generateSlug = () => {
        const versionPart = formData.version ? `-${formData.version}` : ''
        const generated = `${formData.make}-${formData.model}${versionPart}-${formData.year}`
            .toLowerCase().trim().replace(/\s+/g, '-').replace(/[^\w-]+/g, '')
        handleChange('slug', generated)
    }

    const handleImageUpload = async (e: ChangeEvent<HTMLInputElement>, field: 'images' | 'exteriorImages' | 'interiorImages') => {
        const files = e.target.files; if (!files || files.length === 0) return
        setIsSubmitting(true)
        try {
            const uploadPromises = Array.from(files).map(async (file) => {
                const imgFormData = new FormData()
                imgFormData.append('file', file)

                const result = await uploadSanityImage(imgFormData)
                if (!result.success || !result.assetId) throw new Error("Fallo en la subida")

                return {
                    _type: 'image' as const,
                    _key: Math.random().toString(36).substring(2),
                    asset: { _type: 'reference' as const, _ref: result.assetId }
                }
            })
            const uploaded = await Promise.all(uploadPromises)
            setFormData(prev => ({ ...prev, [field]: [...prev[field], ...uploaded] }))
        } catch { alert("Error al subir imagen") }
        finally { setIsSubmitting(false) }
    }

    const removeImage = (field: 'images' | 'exteriorImages' | 'interiorImages', index: number) => {
        setFormData(prev => ({ ...prev, [field]: prev[field].filter((_, i) => i !== index) }))
    }

    const moveImage = (field: 'images' | 'exteriorImages' | 'interiorImages', index: number, direction: 'left' | 'right') => {
        const newImages = [...formData[field]]
        const targetIndex = direction === 'left' ? index - 1 : index + 1
        if (targetIndex < 0 || targetIndex >= newImages.length) return
        [newImages[index], newImages[targetIndex]] = [newImages[targetIndex], newImages[index]]
        setFormData(prev => ({ ...prev, [field]: newImages }))
    }

    const handleAddTags = () => {
        if (!currentTag.trim()) return;
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
            // Sincronizar base de datos de marcas si hay valores nuevos
            await syncBrandDatabaseAction(formData.make, formData.model, formData.version)

            const doc = {
                ...formData,
                slug: { _type: 'slug', current: formData.slug },
                features: tags
            }

            await saveCarAction(id, doc)
            router.push('/admin/dashboard')
        } catch {
            alert('Error al guardar.')
        } finally {
            setIsSubmitting(false)
        }
    }

    const handleDelete = async () => {
        if (confirm('¿Estás seguro de que deseas eliminar este vehículo permanentemente?')) {
            setIsSubmitting(true)
            try {
                const result = await deleteCarAction(id)
                if (result.success) {
                    router.push('/admin/dashboard')
                } else {
                    alert(result.error || "No se pudo eliminar.")
                    setIsSubmitting(false)
                }
            } catch {
                alert('Error al eliminar el vehículo.')
                setIsSubmitting(false)
            }
        }
    }

    // --- LÓGICA DE OPCIONES DINÁMICAS ---
    const currentBrandData = dbBrands.find(b => b.name === formData.make)
    const currentModelData = currentBrandData?.models?.find((m: BrandModel) => m.modelName === formData.model)

    const toggleSection = (section: keyof typeof expandedSections) => {
        setExpandedSections((prev) => ({
            ...prev,
            [section]: !prev[section],
        }))
    }

    if (isLoading) return null

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-32 sm:pb-40 text-left">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex justify-between items-end mb-9 gap-4 text-left">
                    <div className="flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Editor de inventario</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Editar Vehículo</h1>
                    </div>
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
                    <AdminCollapsibleCard
                        title="Identidad y Comercial"
                        summary="Marca, modelo, versión, año, precios, kilometraje y etiqueta."
                        isOpen={expandedSections.identidad}
                        onToggle={() => toggleSection('identidad')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">

                            {/* MARCA: BUSCADOR / ESCRITURA */}
                            <div className="flex flex-col space-y-2.5 text-left leading-none">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Marca</label>
                                <AdminCombobox
                                    value={formData.make}
                                    onChange={(value) => {
                                        handleChange('make', value)
                                        handleChange('model', '')
                                        handleChange('version', '')
                                    }}
                                    options={dbBrands.map((brand) => ({ value: brand.name, label: brand.name }))}
                                    placeholder="Escribe o busca una marca..."
                                />
                            </div>

                            {/* MODELO: BUSCADOR / ESCRITURA */}
                            <div className="flex flex-col space-y-2.5 text-left leading-none">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Modelo</label>
                                <AdminCombobox
                                    value={formData.model}
                                    disabled={!formData.make}
                                    onChange={(value) => {
                                        handleChange('model', value)
                                        handleChange('version', '')
                                    }}
                                    options={(currentBrandData?.models?.map((model: BrandModel) => ({ value: model.modelName, label: model.modelName })) || [])}
                                    placeholder="Escribe o busca un modelo..."
                                />
                            </div>

                            {/* VERSIÓN: BUSCADOR / ESCRITURA */}
                            <div className="flex flex-col space-y-2.5 text-left leading-none">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Versión</label>
                                <AdminCombobox
                                    value={formData.version}
                                    disabled={!formData.model}
                                    onChange={(value) => handleChange('version', value)}
                                    options={(currentModelData?.versions?.map((version: string) => ({ value: version, label: version })) || [])}
                                    placeholder="Escribe o busca una versión..."
                                />
                            </div>

                            <div className="flex flex-col space-y-2.5 text-left leading-none">
                                <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Enlace (Slug)</label>
                                <div className="flex gap-2 h-[42px]">
                                    <input value={formData.slug} onChange={(e) => handleChange('slug', e.target.value)} className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black" />
                                    <button type="button" onClick={generateSlug} className="bg-[#F0F2F5] px-4 rounded-xl text-[9px] font-black uppercase hover:bg-black hover:text-white transition-all h-full">Generar</button>
                                </div>
                            </div>
                            <FormGroup label="Año" type="number" value={formData.year} onChange={(val: string) => handleChange('year', parseInt(val) || 0)} />
                            <FormSelect label="Etiqueta (Badge)" value={formData.category} options={['Seminuevo', 'Recién Llegado', 'Oferta de la Semana', 'Reservado', 'Único Dueño', 'Oportunidad', 'Vendido']} onChange={(val: string) => handleChange('category', val)} />

                            {/* PRECIO LISTA CON PUNTOS */}
                            <FormGroup
                                label="Precio Lista"
                                type="text"
                                value={formatChileanNumber(formData.listPrice)}
                                onChange={(val: string) => handleChange('listPrice', parseChileanNumber(val))}
                            />

                            {/* PRECIO FINANCIADO CON PUNTOS */}
                            <FormGroup
                                label="Precio Financiado"
                                type="text"
                                value={formatChileanNumber(formData.financedPrice)}
                                onChange={(val: string) => handleChange('financedPrice', parseChileanNumber(val))}
                            />

                            {/* KILOMETRAJE CON PUNTOS */}
                            <FormGroup
                                label="Kilometraje"
                                type="text"
                                value={formatChileanNumber(formData.mileage)}
                                onChange={(val: string) => handleChange('mileage', parseChileanNumber(val))}
                            />
                        </div>
                    </AdminCollapsibleCard>

                    <AdminCollapsibleCard
                        title="Ficha Técnica"
                        className="text-left"
                        summary="Motor, carrocería, transmisión, tracción, combustible, color y ubicación."
                        isOpen={expandedSections.ficha}
                        onToggle={() => toggleSection('ficha')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-5">
                            <FormGroup label="Motor" value={formData.engine} onChange={(v) => handleChange('engine', v)} />
                            <FormSelect label="Carrocería" value={formData.body} options={['SUV', 'Sedán', 'Hatchback', 'Camioneta', 'Coupé', 'Van']} onChange={(v) => handleChange('body', v)} />
                            <FormSelect label="Transmisión" value={formData.transmission} options={['Automática', 'Manual']} onChange={(v) => handleChange('transmission', v)} />
                            <FormSelect label="Tracción" value={formData.drivetrain} options={['Delantera', 'Trasera', '4x4', '4x2']} onChange={(v) => handleChange('drivetrain', v)} />
                            <FormSelect label="Combustible" value={formData.fuel} options={['Bencina', 'Diésel', 'Híbrido', 'Eléctrico']} onChange={(v) => handleChange('fuel', v)} />
                            <FormSelect label="Color" value={formData.color} options={['Blanco', 'Negro', 'Gris', 'Azul', 'Rojo', 'Plateado']} onChange={(v) => handleChange('color', v)} />
                            <div className="md:col-span-1"><FormGroup label="Ubicación" value={formData.location} onChange={(v) => handleChange('location', v)} /></div>
                        </div>
                    </AdminCollapsibleCard>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AdminCollapsibleCard
                            title="Especificaciones: General"
                            className="text-left"
                            summary="Cilindrada, cilindros y potencia."
                            isOpen={expandedSections.specsGeneralHistorial}
                            onToggle={() => toggleSection('specsGeneralHistorial')}
                        >
                            <div className="grid grid-cols-1 gap-5">
                                <FormGroup label="Cilindrada" value={formData.specsGeneral.cilindrada} onChange={(v) => handleNestedChange('specsGeneral', 'cilindrada', v)} />
                                <FormGroup label="Cilindros" value={formData.specsGeneral.cilindros} onChange={(v) => handleNestedChange('specsGeneral', 'cilindros', v)} />
                                <FormGroup label="Potencia" value={formData.specsGeneral.potencia} onChange={(v) => handleNestedChange('specsGeneral', 'potencia', v)} />
                            </div>
                        </AdminCollapsibleCard>
                        <AdminCollapsibleCard
                            title="Especificaciones: Historial"
                            className="text-left"
                            summary="Dueños, mantenciones e historial Autofact."
                            isOpen={expandedSections.specsGeneralHistorial}
                            onToggle={() => toggleSection('specsGeneralHistorial')}
                        >
                            <div className="grid grid-cols-1 gap-5">
                                <FormGroup label="Dueños" value={formData.specsHistory.duenos} onChange={(v) => handleNestedChange('specsHistory', 'duenos', v)} />
                                <FormGroup label="Mantenciones" value={formData.specsHistory.mantenciones} onChange={(v) => handleNestedChange('specsHistory', 'mantenciones', v)} />
                                <FormGroup label="Historial Autofact" value={formData.specsHistory.historial} onChange={(v) => handleNestedChange('specsHistory', 'historial', v)} />
                            </div>
                        </AdminCollapsibleCard>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                        <AdminCollapsibleCard
                            title="Especificaciones: Exterior"
                            className="text-left"
                            summary="Puertas, rin, tipo de rin y luces."
                            isOpen={expandedSections.specsExteriorInterior}
                            onToggle={() => toggleSection('specsExteriorInterior')}
                        >
                            <div className="grid grid-cols-2 gap-5">
                                <FormGroup label="Número de Puertas" value={formData.specsExterior.puertas} onChange={(v) => handleNestedChange('specsExterior', 'puertas', v)} />
                                <FormGroup label="Diámetro de Rin" value={formData.specsExterior.rin} onChange={(v) => handleNestedChange('specsExterior', 'rin', v)} />
                                <FormGroup label="Tipo de Rin" value={formData.specsExterior.tipoRin} onChange={(v) => handleNestedChange('specsExterior', 'tipoRin', v)} />
                                <FormGroup label="Tipo de Luces" value={formData.specsExterior.luces} onChange={(v) => handleNestedChange('specsExterior', 'luces', v)} />
                            </div>
                        </AdminCollapsibleCard>
                        <AdminCollapsibleCard
                            title="Especificaciones: Interior"
                            className="text-left"
                            summary="Pasajeros y material de asientos."
                            isOpen={expandedSections.specsExteriorInterior}
                            onToggle={() => toggleSection('specsExteriorInterior')}
                        >
                            <div className="grid grid-cols-1 gap-5">
                                <FormGroup label="Número de Pasajeros" value={formData.specsInterior.pasajeros} onChange={(v) => handleNestedChange('specsInterior', 'pasajeros', v)} />
                                <FormGroup label="Material Asientos" value={formData.specsInterior.materialAsientos} onChange={(v) => handleNestedChange('specsInterior', 'materialAsientos', v)} />
                            </div>
                        </AdminCollapsibleCard>
                    </div>

                    <AdminCollapsibleCard
                        title="Detalles Técnicos Adicionales"
                        className="text-left"
                        summary="Confort, seguridad y entretenimiento."
                        isOpen={expandedSections.detalles}
                        onToggle={() => toggleSection('detalles')}
                    >
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
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
                    </AdminCollapsibleCard>

                    <AdminCollapsibleCard
                        title="Multimedia y Extras"
                        className="space-y-3 text-left"
                        summary="Características, imágenes y descripción del vehículo."
                        isOpen={expandedSections.multimedia}
                        onToggle={() => toggleSection('multimedia')}
                    >
                        <div className="space-y-2.5 text-left">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Equipamiento / Características (Comas o ENTER)</label>
                            <div className="flex gap-2 h-[45px]">
                                <input
                                    value={currentTag}
                                    onChange={(e) => setCurrentTag(e.target.value)}
                                    onKeyDown={addTag}
                                    placeholder="Aire Acondicionado, Bluetooth, Llantas..."
                                    className="flex-1 bg-[#F7F8FA] border-none rounded-xl px-5 py-4 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black leading-none"
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
                            <ImageUploadPlaceholder
                                label="Imágenes Principales"
                                images={formData.images}
                                field="images"
                                onRemove={removeImage}
                                onMove={moveImage}
                                onClick={() => mainImagesRef.current?.click()}
                            />
                            <ImageUploadPlaceholder
                                label="Fotos Detalles Exterior"
                                images={formData.exteriorImages}
                                field="exteriorImages"
                                onRemove={removeImage}
                                onMove={moveImage}
                                onClick={() => exteriorImagesRef.current?.click()}
                            />
                            <ImageUploadPlaceholder
                                label="Fotos Detalles Interior"
                                images={formData.interiorImages}
                                field="interiorImages"
                                onRemove={removeImage}
                                onMove={moveImage}
                                onClick={() => interiorImagesRef.current?.click()}
                            />
                        </div>

                        <div className="space-y-2.5 pt-2 text-left">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Descripción</label>
                            <textarea value={formData.description} onChange={(e) => handleChange('description', e.target.value)} rows={6} className="w-full bg-[#F7F8FA] border-none rounded-2xl p-5 text-[11px] font-medium outline-none focus:ring-1 focus:ring-black resize-none leading-relaxed" />
                        </div>
                    </AdminCollapsibleCard>
                </form>
            </main>

            {/* ACCIONES MÓVIL */}
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

// --- AUXILIARES ---
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
            <AdminSoftSelect value={value ?? ''} onChange={onChange} options={options.map((opt) => ({ value: opt, label: opt }))} />
        </div>
    )
}

function ImageUploadPlaceholder({
    label,
    images,
    field,
    onClick,
    onRemove,
    onMove
}: {
    label: string;
    images: SanityImage[];
    field: 'images' | 'exteriorImages' | 'interiorImages';
    onClick: () => void;
    onRemove: (field: 'images' | 'exteriorImages' | 'interiorImages', index: number) => void;
    onMove: (field: 'images' | 'exteriorImages' | 'interiorImages', index: number, direction: 'left' | 'right') => void;
}) {
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
                    {images.map((img: SanityImage, i: number) => (
                        <div key={img._key || i} className="relative aspect-video group leading-none overflow-hidden rounded-2xl border border-zinc-100">
                            <img src={urlFor(img).width(200).url()} className="w-full h-full object-cover" alt="Preview" />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2">
                                {i > 0 && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onMove(field, i, 'left'); }} className="w-7 h-7 bg-white/20 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M15 19l-7-7 7-7" /></svg>
                                    </button>
                                )}
                                <button type="button" onClick={(e) => { e.stopPropagation(); onRemove(field, i); }} className="w-7 h-7 bg-red-500 text-white rounded-full flex items-center justify-center shadow-lg hover:scale-110 transition-all"><svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M6 18L18 6M6 6l12 12" /></svg></button>
                                {i < images.length - 1 && (
                                    <button type="button" onClick={(e) => { e.stopPropagation(); onMove(field, i, 'right'); }} className="w-7 h-7 bg-white/20 hover:bg-white text-white hover:text-black rounded-full flex items-center justify-center transition-all backdrop-blur-sm">
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M9 5l7 7-7 7" /></svg>
                                    </button>
                                )}
                            </div>
                            {field === 'images' && i === 0 && <div className="absolute top-2 left-2 bg-black text-white text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded-md z-10">Portada</div>}
                        </div>
                    ))}
                </div>
            )}
        </div>
    )
}
