'use client'

import { useState, useMemo } from 'react'
import CarCard from './CarCard'

export default function CatalogFilters({ initialCars }: { initialCars: any[] }) {
    const [search, setSearch] = useState('')
    const [maxPrice, setMaxPrice] = useState<number>(0)
    const [bodyType, setBodyType] = useState('')
    const [transmission, setTransmission] = useState('')

    const filteredCars = useMemo(() => {
        return initialCars.filter(car => {
            const matchSearch = (car.make + ' ' + car.model).toLowerCase().includes(search.toLowerCase())
            const matchPrice = maxPrice === 0 || car.price <= maxPrice
            const matchBody = bodyType === '' || car.body === bodyType
            const matchTrans = transmission === '' || car.transmission.toLowerCase() === transmission.toLowerCase()
            return matchSearch && matchPrice && matchBody && matchTrans
        })
    }, [search, maxPrice, bodyType, transmission, initialCars])

    return (
        <>
            {/* 1. ENCABEZADO - Sin sombras, padding reducido y plano */}
            <header className="pt-10 pb-10 border-b border-gray-100 bg-[#F7F8F9]">
                <div className="max-w-7xl mx-auto px-6">

                    {/* Fila 1: Título y Buscador (Sin sombras) */}
                    <div className="flex flex-col md:flex-row md:items-start justify-between gap-8 mb-8 text-left">
                        <div className="space-y-2">
                            <h1 className="text-xl font-black tracking-tight text-black uppercase leading-none">
                                Catálogo <span className="font-light">Completo</span>
                            </h1>
                            <div className="h-1 w-12 bg-black"></div>
                            <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-[0.2em] pt-1">
                                {filteredCars.length} Vehículos encontrados actualmente
                            </p>
                        </div>

                        {/* Buscador: Sin sombras (shadow-none) */}
                        <div className="w-full md:w-80">
                            <input
                                type="text"
                                placeholder="BUSCAR POR MARCA O MODELO..."
                                className="w-full bg-white border border-gray-200 rounded-xl px-5 py-3.5 text-[11px] font-bold uppercase tracking-[0.15em] placeholder:text-zinc-400 outline-none focus:border-black transition-colors shadow-none"
                                onChange={(e) => setSearch(e.target.value)}
                            />
                        </div>
                    </div>

                    {/* Fila 2: Filtros Compactos */}
                    <div className="grid grid-cols-2 md:grid-cols-3 gap-6 pt-8 border-t border-gray-200/50">
                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">Precio Máximo</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[11px] font-bold text-black outline-none cursor-pointer uppercase tracking-wider shadow-none"
                                onChange={(e) => setMaxPrice(Number(e.target.value))}
                            >
                                <option value="0">TODOS LOS PRECIOS</option>
                                <option value="10000000">HASTA $10.000.000</option>
                                <option value="20000000">HASTA $20.000.000</option>
                                <option value="40000000">HASTA $40.000.000</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">Carrocería</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[11px] font-bold text-black outline-none cursor-pointer uppercase tracking-wider shadow-none"
                                onChange={(e) => setBodyType(e.target.value)}
                            >
                                <option value="">TODAS</option>
                                <option value="suv">SUV</option>
                                <option value="sedan">Sedán</option>
                                <option value="camioneta">Camioneta</option>
                                <option value="hatchback">Hatchback</option>
                            </select>
                        </div>

                        <div className="flex flex-col gap-2">
                            <label className="text-[10px] font-black uppercase text-zinc-500 tracking-widest leading-none">Transmisión</label>
                            <select
                                className="w-full bg-white border border-gray-200 rounded-lg px-4 py-3 text-[11px] font-bold text-black outline-none cursor-pointer uppercase tracking-wider shadow-none"
                                onChange={(e) => setTransmission(e.target.value)}
                            >
                                <option value="">TODAS</option>
                                <option value="automatica">Automática</option>
                                <option value="manual">Manual</option>
                            </select>
                        </div>
                    </div>
                </div>
            </header>

            {/* 2. GRILLA DE RESULTADOS */}
            <section className="max-w-7xl mx-auto px-6 py-12">
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                    {filteredCars.map((car) => (
                        <CarCard key={car._id} car={car} />
                    ))}
                </div>

                {filteredCars.length === 0 && (
                    <div className="text-center py-20 border border-dashed border-gray-200 rounded-2xl mt-10">
                        <p className="text-zinc-400 font-bold uppercase tracking-[0.2em] text-xs">
                            No hay vehículos que coincidan con los filtros aplicados.
                        </p>
                    </div>
                )}
            </section>
        </>
    )
}