'use client'
/* eslint-disable @next/next/no-img-element */

import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import { useState, useEffect, use, useCallback } from 'react'
import FeaturesAccordion from '@/components/FeaturesAccordion'
import CarCard from '@/components/CarCard'
import { useSettings } from '@/context/SettingsContext'

interface CarFeatureSection {
    title: string
    items: { label: string; value: string | number }[]
}

interface DetailCar {
    _id: string
    make: string
    model: string
    location?: string
    year: number
    listPrice: number
    financedPrice: number
    fuel: string
    transmission: string
    mileage: number
    description?: string
    specsGeneral?: Record<string, string>
    specsHistory?: Record<string, string>
    specsExterior?: Record<string, string>
    specsComfort?: Record<string, string>
    specsSecurity?: Record<string, string>
    specsInterior?: Record<string, string>
    specsEntertainment?: Record<string, string>
    images?: string[]
    exteriorImages?: string[]
    interiorImages?: string[]
}

interface RecommendedCar {
    _id: string
    slug: string
    make: string
    model: string
    year: number
    listPrice: number
    financedPrice: number
    fuel: string
    transmission: string
    mileage: number
    category?: string
    engine?: string
    imageUrl: string
}

async function getCar(slug: string) {
    const query = `*[_type == "car" && slug.current == $slug][0] {
    _id, make, model, year, listPrice, financedPrice, fuel, transmission, mileage, location,
    description,
    specsGeneral, specsHistory, specsExterior, specsComfort, specsSecurity, specsInterior, specsEntertainment,
    "images": images[].asset->url,
    "exteriorImages": exteriorImages[].asset->url,
    "interiorImages": interiorImages[].asset->url
  }`
    return await client.fetch<DetailCar | null>(query, { slug })
}

async function getRecommendedCars(currentId: string) {
    const query = `*[_type == "car" && _id != $currentId && status != false][0...4] {
        _id,
        "slug": slug.current,
        make,
        model,
        year,
        listPrice,
        financedPrice,
        fuel,
        transmission,
        mileage,
        category,
        engine,
        "imageUrl": images[0].asset->url
    }`
    return await client.fetch<RecommendedCar[]>(query, { currentId })
}

