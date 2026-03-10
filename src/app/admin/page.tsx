import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import { eliminarAuto } from './actions'

async function getCars() {
    // Traemos los datos básicos para la tabla
    const query = `*[_type == "car"] | order(_createdAt desc) {
    _id,
    make,
    model,
    year,
    price,
    "imageUrl": images[0].asset->url
  }`
    return await client.fetch(query)
}

export default async function AdminPage() {
    const cars = await getCars()

    return (
        <main className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">

                <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white tracking-tight">Panel de Control</h1>
                        <p className="text-zinc-500 text-sm">Gestión de inventario VDL Motors</p>
                    </div>
                    <Link
                        href="/admin/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2.5 rounded-lg font-bold transition-all text-sm"
                    >
                        + Publicar Vehículo
                    </Link>
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-800/30 text-zinc-500 text-[10px] uppercase tracking-[0.2em]">
                                <th className="p-4 font-bold">Vista</th>
                                <th className="p-4 font-bold">Vehículo</th>
                                <th className="p-4 font-bold text-center">Año</th>
                                <th className="p-4 font-bold">Precio</th>
                                <th className="p-4 font-bold text-right">Gestión</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {cars.map((car: any) => (
                                <tr key={car._id} className="hover:bg-zinc-800/20 transition-colors group">
                                    <td className="p-4">
                                        <div className="w-14 h-10 bg-zinc-800 rounded overflow-hidden border border-zinc-700">
                                            {car.imageUrl ? (
                                                <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center text-[8px] text-zinc-600 uppercase">N/A</div>
                                            )}
                                        </div>
                                    </td>
                                    <td className="p-4 font-semibold text-zinc-200 uppercase text-sm">
                                        {car.make} <span className="text-zinc-500 font-normal">{car.model}</span>
                                    </td>
                                    <td className="p-4 text-center text-zinc-400 text-sm">{car.year}</td>
                                    <td className="p-4 text-blue-400 font-bold text-sm">
                                        ${car.price?.toLocaleString('es-CL')}
                                    </td>
                                    <td className="p-4">
                                        <div className="flex justify-end items-center gap-5">
                                            <Link
                                                href={`/admin/editar/${car._id}`}
                                                className="text-zinc-400 hover:text-yellow-500 transition-colors text-xs font-bold uppercase tracking-wider"
                                            >
                                                Editar
                                            </Link>

                                            <form action={async () => {
                                                'use server'
                                                await eliminarAuto(car._id)
                                            }}>
                                                <button
                                                    type="submit"
                                                    className="text-zinc-600 hover:text-red-500 transition-colors text-xs font-bold uppercase tracking-wider"
                                                >
                                                    Eliminar
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>

                    {cars.length === 0 && (
                        <div className="p-20 text-center">
                            <p className="text-zinc-600 italic text-sm">No se encontraron vehículos en la base de datos.</p>
                        </div>
                    )}
                </div>
            </div>
        </main>
    )
}