import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import { eliminarAuto } from './actions'

async function getCars() {
    const query = `*[_type == "car"] | order(_createdAt desc) {
    _id,
    make,
    model,
    year,
    price,
    "imageUrl": images[0].asset->url
  }`
    const cars = await client.fetch(query)
    return cars
}

export default async function AdminPage() {
    const cars = await getCars()

    return (
        <main className="min-h-screen bg-black text-white p-8">
            <div className="max-w-6xl mx-auto">
                <div className="flex justify-between items-center mb-10 border-b border-zinc-800 pb-6">
                    <div>
                        <h1 className="text-3xl font-bold">Administración</h1>
                        <p className="text-zinc-400 mt-1">Gestiona tus vehículos publicados</p>
                    </div>
                    <Link
                        href="/admin/nuevo"
                        className="bg-blue-600 hover:bg-blue-700 text-white px-6 py-3 rounded-lg font-bold transition-all"
                    >
                        + Publicar Vehículo
                    </Link>
                </div>

                <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden">
                    <table className="w-full text-left border-collapse">
                        <thead>
                            <tr className="bg-zinc-800/50 text-zinc-400 text-xs uppercase tracking-widest">
                                <th className="p-4 font-semibold">Imagen</th>
                                <th className="p-4 font-semibold">Vehículo</th>
                                <th className="p-4 font-semibold">Año</th>
                                <th className="p-4 font-semibold">Precio</th>
                                <th className="p-4 font-semibold text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-zinc-800">
                            {cars.map((car: any) => (
                                <tr key={car._id} className="hover:bg-zinc-800/30 transition-colors">
                                    <td className="p-4">
                                        <div className="w-16 h-12 bg-zinc-800 rounded overflow-hidden">
                                            {car.imageUrl && <img src={car.imageUrl} alt={car.model} className="w-full h-full object-cover" />}
                                        </div>
                                    </td>
                                    <td className="p-4 font-medium">{car.make} {car.model}</td>
                                    <td className="p-4 text-zinc-400">{car.year}</td>
                                    <td className="p-4 text-blue-400 font-semibold">${car.price?.toLocaleString('es-CL')}</td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end gap-6 items-center">
                                            <Link href={`/admin/editar/${car._id}`} className="text-zinc-400 hover:text-yellow-500 text-sm font-medium">
                                                Editar
                                            </Link>
                                            <form action={async () => {
                                                'use server'
                                                await eliminarAuto(car._id)
                                            }}>
                                                <button type="submit" className="text-zinc-500 hover:text-red-500 text-sm font-medium">
                                                    Eliminar
                                                </button>
                                            </form>
                                        </div>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                </div>
            </div>
        </main>
    )
}