export default function CarDetailClient({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params)
    const { contact, appearance, config } = useSettings()

    // PASO A: Color primario dinámico
    const primaryColor = appearance?.primaryColor || '#000000'

    const [car, setCar] = useState<DetailCar | null>(null)
    const [recommendedCars, setRecommendedCars] = useState<RecommendedCar[]>([])
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [modalImages, setModalImages] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)
    const [detailFilter, setDetailFilter] = useState<'all' | 'exterior' | 'interior'>('all')
    const [showDetails, setShowDetails] = useState(true)

    const currentImageIndex = modalImages.findIndex((img) => img === selectedImage);
    const showPreviousImage = useCallback(() => {
        if (modalImages.length === 0) return;
        const prevIndex = currentImageIndex > 0 ? currentImageIndex - 1 : modalImages.length - 1;
        setSelectedImage(modalImages[prevIndex]);
    }, [currentImageIndex, modalImages]);
    const showNextImage = useCallback(() => {
        if (modalImages.length === 0) return;
        const nextIndex = currentImageIndex === -1 || currentImageIndex === modalImages.length - 1 ? 0 : currentImageIndex + 1;
        setSelectedImage(modalImages[nextIndex]);
    }, [currentImageIndex, modalImages]);

    const openModalWithImage = (img: string, images: string[]) => {
        setModalImages(images)
        setSelectedImage(img);
        setIsModalOpen(true);
    };

    useEffect(() => {
        if (!isModalOpen) return;
        const handleKeyDown = (e: KeyboardEvent) => {
            if (e.key === 'Escape') setIsModalOpen(false);
            if (e.key === 'ArrowRight') showNextImage();
            if (e.key === 'ArrowLeft') showPreviousImage();
        };
        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [isModalOpen, showNextImage, showPreviousImage]);

    useEffect(() => {
        if (!resolvedParams?.slug) return
        async function loadData() {
            try {
                const carData = await getCar(resolvedParams.slug)
                if (!carData) {
                    setLoading(false)
                    return
                }
                const recCars = await getRecommendedCars(carData._id)
                setCar(carData)
                setRecommendedCars(recCars)
                if (carData.images && carData.images.length > 0) {
                    setSelectedImage(carData.images[0])
                }
            } catch (error) {
                console.error("Error en Sanity Fetch:", error)
            } finally {
                setLoading(false)
            }
        }
        loadData()
    }, [resolvedParams.slug])

    if (loading) return <div className="min-h-screen bg-white" />
    if (!car) notFound()

    const detailImages = [
        ...(detailFilter === 'all' || detailFilter === 'exterior' ? (car.exteriorImages || []) : []),
        ...(detailFilter === 'all' || detailFilter === 'interior' ? (car.interiorImages || []) : []),
    ];

    const carFeatures: CarFeatureSection[] = [
        { title: "General", items: [{ label: "Cilindrada", value: car.specsGeneral?.cilindrada || "-" }, { label: "Cilindros", value: car.specsGeneral?.cilindros || "-" }, { label: "Potencia", value: car.specsGeneral?.potencia || "-" }, { label: "Transmisión", value: car.transmission || "-" }, { label: "Combustible", value: car.fuel || "-" }] },
        { title: "Historial", items: [{ label: "Dueños", value: car.specsHistory?.duenos || "-" }, { label: "Mantenciones", value: car.specsHistory?.mantenciones || "-" }, { label: "Historial Autofact", value: car.specsHistory?.historial || "-" }] },
        { title: "Exterior", items: [{ label: "Número de Puertas", value: car.specsExterior?.puertas || "-" }, { label: "Diámetro de Rin", value: car.specsExterior?.rin || "-" }, { label: "Tipo de Rin", value: car.specsExterior?.tipoRin || "-" }, { label: "Tipo de luces", value: car.specsExterior?.luces || "-" }] },
        { title: "Equipamiento y confort", items: [{ label: "Botón de Encendido", value: car.specsComfort?.encendido || "-" }, { label: "Control de Crucero", value: car.specsComfort?.crucero || "-" }, { label: "Sensor de distancia", value: car.specsComfort?.sensorDistancia || "-" }, { label: "Aire acondicionado", value: car.specsComfort?.aire || "-" }, { label: "Asistencia de estacionamiento", value: car.specsComfort?.estacionamiento || "-" }] },
        { title: "Seguridad", items: [{ label: "Bolsas de Aire Delanteras", value: car.specsSecurity?.airbagsDelanteros || "-" }, { label: "Número total de Airbags", value: car.specsSecurity?.airbagsTotales || "-" }, { label: "Cantidad de discos de freno", value: car.specsSecurity?.frenosDisco || "-" }, { label: "Tipo Frenos ABS", value: car.specsSecurity?.abs || "-" }, { label: "Control estabilidad", value: car.specsSecurity?.estabilidad || "-" }] },
        { title: "Interior", items: [{ label: "Número de Pasajeros", value: car.specsInterior?.pasajeros || "-" }, { label: "Material Asientos", value: car.specsInterior?.materialAsientos || "-" }] },
        { title: "Entretenimiento", items: [{ label: "Pantalla Táctil", value: car.specsEntertainment?.pantalla || "-" }, { label: "Android Auto / Apple CarPlay", value: car.specsEntertainment?.carplay || "-" }, { label: "Bluetooth", value: car.specsEntertainment?.bluetooth || "-" }, { label: "Radio", value: car.specsEntertainment?.radio || "-" }] }
    ]

    return (
        <div className="bg-white min-h-screen pb-6 antialiased text-black font-sans">
            <div className="max-w-7xl mx-auto px-6 py-10">

                <div className="mb-8">
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1 italic">
                        {car.year} · {car.transmission}
                    </p>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight">
                        {car.make} <span className="font-light text-zinc-400">{car.model}</span>
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <div className="relative rounded-xl overflow-hidden bg-zinc-100 aspect-[16/10] border border-gray-100 cursor-zoom-in group mb-6" onClick={() => openModalWithImage(selectedImage, car.images || [])}>
                            {selectedImage && <img src={selectedImage} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" alt="Principal" />}
                        </div>

                        <div className="grid grid-cols-6 gap-3 mb-10">
                            {car.images?.map((img: string, i: number) => (
                                <button key={i} onClick={() => setSelectedImage(img)} className={`aspect-square rounded-lg overflow-hidden bg-zinc-50 border cursor-pointer transition-all ${selectedImage === img ? 'border-2' : 'border-gray-100 opacity-70 hover:opacity-100'}`} style={selectedImage === img ? { borderColor: primaryColor } : {}}>
                                    <img src={img} className="w-full h-full object-cover" alt="thumb" />
                                </button>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-gray-100">
                            <div className="mb-8">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-4">Descripción</h3>
                                <p className="text-sm font-medium leading-relaxed text-zinc-600 max-w-2xl">
                                    {car.description || "Vehículo en estado impecable, revisado mecánicamente y listo para entrega inmediata."}
                                </p>
                            </div>

                            <div className="pt-6 border-t border-gray-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.15em] text-black mb-2">Características</h3>
                                <div className="space-y-1">
                                    {(car.exteriorImages?.length > 0 || car.interiorImages?.length > 0) && (
                                        <div className="border-b border-gray-100">
                                            <button onClick={() => setShowDetails(!showDetails)} className="w-full py-3 flex justify-between items-center group transition-all">
                                                <span className="font-bold uppercase text-[10px] tracking-[0.15em] text-gray-800 group-hover:text-black transition-colors">Detalles del Vehículo</span>
                                                <svg className={`w-3 h-3 transition-transform duration-300 ${showDetails ? 'rotate-180' : 'text-gray-400'}`} style={showDetails ? { color: primaryColor } : {}} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                                                </svg>
                                            </button>

                                            {showDetails && (
                                                <div className="pb-8 animate-in fade-in slide-in-from-top-2">
                                                    <div className="flex gap-2 mb-6">
                                                        <button
                                                            onClick={() => setDetailFilter('all')}
                                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all`}
                                                            style={detailFilter === 'all' ? { backgroundColor: primaryColor, color: 'white' } : { color: '#9ca3af', backgroundColor: '#f9fafb' }}
                                                        >Todos</button>
                                                        <button
                                                            onClick={() => setDetailFilter('exterior')}
                                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all`}
                                                            style={detailFilter === 'exterior' ? { backgroundColor: primaryColor, color: 'white' } : { color: '#9ca3af', backgroundColor: '#f9fafb' }}
                                                        >Exterior</button>
                                                        <button
                                                            onClick={() => setDetailFilter('interior')}
                                                            className={`px-4 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest transition-all`}
                                                            style={detailFilter === 'interior' ? { backgroundColor: primaryColor, color: 'white' } : { color: '#9ca3af', backgroundColor: '#f9fafb' }}
                                                        >Interior</button>
                                                    </div>
                                                    <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-5 gap-3">
                                                        {detailImages.map((img: string, i: number) => (
                                                            <button key={i} onClick={() => openModalWithImage(img, detailImages)} className="aspect-square rounded-2xl overflow-hidden bg-zinc-50 border border-gray-100 cursor-zoom-in group relative">
                                                                <img src={img} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-110" alt="detalle" />
                                                            </button>
                                                        ))}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    )}
                                    <FeaturesAccordion features={carFeatures} />
                                </div>
                            </div>
                        </div>
                    </div>

                    <aside className="lg:col-span-4">
                        <div className="sticky top-32 space-y-4">
                            <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 flex justify-between items-center shadow-sm">
                                <div><p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-1">Precio Lista</p><p className="text-lg font-bold tracking-tighter text-gray-400 line-through">${car.listPrice?.toLocaleString('es-CL')}</p></div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-black">Precio Financiado</p>
                                        <span className="text-white text-[7px] font-black px-1 py-0.5 rounded uppercase" style={{ backgroundColor: primaryColor }}>Bono</span>
                                    </div>
                                    <p className="text-3xl font-black tracking-tighter leading-none">${car.financedPrice?.toLocaleString('es-CL')}</p>
                                </div>
                            </div>
                            <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-black mb-4">Especificaciones</h4>
                                <div className="flex flex-col mb-4">
                                    <DataRow label="Marca" value={car.make} /><DataRow label="Modelo" value={car.model} /><DataRow label="Año" value={car.year} /><DataRow label="Kilometraje" value={`${car.mileage?.toLocaleString('es-CL')} KM`} /><DataRow label="Combustible" value={car.fuel} /><DataRow label="Transmisión" value={car.transmission} /><DataRow label="Ubicación" value={car.location || config?.defaultLocation || 'Santiago'} />
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">{config?.catalogContent?.whatsappLabel?.trim() || 'Cotiza en línea vía WhatsApp'}</p>
                                    <a
                                        href={`https://wa.me/${contact.whatsapp || "56937084907"}?text=${encodeURIComponent(`Hola, me interesa el ${car.make} ${car.model} (${car.year}) que vi en el catálogo.`)}`}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-white text-center font-bold text-[10px] uppercase tracking-[0.15em] py-4 rounded-xl hover:opacity-90 transition-all shadow-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        CONSULTAR STOCK
                                    </a>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>

                <section className="mt-5 pt-6 border-t border-gray-100">
                    <div className="mb-6">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Más opciones</p>
                        <h2 className="text-xl font-black uppercase tracking-tighter">{config?.catalogContent?.recommendedTitle?.trim() || 'Vehículos Recomendados'}</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedCars.map((recommendedCar) => (
                            <CarCard key={recommendedCar._id} car={recommendedCar} />
                        ))}
                    </div>
                </section>
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 transition-opacity duration-300" onClick={() => setIsModalOpen(false)}>
                    <button className="absolute top-5 right-5 z-50 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors" onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>
                    <button className="absolute left-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:outline-none" onClick={(e) => { e.stopPropagation(); showPreviousImage(); }} aria-label="Anterior imagen"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" /></svg></button>
                    <button className="absolute right-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:outline-none" onClick={(e) => { e.stopPropagation(); showNextImage(); }} aria-label="Siguiente imagen"><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5"><path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" /></svg></button>
                    <div className="relative flex justify-center items-center w-full h-full pointer-events-none">
                        <img src={selectedImage} className="rounded-lg shadow-2xl object-contain max-h-[85vh] max-w-full pointer-events-auto" alt="Vista" onClick={(e) => e.stopPropagation()} />
                    </div>
                </div>
            )}
        </div>
    )
}

function DataRow({ label, value }: { label: string; value: string | number }) {
    return (
        <div className="flex justify-between items-center text-[10px] py-2.5 border-b border-black/5 last:border-0">
            <span className="text-gray-400 font-bold uppercase tracking-tight">{label}</span>
            <span className="text-black font-extrabold uppercase tracking-tight">{value}</span>
        </div>
    )
}
