'use client'

import { useState, useMemo } from 'react'
import CarCard from './CarCard'

/**
 * Componente interno: Item de Filtro (Acordeón)
 */
function FilterSection({ title, children }: { title: string; children: React.ReactNode }) {
    const [isOpen, setIsOpen] = useState(false)
    return (
        <div className="border-b border-gray-100 py-4 leading-none text-left">
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="w-full flex justify-between items-center group leading-none"
            >
                <span className="text-[13px] font-bold text-zinc-700 group-hover:text-black transition-colors">{title}</span>
                <svg
                    className={`w-4 h-4 text-zinc-400 transition-transform duration-300 ${isOpen ? 'rotate-180' : ''}`}
                    fill="none" stroke="currentColor" viewBox="0 0 24 24"
                >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M19 9l-7 7-7-7" />
                </svg>
            </button>
            {isOpen && <div className="mt-4 animate-in fade-in duration-300 leading-none">{children}</div>}
        </div>
    )
}

const SORT_OPTIONS = [
    { key: 'relevancia', label: 'RELEVANCIA' },
    { key: 'precio-menor', label: 'MENOR PRECIO' },
    { key: 'precio-mayor', label: 'MAYOR PRECIO' },
    { key: 'año-nuevo', label: 'MÁS NUEVO' },
    { key: 'km-menor', label: 'MENOS KM' },
]

