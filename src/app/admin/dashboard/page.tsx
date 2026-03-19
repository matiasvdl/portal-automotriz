'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import { eliminarAuto } from '../actions'

export default function DashboardPage() {
    const [cars, setCars] = useState<any[]>([])
    const [loading, setLoading] = useState(true)
    const [isMenuOpen, setIsMenuOpen] = useState(false)

    useEffect(() => {
        const fetchCars = async () => {
            const query = `*[_type == "car"] | order(_createdAt desc) {
                _id, make, model, year, price, status, "imageUrl": images[0].asset->url
            }`
            const data = await client.fetch(query)
            setCars(data)
            setLoading(false)
        }
        fetchCars()
    }, [])

    const handleEliminar = async (id: string) => {
        if (confirm('¿Eliminar vehículo permanentemente?')) {
            await eliminarAuto(id)
            setCars(cars.filter(car => car._id !== id))
        }
    }

    return (
        <div className="min-h-screen bg-[#FBFBFB] text-black font-sans antialiased">

            {/* Header con Menú de Usuario Desplegable */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center shadow-none text-left font-sans">
                <div className="max-w-7xl mx-auto px-6 w-full flex justify-between items-center">

                    <Link href="/" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>

                    {/* Menú de Usuario Compacto */}
                    <div className="relative">
                        <button
                            onClick={() => setIsMenuOpen(!isMenuOpen)}
                            className="flex items-center gap-3 hover:opacity-70 transition-opacity"
                        >
                            <div className="text-right hidden sm:block">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">Matías</p>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">Admin</p>
                            </div>
                            <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black">
                                M
                            </div>
                        </button>

                        {isMenuOpen && (
                            <div className="absolute right-0 mt-3 w-44 bg-white border border-gray-100 rounded-xl shadow-xl shadow-black/5 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                <Link href="/admin/perfil" className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-[#4A5568] hover:bg-gray-50 transition-colors">
                                    Configuración
                                </Link>
                                <Link href="/admin/ingresar" className="block px-4 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors border-t border-gray-50">
                                    Cerrar Sesión
                                </Link>
                            </div>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-12 space-y-10">

                <header className="flex justify-between items-center">
                    <div className="space-y-1">
                        <p className="text-[9px] font-black text-zinc-400 uppercase tracking-[0.4em] ml-1">Administración</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic leading-none text-black">Gestión de Stock</h1>
                    </div>

                    <Link href="/admin/nuevo" className="bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-6 py-3 rounded-lg hover:bg-zinc-800 transition-all shadow-md shadow-black/5">
                        + PUBLICAR VEHÍCULO
                    </Link>
                </header>

                {/* Grid Ajustado a 4 columnas y cards más pequeñas */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    {loading ? (
                        [...Array(4)].map((_, i) => (
                            <div key={i} className="bg-white rounded-2xl h-64 animate-pulse border border-gray-100" />
                        ))
                    ) : (
                        cars.map((car) => (
                            <div key={car._id} className="group bg-white border border-gray-100 rounded-2xl overflow-hidden hover:shadow-lg hover:shadow-black/5 transition-all duration-500 flex flex-col">

                                <div className="aspect-[16/11] overflow-hidden relative bg-zinc-50 border-b border-gray-50">
                                    <img
                                        src={car.imageUrl}
                                        alt={car.model}
                                        className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 grayscale-[20%] group-hover:grayscale-0"
                                    />
                                    <div className="absolute top-3 left-3">
                                        <span className={`text-[7px] font-black uppercase tracking-widest px-2 py-1 rounded shadow-sm ${car.status === 'Vendido' ? 'bg-black text-white' : 'bg-white text-black border border-gray-100'
                                            }`}>
                                            {car.status || 'Disponible'}
                                        </span>
                                    </div>
                                </div>

                                <div className="p-5 space-y-4 flex-1 flex flex-col justify-between">
                                    <div>
                                        <h3 className="text-[12px] font-black uppercase italic tracking-tight leading-tight text-black">
                                            {car.make} <span className="font-light text-zinc-400">{car.model}</span>
                                        </h3>
                                        <p className="text-[9px] font-bold text-zinc-500 uppercase tracking-wide mt-1.5">
                                            {car.year} • ${car.price?.toLocaleString('es-CL')}
                                        </p>
                                    </div>

                                    <div className="flex items-center justify-between pt-4 border-t border-gray-50">
                                        <Link
                                            href={`/admin/editar/${car._id}`}
                                            className="text-[8px] font-black uppercase tracking-[0.15em] text-black border-b border-black pb-0.5 hover:opacity-50 transition-all"
                                        >
                                            EDITAR
                                        </Link>
                                        <button
                                            onClick={() => handleEliminar(car._id)}
                                            className="text-[8px] font-black uppercase tracking-[0.15em] text-zinc-300 hover:text-red-500 transition-colors"
                                        >
                                            ELIMINAR
                                        </button>
                                    </div>
                                </div>
                            </div>
                        ))
                    )}
                </div>
            </main>
        </div>
    )
}