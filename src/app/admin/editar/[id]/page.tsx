'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { client } from '@/sanity/lib/client'
import { actualizarAuto } from '../../actions'

export default function PaginaEditar() {
    const { id } = useParams()
    const router = useRouter()
    const [auto, setAuto] = useState<any>(null)

    useEffect(() => {
        client.fetch(`*[_id == $id][0]`, { id }).then(data => setAuto(data))
    }, [id])

    if (!auto) return <div className="p-10 text-white">Cargando datos...</div>

    return (
        <main className="min-h-screen bg-black text-white p-10">
            <div className="max-w-2xl mx-auto bg-zinc-900 p-8 rounded-xl border border-zinc-800">
                <h1 className="text-2xl font-bold mb-6 text-yellow-500">Editar Vehículo</h1>

                <form
                    action={async (formData) => {
                        const res = await actualizarAuto(id as string, formData)
                        if (res.success) {
                            alert("Cambios guardados correctamente")
                            router.push('/admin')
                        }
                    }}
                    className="grid grid-cols-1 md:grid-cols-2 gap-4"
                >
                    <input name="make" defaultValue={auto.make} placeholder="Marca" className="bg-black border border-zinc-700 p-2 rounded" />
                    <input name="model" defaultValue={auto.model} placeholder="Modelo" className="bg-black border border-zinc-700 p-2 rounded" />
                    <input name="year" type="number" defaultValue={auto.year} placeholder="Año" className="bg-black border border-zinc-700 p-2 rounded" />
                    <input name="price" type="number" defaultValue={auto.price} placeholder="Precio" className="bg-black border border-zinc-700 p-2 rounded" />

                    <select name="fuel" defaultValue={auto.fuel} className="bg-black border border-zinc-700 p-2 rounded">
                        <option value="gasolina">Gasolina</option>
                        <option value="diesel">Diésel</option>
                        <option value="electrico">Eléctrico</option>
                    </select>

                    <select name="transmission" defaultValue={auto.transmission} className="bg-black border border-zinc-700 p-2 rounded">
                        <option value="manual">Manual</option>
                        <option value="automatica">Automática</option>
                    </select>

                    <button type="submit" className="md:col-span-2 bg-yellow-600 p-3 rounded font-bold hover:bg-yellow-700 transition-all text-black mt-4">
                        Actualizar Información
                    </button>
                </form>
            </div>
        </main>
    )
}