export default function CatalogFilters({ initialCars }: { initialCars: any[] }) {
    const [search, setSearch] = useState('')
    const [sortBy, setSortBy] = useState('relevancia')
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

    const [filters, setFilters] = useState({
        make: '',
        model: '',
        body: '',
        transmission: '',
        fuel: '',
        minYear: '',
        maxYear: '',
        minPrice: '',
        maxPrice: '',
        minKm: '',
        maxKm: ''
    })

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(value => value !== '');
    }, [filters]);

    const filteredCars = useMemo(() => {
        let result = initialCars.filter(car => {
            const matchSearch = (car.make + ' ' + car.model).toLowerCase().includes(search.toLowerCase())
            const matchMake = filters.make === '' || car.make === filters.make
            const matchModel = filters.model === '' || car.model === filters.model
            const matchBody = filters.body === '' || car.body === filters.body
            const matchTrans = filters.transmission === '' || car.transmission === filters.transmission
            const matchFuel = filters.fuel === '' || car.fuel === filters.fuel

            const carYear = car.year
            const matchMinYear = filters.minYear === '' || carYear >= parseInt(filters.minYear)
            const matchMaxYear = filters.maxYear === '' || carYear <= parseInt(filters.maxYear)

            const price = car.listPrice // Usamos listPrice que es el campo real de Sanity
            const matchMinPrice = filters.minPrice === '' || price >= parseInt(filters.minPrice)
            const matchMaxPrice = filters.maxPrice === '' || price <= parseInt(filters.maxPrice)

            const km = car.mileage
            const matchMinKm = filters.minKm === '' || km >= parseInt(filters.minKm)
            const matchMaxKm = filters.maxKm === '' || km <= parseInt(filters.maxKm)

            return matchSearch && matchMake && matchModel && matchBody && matchTrans &&
                matchFuel && matchMinYear && matchMaxYear && matchMinPrice &&
                matchMaxPrice && matchMinKm && matchMaxKm
        })

        if (sortBy === 'precio-menor') result.sort((a, b) => (a.financedPrice || a.listPrice) - (b.financedPrice || b.listPrice))
        if (sortBy === 'precio-mayor') result.sort((a, b) => (b.financedPrice || b.listPrice) - (a.financedPrice || a.listPrice))
        if (sortBy === 'año-nuevo') result.sort((a, b) => b.year - a.year)
        if (sortBy === 'km-menor') result.sort((a, b) => a.mileage - b.mileage)

        return result
    }, [search, filters, sortBy, initialCars])

    const uniqueMakes = [...new Set(initialCars.map(c => c.make))].sort()
    const uniqueModels = [...new Set(initialCars.filter(c => filters.make === '' || c.make === filters.make).map(c => c.model))].sort()

    return (
        <div className="bg-white min-h-screen text-left">
            {/* 1. BUSCADOR SUPERIOR - Ajustado a max-w-7xl */}
            <div className="border-b border-gray-100 bg-white sticky top-20 z-30 leading-none">
                <div className="max-w-7xl mx-auto px-6 py-5">
                    <div className="relative">
                        <span className="absolute inset-y-0 left-4 flex items-center text-zinc-400">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                        </span>
                        <input
                            type="text"
                            placeholder="Busca por marca o modelo"
                            className="w-full bg-[#F7F8F9] border-none rounded-lg pl-11 pr-4 py-3 text-sm font-medium placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-black transition-all leading-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 2. CONTENIDO PRINCIPAL - Ajustado a max-w-7xl y gap-12 */}
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-12 leading-none">
                
                {/* BARRA LATERAL */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="sticky top-44 space-y-2">
                        <div className="flex items-center justify-between mb-6 leading-none">
                            <h2 className="text-[12px] font-black text-black uppercase tracking-tight">Filtros</h2>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => setFilters({ make: '', model: '', body: '', transmission: '', fuel: '', minYear: '', maxYear: '', minPrice: '', maxPrice: '', minKm: '', maxKm: '' })}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-800 transition-colors"
                                >
                                    LIMPIAR
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col">
                            <FilterSection title="Precio">
                                <div className="flex gap-2 items-center px-1">
                                    <input type="number" placeholder="Desde" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                                    <span className="text-zinc-300">-</span>
                                    <input type="number" placeholder="Hasta" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Carrocería">
                                <div className="grid grid-cols-2 gap-2">
                                    {['SUV', 'Sedan', 'Hatchback', 'Camioneta'].map(body => (
                                        <button key={body} onClick={() => setFilters({ ...filters, body: filters.body === body ? '' : body })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.body === body ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-gray-100 hover:border-zinc-300'}`}>
                                            {body}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection title="Marca">
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {uniqueMakes.map(make => (
                                        <button key={make} onClick={() => setFilters({ ...filters, make: filters.make === make ? '' : make, model: '' })} className={`w-full text-left py-1.5 px-1 text-[13px] transition-colors ${filters.make === make ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {make}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection title="Modelo">
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {uniqueModels.map(model => (
                                        <button key={model} onClick={() => setFilters({ ...filters, model: filters.model === model ? '' : model })} className={`text-left py-1.5 px-1 text-[13px] transition-colors ${filters.model === model ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {model}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection title="Año">
                                <div className="flex gap-2 items-center px-1">
                                    <input type="number" placeholder="Min" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, minYear: e.target.value })} />
                                    <span className="text-zinc-300">-</span>
                                    <input type="number" placeholder="Max" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Kilometraje">
                                <div className="flex gap-2 items-center px-1">
                                    <input type="number" placeholder="Min" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, minKm: e.target.value })} />
                                    <span className="text-zinc-300">-</span>
                                    <input type="number" placeholder="Max" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, maxKm: e.target.value })} />
                                </div>
                            </FilterSection>

                            <FilterSection title="Transmisión">
                                <div className="grid grid-cols-2 gap-2">
                                    {['Automatica', 'Manual'].map(t => (
                                        <button key={t} onClick={() => setFilters({ ...filters, transmission: filters.transmission === t ? '' : t })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.transmission === t ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-gray-100 hover:border-zinc-300'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            <FilterSection title="Combustible">
                                <div className="grid grid-cols-2 gap-2">
                                    {['Bencina', 'Diesel', 'Hibrido', 'Electrico'].map(f => (
                                        <button key={f} onClick={() => setFilters({ ...filters, fuel: filters.fuel === f ? '' : f })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.fuel === f ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-gray-100 hover:border-zinc-300'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>
                        </div>
                    </div>
                </aside>

                {/* 3. GRILLA DE RESULTADOS - Ajustado gap-8 e igualado tamaño visual */}
                <div className="flex-grow">
                    <div className="mb-6 flex justify-between items-center border-b border-gray-50 pb-5 leading-none">
                        <h3 className="text-zinc-800 text-[11px] font-black uppercase tracking-widest leading-none">
                            {filteredCars.length} {filteredCars.length === 1 ? 'Vehículo encontrado' : 'Vehículos encontrados'}
                        </h3>

                        <div className="relative">
                            <button
                                onClick={() => setIsSortMenuOpen(!isSortMenuOpen)}
                                className="flex items-center gap-2 text-[11px] font-black uppercase tracking-widest text-zinc-800 hover:text-black transition-colors"
                            >
                                <svg className="w-4 h-4 text-zinc-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M3 4h13M3 8h9m-9 4h6m4 0l4-4m0 0l4 4m-4-4v12" />
                                </svg>
                                {SORT_OPTIONS.find(opt => opt.key === sortBy)?.label}
                            </button>

                            {isSortMenuOpen && (
                                <div className="absolute right-0 mt-3 w-56 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-zinc-200/50 z-50 overflow-hidden animate-in fade-in zoom-in-95 duration-200">
                                    <div className="py-2">
                                        {SORT_OPTIONS.map((option) => (
                                            <button
                                                key={option.key}
                                                onClick={() => { setSortBy(option.key); setIsSortMenuOpen(false); }}
                                                className={`block w-full text-left px-6 py-3.5 text-[10px] font-bold uppercase tracking-wider transition-all
                                                    ${sortBy === option.key
                                                        ? 'bg-zinc-50 text-black font-black'
                                                        : 'text-zinc-400 hover:bg-zinc-50 hover:text-black'
                                                    }`}
                                            >
                                                {option.label}
                                            </button>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* GRID DE 3 COLUMNAS: Al tener filtros al lado, 3 columnas equivalen al tamaño de 4 en el inicio */}
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
                        {filteredCars.map((car) => (
                            <CarCard key={car._id} car={car} />
                        ))}
                    </div>
                </div>
            </div>
        </div>
    )
}