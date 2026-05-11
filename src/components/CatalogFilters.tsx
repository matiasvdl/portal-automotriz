'use client'

import { useState, useMemo } from 'react'
import CarCard from './CarCard'

interface CatalogCar {
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
    imageUrl: string
    category?: string
    engine?: string
    body?: string
    drivetrain?: string
    color?: string
    location?: string
}

type CatalogFilterState = {
    category: string
    make: string
    model: string
    version: string
    body: string
    transmission: string
    fuel: string
    drivetrain: string
    color: string
    location: string
    minYear: string
    maxYear: string
    minPrice: string
    maxPrice: string
    minKm: string
    maxKm: string
}

const EMPTY_FILTERS: CatalogFilterState = {
    category: '',
    make: '',
    model: '',
    version: '',
    body: '',
    transmission: '',
    fuel: '',
    drivetrain: '',
    color: '',
    location: '',
    minYear: '',
    maxYear: '',
    minPrice: '',
    maxPrice: '',
    minKm: '',
    maxKm: ''
}

function getUniqueValues(cars: CatalogCar[], field: keyof CatalogCar) {
    return [...new Set(cars.map((car) => car[field]))]
        .filter((value): value is string => typeof value === 'string' && value.length > 0)
        .sort()
}

/**
 * Componente interno: Item de Filtro (Acordeón)
 * Mantiene el estilo original: text-[13px], text-zinc-700, zinc-400
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

export default function CatalogFilters({ initialCars, initialSearch = '' }: { initialCars: CatalogCar[]; initialSearch?: string }) {
    const [search, setSearch] = useState(initialSearch)
    const [sortBy, setSortBy] = useState('relevancia')
    const [isSortMenuOpen, setIsSortMenuOpen] = useState(false)

    // Estado con TODAS las opciones que extraemos de Sanity
    const [filters, setFilters] = useState<CatalogFilterState>(EMPTY_FILTERS)

    const hasActiveFilters = useMemo(() => {
        return Object.values(filters).some(value => value !== '') || search !== '';
    }, [filters, search]);

    // Lógica de filtrado
    const filteredCars = useMemo(() => {
        const result = initialCars.filter(car => {
            const matchSearch = (car.make + ' ' + car.model + ' ' + (car.version || '')).toLowerCase().includes(search.toLowerCase())

            const matchCat = filters.category === '' || car.category === filters.category
            const matchMake = filters.make === '' || car.make === filters.make
            const matchModel = filters.model === '' || car.model === filters.model
            const matchVersion = filters.version === '' || car.version === filters.version
            const matchBody = filters.body === '' || car.body === filters.body
            const matchTrans = filters.transmission === '' || car.transmission === filters.transmission
            const matchFuel = filters.fuel === '' || car.fuel === filters.fuel
            const matchDrive = filters.drivetrain === '' || car.drivetrain === filters.drivetrain
            const matchColor = filters.color === '' || car.color === filters.color
            const matchLoc = filters.location === '' || car.location === filters.location

            const carYear = car.year
            const matchMinYear = filters.minYear === '' || carYear >= parseInt(filters.minYear)
            const matchMaxYear = filters.maxYear === '' || carYear <= parseInt(filters.maxYear)

            const price = car.listPrice
            const matchMinPrice = filters.minPrice === '' || price >= parseInt(filters.minPrice)
            const matchMaxPrice = filters.maxPrice === '' || price <= parseInt(filters.maxPrice)

            const km = car.mileage
            const matchMinKm = filters.minKm === '' || km >= parseInt(filters.minKm)
            const matchMaxKm = filters.maxKm === '' || km <= parseInt(filters.maxKm)

            return matchSearch && matchCat && matchMake && matchModel && matchVersion && matchBody && matchTrans &&
                matchFuel && matchDrive && matchColor && matchLoc &&
                matchMinYear && matchMaxYear && matchMinPrice &&
                matchMaxPrice && matchMinKm && matchMaxKm
        })

        if (sortBy === 'precio-menor') result.sort((a, b) => (a.listPrice) - (b.listPrice))
        if (sortBy === 'precio-mayor') result.sort((a, b) => (b.listPrice) - (a.listPrice))
        if (sortBy === 'año-nuevo') result.sort((a, b) => b.year - a.year)
        if (sortBy === 'km-menor') result.sort((a, b) => a.mileage - b.mileage)

        return result
    }, [search, filters, sortBy, initialCars])

    const uniqueCategories = getUniqueValues(initialCars, 'category')
    const uniqueMakes = getUniqueValues(initialCars, 'make')

    // Si no hay marca seleccionada, retornamos lista vacía para Modelos
    const uniqueModels = useMemo(() => {
        if (filters.make === '') return []
        return [...new Set(initialCars.filter(c => c.make === filters.make).map(c => c.model))].filter(Boolean).sort()
    }, [initialCars, filters.make])

    // Si no hay modelo seleccionado, retornamos lista vacía para Versiones
    const uniqueVersions = useMemo(() => {
        if (filters.model === '') return []
        return [...new Set(initialCars.filter(c =>
            c.make === filters.make &&
            c.model === filters.model
        ).map(c => c.version))].filter((version): version is string => typeof version === 'string' && version.length > 0).sort()
    }, [initialCars, filters.make, filters.model])

    const uniqueBodies = getUniqueValues(initialCars, 'body')
    const uniqueFuels = getUniqueValues(initialCars, 'fuel')
    const uniqueTrans = getUniqueValues(initialCars, 'transmission')
    const uniqueDrives = getUniqueValues(initialCars, 'drivetrain')
    const uniqueColors = getUniqueValues(initialCars, 'color')
    const uniqueLocs = getUniqueValues(initialCars, 'location')

    return (
        <div className="bg-white min-h-screen text-left">
            {/* 1. BUSCADOR SUPERIOR */}
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
                            placeholder="Busca por marca, modelo o versión"
                            className="w-full bg-[#F7F8F9] border-none rounded-lg pl-11 pr-4 py-3 text-sm font-medium placeholder:text-zinc-400 outline-none focus:ring-1 focus:ring-black transition-all leading-none"
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                </div>
            </div>

            {/* 2. CONTENIDO PRINCIPAL */}
            <div className="max-w-7xl mx-auto px-6 py-10 flex flex-col md:flex-row gap-12 leading-none">

                {/* BARRA LATERAL */}
                <aside className="w-full md:w-64 shrink-0">
                    <div className="sticky top-44 space-y-2">
                        <div className="flex items-center justify-between mb-6 leading-none">
                            <h2 className="text-[12px] font-black text-black uppercase tracking-tight">Filtros</h2>
                            {hasActiveFilters && (
                                <button
                                    onClick={() => {
                                        setFilters(EMPTY_FILTERS);
                                        setSearch('');
                                    }}
                                    className="text-[10px] font-black uppercase tracking-widest text-zinc-400 hover:text-zinc-800 transition-colors"
                                >
                                    LIMPIAR
                                </button>
                            )}
                        </div>

                        <div className="flex flex-col">
                            {/* CATEGORÍA */}
                            <FilterSection title="Categoría">
                                <div className="space-y-1">
                                    {uniqueCategories.map(cat => (
                                        <button key={cat} onClick={() => setFilters({ ...filters, category: filters.category === cat ? '' : cat })} className={`w-full text-left py-1.5 px-1 text-[13px] transition-colors ${filters.category === cat ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {cat}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* PRECIO */}
                            <FilterSection title="Precio">
                                <div className="flex gap-2 items-center px-1">
                                    <input type="number" placeholder="Desde" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, minPrice: e.target.value })} />
                                    <span className="text-zinc-300">-</span>
                                    <input type="number" placeholder="Hasta" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, maxPrice: e.target.value })} />
                                </div>
                            </FilterSection>

                            {/* MARCA */}
                            <FilterSection title="Marca">
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {uniqueMakes.map(make => (
                                        <button key={make} onClick={() => setFilters({ ...filters, make: filters.make === make ? '' : make, model: '', version: '' })} className={`w-full text-left py-1.5 px-1 text-[13px] transition-colors ${filters.make === make ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {make}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* MODELO */}
                            <FilterSection title="Modelo">
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {uniqueModels.map(model => (
                                        <button key={model} onClick={() => setFilters({ ...filters, model: filters.model === model ? '' : model, version: '' })} className={`w-full text-left py-1.5 px-1 text-[13px] transition-colors ${filters.model === model ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {model}
                                        </button>
                                    ))}
                                    {uniqueModels.length === 0 && <p className="text-[10px] text-zinc-400 italic px-1 py-2">Selecciona una marca</p>}
                                </div>
                            </FilterSection>

                            {/* VERSIÓN */}
                            <FilterSection title="Versión">
                                <div className="space-y-1 max-h-48 overflow-y-auto pr-2 custom-scrollbar">
                                    {uniqueVersions.map(v => (
                                        <button key={v} onClick={() => setFilters({ ...filters, version: filters.version === v ? '' : v })} className={`w-full text-left py-1.5 px-1 text-[13px] transition-colors ${filters.version === v ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {v}
                                        </button>
                                    ))}
                                    {uniqueVersions.length === 0 && (
                                        <p className="text-[10px] text-zinc-400 italic px-1 py-2">
                                            {filters.make === '' ? 'Selecciona una marca' : 'Selecciona un modelo'}
                                        </p>
                                    )}
                                </div>
                            </FilterSection>

                            {/* CARROCERÍA */}
                            <FilterSection title="Carrocería">
                                <div className="grid grid-cols-2 gap-2">
                                    {uniqueBodies.map(body => (
                                        <button key={body} onClick={() => setFilters({ ...filters, body: filters.body === body ? '' : body })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.body === body ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-gray-100 hover:border-zinc-300'}`}>
                                            {body}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* TRACCIÓN */}
                            <FilterSection title="Tracción">
                                <div className="grid grid-cols-2 gap-2">
                                    {uniqueDrives.map(d => (
                                        <button key={d} onClick={() => setFilters({ ...filters, drivetrain: filters.drivetrain === d ? '' : d })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.drivetrain === d ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-gray-100 hover:border-zinc-300'}`}>
                                            {d}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* COLOR */}
                            <FilterSection title="Color">
                                <div className="grid grid-cols-2 gap-2">
                                    {uniqueColors.map(c => (
                                        <button key={c} onClick={() => setFilters({ ...filters, color: filters.color === c ? '' : c })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.color === c ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-gray-100 hover:border-zinc-300'}`}>
                                            {c}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* UBICACIÓN */}
                            <FilterSection title="Ubicación">
                                <div className="space-y-1">
                                    {uniqueLocs.map(loc => (
                                        <button key={loc} onClick={() => setFilters({ ...filters, location: filters.location === loc ? '' : loc })} className={`w-full text-left py-1.5 px-1 text-[13px] transition-colors ${filters.location === loc ? 'font-bold text-black' : 'text-zinc-500 hover:text-black'}`}>
                                            {loc}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* AÑO */}
                            <FilterSection title="Año">
                                <div className="flex gap-2 items-center px-1">
                                    <input type="number" placeholder="Min" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, minYear: e.target.value })} />
                                    <span className="text-zinc-300">-</span>
                                    <input type="number" placeholder="Max" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, maxYear: e.target.value })} />
                                </div>
                            </FilterSection>

                            {/* KILOMETRAJE */}
                            <FilterSection title="Kilometraje">
                                <div className="flex gap-2 items-center px-1">
                                    <input type="number" placeholder="Min" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, minKm: e.target.value })} />
                                    <span className="text-zinc-300">-</span>
                                    <input type="number" placeholder="Max" className="w-full border border-gray-200 rounded p-2 text-xs outline-none" onChange={(e) => setFilters({ ...filters, maxKm: e.target.value })} />
                                </div>
                            </FilterSection>

                            {/* TRANSMISIÓN */}
                            <FilterSection title="Transmisión">
                                <div className="grid grid-cols-2 gap-2">
                                    {uniqueTrans.map(t => (
                                        <button key={t} onClick={() => setFilters({ ...filters, transmission: filters.transmission === t ? '' : t })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.transmission === t ? 'bg-black text-white border-black' : 'bg-white text-zinc-500 border-gray-100 hover:border-zinc-300'}`}>
                                            {t}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>

                            {/* COMBUSTIBLE */}
                            <FilterSection title="Combustible">
                                <div className="grid grid-cols-2 gap-2">
                                    {uniqueFuels.map(f => (
                                        <button key={f} onClick={() => setFilters({ ...filters, fuel: filters.fuel === f ? '' : f })} className={`text-[10px] font-bold py-2.5 border rounded-md uppercase tracking-tight transition-all ${filters.fuel === f ? 'bg-black text-white border-black' : 'bg-white text-zinc-400 border-gray-100 hover:border-zinc-300'}`}>
                                            {f}
                                        </button>
                                    ))}
                                </div>
                            </FilterSection>
                        </div>
                    </div>
                </aside>

                {/* 3. GRILLA DE RESULTADOS */}
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
