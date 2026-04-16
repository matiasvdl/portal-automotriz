'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { client, writeClient } from '@/sanity/lib/client'
import AdminNavigation from '@/components/AdminNavigation'
import { toggleCarStatusAction } from '@/app/actions/carActions'

export default function DashboardPage() {
    const [cars, setCars] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isEditMode, setIsEditMode] = useState(false)
    const router = useRouter()

    const fetchCars = async () => {
        try {
            const query = `*[_type == "car"] | order(_createdAt desc) {
                _id, make, model, year, listPrice, financedPrice, fuel, transmission, mileage, category, engine, status,
                "slug": slug.current,
                "imageUrl": images[0].asset->url
            }`
            const data = await client.fetch(query)
            setCars(data || [])
        } catch (error) {
            console.error("Error fetching stock:", error)
        } finally {
            setLoading(false)
        }
    }

    useEffect(() => {
        fetchCars()
    }, [])

    const handleDelete = async (e: React.MouseEvent, id: string, name: string) => {
        e.preventDefault();
        e.stopPropagation();

        if (confirm(`¿Estás seguro de que deseas eliminar el ${name} permanentemente?`)) {
            try {
                await writeClient.delete(id)
                setCars(cars.filter(car => car._id !== id))
            } catch (error) {
                console.error("Error eliminando:", error)
                alert("No se pudo eliminar el vehículo.")
            }
        }
    }

    const handleToggleStatus = async (e: React.MouseEvent, id: string, currentStatus: boolean) => {
        e.preventDefault();
        e.stopPropagation();

        const result = await toggleCarStatusAction(id, !!currentStatus);

        if (result.success) {
            setCars(cars.map(car =>
                car._id === id ? { ...car, status: !currentStatus } : car
            ));
        } else {
            alert("No se pudo cambiar el estado.");
        }
    }

    if (loading) return <div className="min-h-screen bg-[#F7F8FA]" />

    // LÓGICA DE FILTRADO: Si no estamos editando, solo mostramos los activos
    const displayedCars = isEditMode
        ? cars
        : cars.filter(car => car.status !== false);

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased text-left">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <header className="flex justify-between items-end mb-9 gap-4 px-1 sm:px-0">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 italic leading-none">
                            Gestión de stock
                        </p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            Vehiculos Disponibles
                        </h1>
                    </div>

                    <div className="flex items-center gap-3">
                        {/* BOTÓN EDITAR/FINALIZAR: Siempre ligero y con borde zinc */}
                        <button
                            onClick={() => setIsEditMode(!isEditMode)}
                            className="bg-white border border-zinc-200 text-zinc-600 hover:border-black hover:text-black text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl transition-all active:scale-95 mb-0.5"
                        >
                            {isEditMode ? 'Finalizar' : 'Editar'}
                        </button>

                        <Link
                            href="/admin/nuevo"
                            className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap mb-0.5"
                        >
                            Nuevo vehículo
                        </Link>
                    </div>
                </header>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-8 pb-40">
                    {displayedCars.map((car) => (
                        <div key={car._id} className="w-full relative group">

                            {isEditMode && (
                                <div className="absolute top-3 right-3 z-30 flex gap-2">
                                    {/* Botón Visibilidad */}
                                    <button
                                        onClick={(e) => handleToggleStatus(e, car._id, car.status)}
                                        className={`w-8 h-8 rounded-full flex items-center justify-center transition-all shadow-md active:scale-95 ${car.status === false
                                            ? 'bg-zinc-400 text-white'
                                            : 'bg-white text-black border border-zinc-100'
                                            }`}
                                    >
                                        {car.status === false ? (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l18 18" />
                                            </svg>
                                        ) : (
                                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                                                <path strokeLinecap="round" strokeLinejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                                            </svg>
                                        )}
                                    </button>

                                    {/* Botón Eliminar */}
                                    <button
                                        onClick={(e) => handleDelete(e, car._id, `${car.make} ${car.model}`)}
                                        className="w-8 h-8 bg-black text-white rounded-full flex items-center justify-center shadow-md transition-all hover:scale-110 active:scale-95"
                                    >
                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="3">
                                            <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
                                        </svg>
                                    </button>
                                </div>
                            )}

                            <div
                                onClick={() => isEditMode ? null : router.push(`/admin/editar/${car._id}`)}
                                className={`flex flex-col h-full ${!isEditMode ? 'cursor-pointer' : ''}`}
                            >
                                <AdminCarCard car={car} />
                            </div>
                        </div>
                    ))}
                </div>
            </main>
        </div>
    )
}

function AdminCarCard({ car }: { car: any }) {
    const displayPrice = car.financedPrice || car.listPrice || 0;
    const oldPrice = car.listPrice || 0;

    return (
        <div className={`bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full transition-all ${car.status === false ? 'opacity-50 grayscale' : ''}`}>
            <div className="aspect-[4/3] relative bg-gray-50 border-b border-gray-100 overflow-hidden">
                <img
                    src={car.imageUrl || 'https://via.placeholder.com/600x450?text=Sin+Imagen'}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-br-lg z-10 pointer-events-none leading-none">
                    {car.category || 'Stock'}
                </div>
            </div>

            <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic leading-none">
                        {car.year} · {car.transmission?.toUpperCase()}
                    </p>
                    <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate leading-none mb-3">
                        {car.make} {car.model}
                    </h4>

                    <div className="flex items-start gap-5">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Kilómetros</span>
                            <span className="text-[11px] font-bold text-zinc-700 italic leading-none whitespace-nowrap">
                                {car.mileage ? car.mileage.toLocaleString('es-CL') : '0'} KM
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100 shrink-0"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Motor</span>
                            <span className="text-[11px] font-bold text-zinc-700 uppercase italic leading-none whitespace-nowrap">
                                {car.engine ? `${car.engine}L` : '-'}
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100 shrink-0"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Combustible</span>
                            <span className="text-[11px] font-bold text-zinc-700 uppercase italic leading-none whitespace-nowrap">
                                {car.fuel?.toUpperCase() || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col text-left leading-none">
                        <span className="text-[8px] font-black text-gray-300 uppercase mb-0.5 leading-none line-through italic">
                            ${oldPrice.toLocaleString('es-CL')}
                        </span>
                        <p className="text-lg font-black text-black tracking-tighter leading-none">
                            ${displayPrice.toLocaleString('es-CL')}
                        </p>
                    </div>

                    <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 transition-colors hover:bg-black hover:text-white hover:border-black">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current translate-x-[0.5px]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}