import { client } from '@/sanity/lib/client'
import Link from 'next/link'

async function getCarDetail(id: string) {
    const query = `*[_type == "car" && _id == $id][0] {
    make,
    model,
    year,
    price,
    fuel,
    transmission,
    body,
    "images": images[].asset->url
  }`
    return await client.fetch(query, { id })
}

export default async function CarDetailPage({ params }: { params: { id: string } }) {
    const car = await getCarDetail(params.id)

    if (!car) return <div className="min-h-screen bg-black text-white p-20 text-center font-bold text-2xl uppercase tracking-tighter">Vehículo no encontrado</div>

    return (
        <main className="min-h-screen bg-zinc-950 text-white pb-20">
            {/* Navegación de regreso */}
            <div className="max-w-6xl mx-auto p-6">
                <Link href="/" className="text-zinc-500 hover:text-white transition-colors text-sm font-bold flex items-center gap-2 mb-10">
                    ← VOLVER AL PORTAL
                </Link>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                    {/* Galería de Imágenes */}
                    <div className="space-y-4">
                        <div className="aspect-video bg-zinc-900 rounded-3xl overflow-hidden border border-zinc-800">
                            <img
                                src={car.images?.[0]}
                                alt={car.model}
                                className="w-full h-full object-cover"
                            />
                        </div>
                        {/* Miniaturas si hay más de una foto */}
                        <div className="grid grid-cols-4 gap-4">
                            {car.images?.slice(1).map((img: string, i: number) => (
                                <div key={i} className="aspect-square bg-zinc-900 rounded-xl overflow-hidden border border-zinc-800">
                                    <img src={img} className="w-full h-full object-cover opacity-60 hover:opacity-100 transition-opacity cursor-pointer" />
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Información del Vehículo */}
                    <div className="flex flex-col justify-center">
                        <div className="mb-8">
                            <span className="text-blue-500 font-black text-sm tracking-[0.3em] uppercase">{car.year}</span>
                            <h1 className="text-5xl font-black uppercase tracking-tighter mt-2 leading-none">
                                {car.make} <br />
                                <span className="text-zinc-600">{car.model}</span>
                            </h1>
                        </div>

                        <div className="grid grid-cols-2 gap-6 mb-10">
                            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Combustible</p>
                                <p className="font-bold text-zinc-200 uppercase">{car.fuel || 'N/A'}</p>
                            </div>
                            <div className="bg-zinc-900 p-4 rounded-2xl border border-zinc-800">
                                <p className="text-zinc-500 text-[10px] uppercase font-bold tracking-widest mb-1">Transmisión</p>
                                <p className="font-bold text-zinc-200 uppercase">{car.transmission || 'N/A'}</p>
                            </div>
                        </div>

                        <div className="border-t border-zinc-800 pt-8">
                            <p className="text-zinc-500 text-sm mb-2 font-bold uppercase tracking-widest">Precio de Venta</p>
                            <h2 className="text-6xl font-black text-blue-500 mb-8">
                                ${car.price?.toLocaleString('es-CL')}
                            </h2>

                            <button className="w-full bg-white text-black py-5 rounded-2xl font-black uppercase tracking-widest hover:bg-blue-600 hover:text-white transition-all transform active:scale-95 shadow-2xl shadow-blue-500/10">
                                Contactar por WhatsApp
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </main>
    )
}