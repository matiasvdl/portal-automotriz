'use client'
/* eslint-disable @next/next/no-img-element */

import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import { useState, useEffect, use, useCallback, useMemo } from 'react'
import FeaturesAccordion from '@/components/FeaturesAccordion'
import CarCard from '@/components/CarCard'
import { useSettings } from '@/context/SettingsContext'

interface CarFeatureSection {
    title: string
    items: { label: string; value: string | number }[]
}

interface AssignedSeller {
    _id: string
    firstName?: string
    lastName?: string
    role?: string
    phone?: string
    imageUrl?: string
}

interface DetailCar {
    _id: string
    make: string
    model: string
    version?: string
    location?: string
    year: number
    listPrice: number
    financedPrice: number
    fuel: string
    transmission: string
    mileage: number
    description?: string
    reportDocumentUrl?: string
    reportLabel?: string
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
    assignedSeller?: AssignedSeller | null
}

interface RecommendedCar {
    _id: string
    slug: string
    make: string
    model: string
    version?: string
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

// Funciones de obtención de datos (GROQ)
async function getCar(slug: string) {
    const query = `*[_type == "car" && slug.current == $slug][0] {
    _id, make, model, version, year, listPrice, financedPrice, fuel, transmission, mileage, location,
    description,
    reportLabel,
    specsGeneral, specsHistory, specsExterior, specsComfort, specsSecurity, specsInterior, specsEntertainment,
    "images": images[].asset->url,
    "exteriorImages": exteriorImages[].asset->url,
    "interiorImages": interiorImages[].asset->url,
    "reportDocumentUrl": reportDocument.asset->url,
    "assignedSeller": assignedSeller->{
      _id, firstName, lastName, role, phone,
      "imageUrl": image.asset->url
    }
  }`
    return await client.fetch<DetailCar | null>(query, { slug })
}

async function getRecommendedCars(currentId: string) {
    const query = `*[_type == "car" && _id != $currentId && status != false][0...4] {
        _id,
        "slug": slug.current,
        make,
        model,
        version,
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

export default function CarCatalogDetailClient({ params }: { params: Promise<{ slug: string }> }) {
    const resolvedParams = use(params)
    const { contact, appearance, config } = useSettings()

    const primaryColor = appearance?.primaryColor || '#000000'

    const [car, setCar] = useState<DetailCar | null>(null)
    const [recommendedCars, setRecommendedCars] = useState<RecommendedCar[]>([])
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [modalImages, setModalImages] = useState<string[]>([])
    const [loading, setLoading] = useState(true)
    const [isModalOpen, setIsModalOpen] = useState(false)

    const [detailFilter, setDetailFilter] = useState<'all' | 'exterior' | 'interior'>('all')
    const [showDetails, setShowDetails] = useState(true)
    const mainImages = useMemo(() => car?.images ?? [], [car?.images])

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

    const showPreviousMainImage = useCallback(() => {
        if (mainImages.length === 0) return
        const selectedIndex = mainImages.findIndex((img) => img === selectedImage)
        const prevIndex = selectedIndex > 0 ? selectedIndex - 1 : mainImages.length - 1
        setSelectedImage(mainImages[prevIndex])
    }, [mainImages, selectedImage])

    const showNextMainImage = useCallback(() => {
        if (mainImages.length === 0) return
        const selectedIndex = mainImages.findIndex((img) => img === selectedImage)
        const nextIndex = selectedIndex === -1 || selectedIndex === mainImages.length - 1 ? 0 : selectedIndex + 1
        setSelectedImage(mainImages[nextIndex])
    }, [mainImages, selectedImage])

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
        if (isModalOpen || mainImages.length === 0) return

        const handleGalleryKeyDown = (e: KeyboardEvent) => {
            const target = e.target as HTMLElement | null
            const tagName = target?.tagName?.toLowerCase()

            if (tagName === 'input' || tagName === 'textarea' || target?.isContentEditable) {
                return
            }

            if (e.key === 'ArrowRight') {
                showNextMainImage()
            }

            if (e.key === 'ArrowLeft') {
                showPreviousMainImage()
            }
        }

        window.addEventListener('keydown', handleGalleryKeyDown)
        return () => window.removeEventListener('keydown', handleGalleryKeyDown)
    }, [isModalOpen, mainImages.length, showNextMainImage, showPreviousMainImage])

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

    // --- VENDEDOR Y WHATSAPP DINÁMICOS ---
    const seller = car.assignedSeller || null
    const sellerFullName = seller ? `${seller.firstName || ''} ${seller.lastName || ''}`.trim() : ''
    const sellerInitial = (seller?.firstName || seller?.lastName || 'V').charAt(0).toUpperCase()
    const sellerRoleLabel = 'Asesor de Ventas'
    const sellerRawNumber = (seller?.phone || contact?.whatsapp || '').toString()
    const whatsappNumber = sellerRawNumber.replace(/\D/g, '')
    const greetingName = sellerFullName ? sellerFullName.split(' ')[0] : ''
    const whatsappMessage = `${greetingName ? `Hola ${greetingName}` : 'Hola'}, me interesa el ${car.make} ${car.model} ${car.version || ''} (${car.year}) que vi en la web. ¿Sigue disponible?`
    const whatsappUrl = whatsappNumber
        ? `https://wa.me/${whatsappNumber}?text=${encodeURIComponent(whatsappMessage)}`
        : ''

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
                    <p className="text-[10px] font-bold uppercase tracking-[0.2em] text-zinc-400 mb-1 italic">
                        {car.year} · {car.transmission}
                    </p>
                    <h1 className="text-3xl font-black uppercase tracking-tighter leading-tight">
                        {car.make} <span className="font-light text-zinc-400">{car.model} {car.version}</span> {/* VERSIÓN EN TÍTULO */}
                    </h1>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-10">
                    <div className="lg:col-span-8">
                        <div className="relative rounded-xl overflow-hidden bg-zinc-100 aspect-[16/10] border border-gray-100 cursor-zoom-in group mb-6" onClick={() => openModalWithImage(selectedImage, car.images || [])}>
                            {selectedImage && <img src={selectedImage} className="w-full h-full object-cover transition-all duration-500 group-hover:scale-105" alt="Principal" />}
                        </div>

                        <div className="mb-10 flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                            {car.images?.map((img: string, i: number) => (
                                <button key={i} onClick={() => setSelectedImage(img)} className={`aspect-square h-20 w-20 shrink-0 rounded-lg overflow-hidden bg-zinc-50 border cursor-pointer transition-all ${selectedImage === img ? 'border-2' : 'border-gray-100 opacity-70 hover:opacity-100'}`} style={selectedImage === img ? { borderColor: primaryColor } : {}}>
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
                                    {((car.exteriorImages?.length ?? 0) > 0 || (car.interiorImages?.length ?? 0) > 0) && (
                                        <div className="border-b border-gray-100">
                                            <button
                                                onClick={() => setShowDetails(!showDetails)}
                                                className="w-full py-3 flex justify-between items-center group transition-all"
                                            >
                                                <span className="font-bold uppercase text-[10px] tracking-[0.15em] text-gray-800 group-hover:text-black transition-colors">
                                                    Detalles del Vehículo
                                                </span>
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
                                                    <div className="flex gap-3 overflow-x-auto pb-2 no-scrollbar">
                                                        {detailImages.map((img: string, i: number) => (
                                                            <button key={i} onClick={() => openModalWithImage(img, detailImages)} className="aspect-square h-24 w-24 shrink-0 rounded-2xl overflow-hidden bg-zinc-50 border border-gray-100 cursor-zoom-in group relative">
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
                            {seller && (
                                <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-black mb-4">Tu Asesor</h4>
                                    <div className="flex items-center gap-4">
                                        {seller.imageUrl ? (
                                            <img
                                                src={seller.imageUrl}
                                                alt={sellerFullName || 'Asesor'}
                                                className="w-12 h-12 rounded-full object-cover border border-gray-100 shrink-0"
                                            />
                                        ) : (
                                            <div
                                                className="w-12 h-12 rounded-full flex items-center justify-center font-black text-white uppercase text-[14px] shrink-0"
                                                style={{ backgroundColor: primaryColor }}
                                            >
                                                {sellerInitial}
                                            </div>
                                        )}
                                        <div className="leading-none">
                                            <p className="text-[12px] font-extrabold uppercase tracking-tight text-black leading-none">
                                                {sellerFullName || 'Asesor de Ventas'}
                                            </p>
                                            <p className="text-[9px] font-bold uppercase tracking-widest text-gray-400 mt-1.5 leading-none">
                                                {sellerRoleLabel}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            )}
                            <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.1em] text-black mb-4">Especificaciones</h4>
                                <div className="flex flex-col mb-4">
                                    <DataRow label="Marca" value={car.make} />
                                    <DataRow label="Modelo" value={car.model} />
                                    {car.version && <DataRow label="Versión" value={car.version} />} {/* VERSIÓN EN TABLA */}
                                    <DataRow label="Año" value={car.year} />
                                    <DataRow label="Kilometraje" value={`${car.mileage?.toLocaleString('es-CL')} KM`} />
                                    <DataRow label="Combustible" value={car.fuel} />
                                    <DataRow label="Transmisión" value={car.transmission} />
                                    <DataRow label="Ubicación" value={car.location || config?.defaultLocation || 'Santiago'} />
                                </div>
                                {whatsappUrl && (
                                    <div className="text-center">
                                        <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">{config?.catalogContent?.whatsappLabel?.trim() || 'Cotiza en línea vía WhatsApp'}</p>
                                        <a
                                            href={whatsappUrl}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="block w-full text-white text-center font-bold text-[10px] uppercase tracking-[0.15em] py-4 rounded-xl hover:opacity-90 transition-all shadow-sm"
                                            style={{ backgroundColor: primaryColor }}
                                        >
                                            CONSULTAR STOCK
                                        </a>
                                    </div>
                                )}
                            </div>
                            {car.reportDocumentUrl && (
                                <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
                                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-4">
                                        Descarga el informe disponible de este vehículo
                                    </p>
                                    <a
                                        href={car.reportDocumentUrl}
                                        target="_blank"
                                        rel="noopener noreferrer"
                                        className="block w-full text-white text-center font-bold text-[10px] uppercase tracking-[0.15em] py-4 rounded-xl hover:opacity-90 transition-all shadow-sm"
                                        style={{ backgroundColor: primaryColor }}
                                    >
                                        DESCARGAR {car.reportLabel?.trim().toUpperCase() || 'INFORME DEL VEHICULO'}
                                    </a>
                                </div>
                            )}
                        </div>
                    </aside>
                </div>

                {recommendedCars.length > 0 && (
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
                )}
            </div>

            {isModalOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/95 p-4 md:p-10 transition-opacity duration-300" onClick={() => setIsModalOpen(false)}>
                    <button className="absolute top-5 right-5 z-50 text-white bg-white/10 p-3 rounded-full hover:bg-white/20 transition-colors" onClick={(e) => { e.stopPropagation(); setIsModalOpen(false); }}><svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-6 h-6"><path strokeLinecap="round" strokeLinejoin="round" d="M6 18 18 6M6 6l12 12" /></svg></button>

                    <button
                        className="absolute left-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); showPreviousImage(); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15 18l-6-6 6-6" />
                        </svg>
                    </button>

                    <button
                        className="absolute right-6 top-1/2 z-50 -translate-y-1/2 rounded-full bg-black/40 p-3 text-white hover:bg-black/60 focus:outline-none"
                        onClick={(e) => { e.stopPropagation(); showNextImage(); }}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor" className="w-5 h-5">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M9 6l6 6-6 6" />
                        </svg>
                    </button>

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
            <span className="text-zinc-400 font-bold uppercase tracking-tight">{label}</span>
            <span className="text-black font-extrabold uppercase tracking-tight">{value}</span>
        </div>
    )
}
