'use client'

import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'
import { useState, useEffect, use } from 'react'
import FeaturesAccordion from '@/components/FeaturesAccordion'
import CarCard from '@/components/CarCard'

// Funciones de obtención de datos (GROQ)
async function getCar(slug: string) {
    const query = `*[_type == "car" && slug.current == $slug][0] {
    _id, make, model, year, listPrice, financedPrice, fuel, transmission, mileage,
    description,
    "images": images[].asset->url
  }`
    return await client.fetch(query, { slug })
}

async function getRecommendedCars(currentId: string) {
    const query = `*[_type == "car" && _id != $currentId][0...4] {
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
        "imageUrl": images[0].asset->url
    }`
    return await client.fetch(query, { currentId })
}

export default function CarDetailPage({ params }: { params: Promise<{ slug: string }> }) {
    // Resolvemos los parámetros de la URL de forma segura para Next.js 15+
    const resolvedParams = use(params)

    const [car, setCar] = useState<any>(null)
    const [recommendedCars, setRecommendedCars] = useState<any[]>([])
    const [selectedImage, setSelectedImage] = useState<string>('')
    const [loading, setLoading] = useState(true)

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
                // Aseguramos que cargue la primera imagen si existe
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

    // Pantalla de carga (opcional, puedes poner un skeleton aquí)
    if (loading) return <div className="min-h-screen bg-white" />
    if (!car) notFound()

    const carFeatures = [
        {
            title: "General",
            items: [
                { label: "Cilindrada", value: "1.6L" },
                { label: "Cilindros", value: "4" },
                { label: "Potencia", value: "110 HP" },
                { label: "Transmisión", value: car.transmission },
                { label: "Combustible", value: car.fuel },
            ]
        },
        {
            title: "Seguridad",
            items: [
                { label: "Airbags", value: "6" },
                { label: "Frenos", value: "ABS + EBD" },
                { label: "Control estabilidad", value: "Sí" },
            ]
        }
    ]

    return (
        <div className="bg-white min-h-screen pb-20 antialiased text-black font-sans">
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

                    {/* GALERÍA DINÁMICA */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="relative rounded-xl overflow-hidden bg-zinc-100 aspect-[16/10] border border-gray-100">
                            {selectedImage && (
                                <img
                                    src={selectedImage}
                                    className="w-full h-full object-cover transition-all duration-500"
                                    alt="Vista principal"
                                />
                            )}
                        </div>

                        <div className="grid grid-cols-6 gap-3">
                            {car.images?.map((img: string, i: number) => (
                                <div
                                    key={i}
                                    onClick={() => setSelectedImage(img)}
                                    className={`aspect-square rounded-lg overflow-hidden bg-zinc-50 border cursor-pointer transition-all ${selectedImage === img ? 'border-black border-2' : 'border-gray-100 opacity-70 hover:opacity-100'
                                        }`}
                                >
                                    <img src={img} className="w-full h-full object-cover" alt={`Miniatura ${i}`} />
                                </div>
                            ))}
                        </div>

                        <div className="pt-8 border-t border-gray-100 space-y-10">
                            <div>
                                <h3 className="text-[10px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-4 text-black">Descripción</h3>
                                <p className="text-sm font-medium leading-relaxed text-zinc-600 max-w-2xl">
                                    {car.description || "Vehículo en estado impecable, revisado mecánicamente y listo para entrega inmediata."}
                                </p>
                            </div>
                            <div className="pt-8 border-t border-gray-100">
                                <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-6">Características</h3>
                                <FeaturesAccordion features={carFeatures} />
                            </div>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="lg:col-span-4">
                        <div className="sticky top-32 space-y-4">
                            <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 flex justify-between items-center shadow-sm">
                                <div>
                                    <p className="text-[9px] font-bold uppercase tracking-[0.1em] text-gray-400 mb-1">Precio Lista</p>
                                    <p className="text-lg font-bold tracking-tighter text-gray-400 line-through">
                                        ${car.listPrice?.toLocaleString('es-CL')}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <div className="flex items-center justify-end gap-2 mb-1">
                                        <p className="text-[9px] font-black uppercase tracking-[0.1em] text-black">Precio Financiado</p>
                                        <span className="bg-black text-white text-[7px] font-black px-1 py-0.5 rounded uppercase">Bono</span>
                                    </div>
                                    <p className="text-3xl font-black tracking-tighter leading-none">
                                        ${car.financedPrice?.toLocaleString('es-CL')}
                                    </p>
                                </div>
                            </div>

                            <div className="bg-[#FBFBFB] rounded-2xl p-6 border border-gray-100 shadow-sm">
                                <h4 className="text-[10px] font-black uppercase tracking-[0.2em] text-black mb-4">Especificaciones</h4>
                                <div className="flex flex-col mb-6">
                                    <DataRow label="Marca" value={car.make} />
                                    <DataRow label="Modelo" value={car.model} />
                                    <DataRow label="Año" value={car.year} />
                                    <DataRow label="Kilometraje" value={`${car.mileage?.toLocaleString('es-CL')} KM`} />
                                    <DataRow label="Combustible" value={car.fuel} />
                                    <DataRow label="Transmisión" value={car.transmission} />
                                    <DataRow label="Ubicación" value="Santiago" />
                                </div>
                                <div className="text-center">
                                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-4">Cotiza en línea vía WhatsApp</p>
                                    <a
                                        href={`https://wa.me/569XXXXXXXX?text=Hola!%20Me%20interesa%20el%20${car.make}%20${car.model}`}
                                        className="block w-full bg-black text-white text-center font-bold text-[10px] uppercase tracking-[0.15em] py-4 rounded-xl hover:bg-zinc-800 transition-all shadow-sm"
                                    >
                                        CONSULTAR STOCK
                                    </a>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* RECOMENDADOS */}
                <div className="mt-16 pt-10 border-t border-gray-100">
                    <div className="mb-8">
                        <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-gray-400 mb-1">Más opciones</p>
                        <h2 className="text-xl font-black uppercase tracking-tighter">Vehículos Recomendados</h2>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                        {recommendedCars.map((recommendedCar: any) => (
                            <CarCard key={recommendedCar._id} car={recommendedCar} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}

function DataRow({ label, value }: { label: string; value: any }) {
    return (
        <div className="flex justify-between items-center text-[10px] py-2 border-b border-black/5">
            <span className="text-gray-400 font-bold uppercase tracking-tight">{label}</span>
            <span className="text-black font-extrabold uppercase tracking-tight">{value}</span>
        </div>
    )
}