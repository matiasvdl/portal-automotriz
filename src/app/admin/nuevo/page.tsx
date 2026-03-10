'use client'

import { guardarAuto } from '../actions'
import { useRouter } from 'next/navigation'

export default function PaginaNuevoAuto() {
    const router = useRouter()

    return (
        <main className="min-h-screen bg-black text-white p-10">
            <div className="max-w-2xl mx-auto bg-zinc-900 p-8 rounded-xl border border-zinc-800 shadow-2xl">
                <h1 className="text-2xl font-bold mb-6">Publicar Nuevo Vehículo</h1>

                <form
                    action={async (formData) => {
                        const res = await guardarAuto(formData);
                        if (res.success) {
                            alert("Vehículo publicado correctamente");
                            router.push('/admin')
                        } else {
                            alert("Error al subir el vehículo");
                        }
                    }}
                    id="car-form"
                    className="grid grid-cols-1 md:grid-cols-2 gap-6"
                >
                    <input name="make" placeholder="Marca" className="bg-black border border-zinc-700 p-3 rounded" required />
                    <input name="model" placeholder="Modelo" className="bg-black border border-zinc-700 p-3 rounded" required />
                    <input name="year" type="number" placeholder="Año" className="bg-black border border-zinc-700 p-3 rounded" required />
                    <input name="price" type="number" placeholder="Precio" className="bg-black border border-zinc-700 p-3 rounded" required />

                    <select name="fuel" className="bg-black border border-zinc-700 p-3 rounded">
                        <option value="gasolina">Gasolina</option>
                        <option value="diesel">Diésel</option>
                        <option value="electrico">Eléctrico</option>
                    </select>

                    <select name="transmission" className="bg-black border border-zinc-700 p-3 rounded">
                        <option value="manual">Manual</option>
                        <option value="automatica">Automática</option>
                    </select>

                    <div className="md:col-span-2">
                        <label className="block text-sm text-gray-400 mb-2 font-medium">Imagen del Vehículo</label>
                        <input
                            name="image"
                            type="file"
                            accept="image/*"
                            className="w-full bg-black border border-zinc-700 p-3 rounded file:bg-blue-600 file:text-white file:border-none file:px-4 file:py-1 file:rounded file:mr-4 file:cursor-pointer"
                            required
                        />
                    </div>

                    <button type="submit" className="md:col-span-2 bg-blue-600 p-4 rounded font-bold hover:bg-blue-700 transition-all shadow-lg shadow-blue-900/20">
                        Publicar Vehículo
                    </button>
                </form>
            </div>
        </main>
    )
}