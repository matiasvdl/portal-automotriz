import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import { eliminarAuto } from './admin/actions'

async function getCars() {
  return await client.fetch(`*[_type == "car"] | order(_createdAt desc) {
    _id,
    make,
    model,
    year,
    price,
    "imageUrl": images[0].asset->url
  }`)
}

export default async function AdminDashboard() {
  const cars = await getCars()

  return (
    <main className="min-h-screen bg-black text-white p-10">
      <div className="max-w-6xl mx-auto">
        <div className="flex justify-between items-center mb-8 border-b border-zinc-800 pb-6">
          <div>
            <h1 className="text-3xl font-bold">Panel de Administración</h1>
            <p className="text-zinc-400 mt-1">Gestiona el inventario de vehículos</p>
          </div>
          <Link
            href="/admin/nuevo"
            className="bg-blue-600 px-6 py-3 rounded-lg font-bold hover:bg-blue-700 transition-all"
          >
            + Agregar Nuevo Auto
          </Link>
        </div>

        <div className="bg-zinc-900 rounded-xl border border-zinc-800 overflow-hidden shadow-2xl">
          <table className="w-full text-left">
            <thead className="bg-zinc-800/50 text-gray-400 text-xs uppercase tracking-widest">
              <tr>
                <th className="p-4">Vehículo</th>
                <th className="p-4">Año</th>
                <th className="p-4">Precio</th>
                <th className="p-4 text-right">Acciones</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-zinc-800">
              {cars.map((car: any) => (
                <tr key={car._id} className="hover:bg-zinc-800/30 transition-colors group">
                  <td className="p-4">
                    <div className="font-medium text-zinc-200">
                      {car.make} <span className="text-zinc-500 font-normal">{car.model}</span>
                    </div>
                  </td>
                  <td className="p-4 text-zinc-400">{car.year}</td>
                  <td className="p-4 text-blue-400 font-semibold">
                    ${car.price?.toLocaleString('es-CL')}
                  </td>
                  <td className="p-4 text-right">
                    <div className="flex justify-end items-center gap-6">
                      <Link
                        href={`/admin/editar/${car._id}`}
                        className="text-zinc-400 hover:text-yellow-500 transition-colors text-sm font-medium"
                      >
                        Editar
                      </Link>

                      {/* Formulario para eliminar */}
                      <form
                        action={async () => {
                          'use server'
                          await eliminarAuto(car._id)
                        }}
                      >
                        <button
                          type="submit"
                          className="text-zinc-500 hover:text-red-500 transition-colors text-sm font-medium"
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
            <div className="p-20 text-center text-zinc-600 italic">
              No hay vehículos publicados actualmente.
            </div>
          )}
        </div>
      </div>
    </main>
  )
}