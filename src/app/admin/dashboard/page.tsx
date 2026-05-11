'use client'
/* eslint-disable @next/next/no-img-element */

import { useEffect, useMemo, useState } from 'react'
import Link from 'next/link'
import { client } from '@/sanity/lib/client'
import AdminNavigation from '@/components/AdminNavigation'
import AdminSoftSelect from '@/components/AdminSoftSelect'
import { useAdminFeedback } from '@/components/admin/AdminFeedbackProvider'
import { deleteCarAction } from '@/app/actions/carActions'
import { useSettings } from '@/context/SettingsContext'

interface PanelSeller {
    _id: string
    firstName?: string
    lastName?: string
}

interface PanelCar {
    _id: string
    make: string
    model: string
    version?: string
    year: number
    listPrice?: number
    financedPrice?: number
    category?: string
    status?: boolean
    slug?: string
    commission?: { type?: 'fixed' | 'percent'; value?: number } | null
    origin?: { type?: 'propio' | 'consignacion'; note?: string } | null
    assignedSeller?: PanelSeller | null
}

type EstadoFilter = 'todos' | 'disponibles' | 'vendidos' | 'ocultos'
type Estado = 'vendido' | 'oculto' | 'disponible'

function formatCLP(value: number) {
    return value.toLocaleString('es-CL')
}

function getEstado(car: PanelCar): Estado {
    if (car.category === 'Vendido') return 'vendido'
    if (car.status === false) return 'oculto'
    return 'disponible'
}

function calcularComision(car: PanelCar): number {
    const value = car.commission?.value
    if (typeof value !== 'number' || value <= 0) return 0
    if (car.commission?.type === 'percent') {
        const price = car.financedPrice || car.listPrice || 0
        return Math.round((price * value) / 100)
    }
    return value
}

const ESTADO_OPTIONS = [
    { value: 'todos', label: 'Todos los estados' },
    { value: 'disponibles', label: 'Disponibles' },
    { value: 'vendidos', label: 'Vendidos' },
    { value: 'ocultos', label: 'Ocultos' },
]

export default function DashboardPage() {
    const { config } = useSettings()
    const { confirmAction } = useAdminFeedback()
    const propioLabel = config?.siteName?.trim() || 'Propio'

    const [cars, setCars] = useState<PanelCar[]>([])
    const [sellers, setSellers] = useState<PanelSeller[]>([])
    const [loading, setLoading] = useState(true)
    const [deletingId, setDeletingId] = useState<string | null>(null)
    const [filterVendedor, setFilterVendedor] = useState<string>('')
    const [filterEstado, setFilterEstado] = useState<EstadoFilter>('todos')

    const handleDelete = async (car: PanelCar) => {
        const label = `${car.make} ${car.model} ${car.year}`.trim()
        const confirmed = await confirmAction({
            title: 'Eliminar vehículo',
            message: `¿Eliminar ${label} permanentemente? Esta acción no se puede deshacer.`,
            confirmText: 'Eliminar',
            cancelText: 'Cancelar',
            tone: 'danger',
        })
        if (!confirmed) return

        setDeletingId(car._id)
        try {
            const result = await deleteCarAction(car._id)
            if (result.success) {
                setCars((prev) => prev.filter((c) => c._id !== car._id))
            } else {
                alert(result.error || 'No se pudo eliminar el vehículo.')
            }
        } catch (err) {
            console.error('Error eliminando vehículo:', err)
            alert('Ocurrió un error inesperado al intentar eliminar.')
        } finally {
            setDeletingId(null)
        }
    }

    useEffect(() => {
        const load = async () => {
            try {
                const [carsData, sellersData] = await Promise.all([
                    client.fetch<PanelCar[]>(
                        `*[_type == "car"] | order(_createdAt desc){
                            _id, make, model, version, year, listPrice, financedPrice, category, status, commission, origin,
                            "slug": slug.current,
                            "assignedSeller": assignedSeller->{ _id, firstName, lastName }
                        }`,
                        {},
                        { cache: 'no-store' }
                    ),
                    client.fetch<PanelSeller[]>(
                        `*[_type == "adminProfile"] | order(firstName asc){ _id, firstName, lastName }`,
                        {},
                        { cache: 'no-store' }
                    ),
                ])
                setCars(carsData || [])
                setSellers(sellersData || [])
            } catch (err) {
                console.error('Error cargando dashboard:', err)
            } finally {
                setLoading(false)
            }
        }
        void load()
    }, [])

    // KPIs (basados en TODOS los autos, sin filtros)
    const totalAutos = cars.length
    const totalDisponibles = useMemo(() => cars.filter((c) => getEstado(c) === 'disponible').length, [cars])
    const totalVendidos = useMemo(() => cars.filter((c) => getEstado(c) === 'vendido').length, [cars])
    const totalComision = useMemo(
        () => cars.reduce((sum, c) => sum + calcularComision(c), 0),
        [cars]
    )

    // Filtros sobre la tabla
    const filteredCars = useMemo(() => {
        return cars.filter((car) => {
            if (filterVendedor === '__unassigned') {
                if (car.assignedSeller) return false
            } else if (filterVendedor) {
                if (car.assignedSeller?._id !== filterVendedor) return false
            }
            const estado = getEstado(car)
            if (filterEstado === 'disponibles' && estado !== 'disponible') return false
            if (filterEstado === 'vendidos' && estado !== 'vendido') return false
            if (filterEstado === 'ocultos' && estado !== 'oculto') return false
            return true
        })
    }, [cars, filterVendedor, filterEstado])

    const vendedorOptions = useMemo(() => ([
        { value: '', label: 'Todos los vendedores' },
        { value: '__unassigned', label: 'Sin asignar' },
        ...sellers.map((s) => ({
            value: s._id,
            label: `${s.firstName || ''} ${s.lastName || ''}`.trim() || 'Vendedor',
        })),
    ]), [sellers])

    function getDuenoLabel(car: PanelCar): string {
        if (car.origin?.type === 'consignacion') {
            return car.origin.note?.trim() || 'Consignación'
        }
        return propioLabel
    }

    if (loading) return <div className="min-h-screen bg-[#F7F8FA]" />

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased text-left">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 py-8">
                <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-9 gap-4 px-1 sm:px-0">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 italic leading-none">
                            Panel general
                        </p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            Dashboard
                        </h1>
                    </div>

                    <Link
                        href="/admin/catalogo"
                        className="w-full sm:w-auto bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 py-3.5 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 transition-all active:scale-95 whitespace-nowrap mb-0.5 text-center"
                    >
                        Ir a catálogo
                    </Link>
                </header>

                {/* KPI CARDS */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-7">
                    <KpiCard label="Total vehículos" value={totalAutos.toString()} />
                    <KpiCard label="Disponibles" value={totalDisponibles.toString()} />
                    <KpiCard label="Vendidos" value={totalVendidos.toString()} />
                    <KpiCard label="Comisión total" value={`$${formatCLP(totalComision)}`} />
                </div>

                {/* FILTROS */}
                <div className="bg-white border border-gray-100 rounded-2xl p-5 mb-5">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div className="flex flex-col space-y-2.5 text-left leading-none">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Vendedor</label>
                            <AdminSoftSelect
                                value={filterVendedor}
                                onChange={setFilterVendedor}
                                options={vendedorOptions}
                            />
                        </div>
                        <div className="flex flex-col space-y-2.5 text-left leading-none">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">Estado</label>
                            <AdminSoftSelect
                                value={filterEstado}
                                onChange={(v) => setFilterEstado(v as EstadoFilter)}
                                options={ESTADO_OPTIONS}
                            />
                        </div>
                    </div>
                </div>

                {/* TABLA */}
                <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-20">
                    {filteredCars.length === 0 ? (
                        <div className="p-10 text-center">
                            <p className="text-[10px] font-black uppercase tracking-widest text-zinc-500 leading-none">Sin resultados</p>
                            <p className="mt-3 text-[11px] font-medium text-zinc-500">Ajusta los filtros para ver vehículos.</p>
                        </div>
                    ) : (
                        <div className="overflow-x-auto">
                            <table className="w-full text-left">
                                <thead className="bg-black border-b border-black">
                                    <tr>
                                        <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-widest text-white">Vehículo</th>
                                        <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-widest text-white">Vendedor</th>
                                        <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-widest text-white">Origen</th>
                                        <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap">Precio</th>
                                        <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-widest text-white whitespace-nowrap">Comisión</th>
                                        <th className="px-5 py-3.5 text-[8px] font-black uppercase tracking-widest text-white">Estado</th>
                                        <th className="px-3 py-3.5"><span className="sr-only">Editar</span></th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {filteredCars.map((car) => {
                                        const estado = getEstado(car)
                                        const comision = calcularComision(car)
                                        const price = car.financedPrice || car.listPrice || 0
                                        const sellerName = car.assignedSeller
                                            ? `${car.assignedSeller.firstName || ''} ${car.assignedSeller.lastName || ''}`.trim() || 'Vendedor'
                                            : ''
                                        const commissionType = car.commission?.type
                                        const commissionValue = car.commission?.value || 0
                                        const detailLabel = commissionType === 'percent' && commissionValue > 0
                                            ? `${commissionValue}% del precio`
                                            : commissionType === 'fixed' && commissionValue > 0
                                                ? 'Monto fijo'
                                                : 'Sin comisión'
                                        return (
                                            <tr key={car._id} className="border-b border-gray-100 last:border-0 hover:bg-[#F7F8FA] transition-colors">
                                                <td className="px-5 py-4">
                                                    <a
                                                        href={car.slug ? `/catalogo/${car.slug}` : '/catalogo'}
                                                        target="_blank"
                                                        rel="noopener noreferrer"
                                                        className="inline-flex flex-col text-left leading-none"
                                                    >
                                                        <span className="text-[11px] font-black uppercase tracking-tight text-black leading-none">{car.make} {car.model}</span>
                                                        <span className="mt-1 text-[8px] font-bold uppercase tracking-widest text-zinc-400 leading-none">
                                                            {car.version || '—'} · {car.year}
                                                        </span>
                                                    </a>
                                                </td>
                                                <td className="px-5 py-4">
                                                    {sellerName ? (
                                                        <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-700 leading-none">{sellerName}</span>
                                                    ) : (
                                                        <span className="text-[9px] font-bold uppercase tracking-widest text-zinc-400 italic leading-none">Sin asignar</span>
                                                    )}
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className="text-[10px] font-bold uppercase tracking-tight text-zinc-700 leading-none">{getDuenoLabel(car)}</span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <span className="text-[10px] font-black tracking-tight text-black leading-none">${formatCLP(price)}</span>
                                                </td>
                                                <td className="px-5 py-4 whitespace-nowrap">
                                                    <p className="text-[10px] font-black tracking-tight text-black leading-none">${formatCLP(comision)}</p>
                                                    <p className="mt-1 text-[7px] font-bold uppercase tracking-widest text-zinc-400 leading-none">{detailLabel}</p>
                                                </td>
                                                <td className="px-5 py-4">
                                                    <span className={`inline-flex items-center px-2.5 py-1 rounded-full text-[8px] font-black uppercase tracking-widest leading-none border ${estado === 'vendido' ? 'bg-red-50 text-red-700 border-red-200' :
                                                        estado === 'oculto' ? 'bg-black text-white border-black' :
                                                            'bg-emerald-50 text-emerald-700 border-emerald-200'
                                                        }`}>
                                                        {estado === 'vendido' ? 'Vendido' : estado === 'oculto' ? 'Oculto' : 'Disponible'}
                                                    </span>
                                                </td>
                                                <td className="px-3 py-4 whitespace-nowrap text-right">
                                                    <div className="inline-flex items-center gap-2">
                                                        <Link
                                                            href={`/admin/editar/${car._id}`}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-zinc-400 hover:bg-black hover:text-white hover:border-black transition-colors"
                                                            title="Editar vehículo"
                                                            aria-label="Editar vehículo"
                                                        >
                                                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                                                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                                                            </svg>
                                                        </Link>
                                                        <button
                                                            type="button"
                                                            onClick={() => handleDelete(car)}
                                                            disabled={deletingId === car._id}
                                                            className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-gray-200 text-zinc-400 hover:bg-red-500 hover:text-white hover:border-red-500 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                                                            title="Eliminar vehículo"
                                                            aria-label="Eliminar vehículo"
                                                        >
                                                            <svg viewBox="0 0 24 24" className="h-4 w-4 fill-none stroke-current" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                                                                <path d="M3 6h18" />
                                                                <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                                                                <path d="M19 6l-1 14a2 2 0 0 1-2 2H8a2 2 0 0 1-2-2L5 6" />
                                                            </svg>
                                                        </button>
                                                    </div>
                                                </td>
                                            </tr>
                                        )
                                    })}
                                </tbody>
                            </table>
                        </div>
                    )}
                </div>
            </main>
        </div>
    )
}

function KpiCard({ label, value }: { label: string; value: string }) {
    return (
        <div className="bg-white border border-gray-100 rounded-2xl p-5">
            <p className="text-[8px] font-black uppercase tracking-widest text-zinc-400 mb-2 leading-none">{label}</p>
            <p className="text-2xl font-black tracking-tighter text-black leading-none">{value}</p>
        </div>
    )
}
