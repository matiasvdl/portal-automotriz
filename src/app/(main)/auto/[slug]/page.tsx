import { client } from '@/sanity/lib/client'
import { notFound } from 'next/navigation'

export const revalidate = 0

async function getCar(slug: string) {
    return await client.fetch(`
    *[_type == "car" && slug.current == $slug][0] {
      make, model, year, price, fuel, transmission, mileage, description, color, body, features,
      "images": images[].asset->url
    }
  `, { slug })
}

export default async function CarPage({ params }: { params: { slug: string } }) {
    const car = await getCar(params.slug)
    if (!car) notFound()

    // Mensaje dinámico para WhatsApp
    const waMessage = encodeURIComponent(`Hola, me interesa el ${car.make} ${car.model} (${car.year}) que vi en VDL Motors.`);
    const waNumber = "569XXXXXXXX"; // <-- PON TU NÚMERO AQUÍ

    return (
        <div className="max-w-7xl mx-auto px-6 py-12">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">

                {/* GALERÍA DE IMÁGENES */}
                <div className="space-y-4">
                    <div className="aspect-[4/3] rounded-2xl overflow-hidden bg-gray-50 border border-gray-100 shadow-sm">
                        <img src={car.images[0]} alt={car.model} className="w-full h-full object-cover" />
                    </div>
                    <div className="grid grid-cols-4 gap-4">
                        {car.images.slice(1, 5).map((img: string, i: number) => (
                            <div key={i} className="aspect-square rounded-xl overflow-hidden bg-gray-50 border border-gray-100">
                                <img src={img} className="w-full h-full object-cover" />
                            </div>
                        ))}
                    </div>
                </div>

                {/* INFORMACIÓN DEL AUTO */}
                <div className="flex flex-col">
                    <p className="text-xs font-bold text-gray-400 uppercase tracking-[0.2em] mb-2">
                        {car.year} · {car.body}
                    </p>
                    <h1 className="text-4xl font-black text-black uppercase tracking-tighter mb-4 leading-none">
                        {car.make} <span className="font-light">{car.model}</span>
                    </h1>
                    <p className="text-3xl font-black text-black tracking-tighter mb-10">
                        ${car.price.toLocaleString('es-CL')}
                    </p>

                    {/* FICHA TÉCNICA */}
                    <div className="grid grid-cols-2 gap-y-8 gap-x-4 border-t border-gray-100 pt-8 mb-10">
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Kilómetros</p>
                            <p className="text-base font-bold text-black uppercase">{car.mileage?.toLocaleString('es-CL')} KM</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Transmisión</p>
                            <p className="text-base font-bold text-black uppercase">{car.transmission}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Combustible</p>
                            <p className="text-base font-bold text-black uppercase">{car.fuel}</p>
                        </div>
                        <div>
                            <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1">Color</p>
                            <p className="text-base font-bold text-black uppercase">{car.color || 'N/A'}</p>
                        </div>
                    </div>

                    {/* DESCRIPCIÓN */}
                    <div className="bg-gray-50 p-6 rounded-2xl mb-8">
                        <p className="text-sm text-gray-600 leading-relaxed italic">"{car.description}"</p>
                    </div>

                    {/* ETIQUETAS DE EQUIPAMIENTO */}
                    {car.features && (
                        <div className="mb-10 space-y-4">
                            <h3 className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">Equipamiento destacado</h3>
                            <div className="flex flex-wrap gap-2">
                                {car.features.map((tag: string, i: number) => (
                                    <span key={i} className="px-3 py-1.5 bg-zinc-900 text-white text-[10px] font-bold uppercase rounded-lg">
                                        {tag}
                                    </span>
                                ))}
                            </div>
                        </div>
                    )}

                    <a
                        href={`https://wa.me/${waNumber}?text=${waMessage}`}
                        target="_blank"
                        className="w-full bg-black text-white text-center font-bold uppercase tracking-[0.2em] py-5 rounded-xl hover:bg-zinc-800 transition-colors"
                    >
                        Contactar por WhatsApp
                    </a>
                </div>
            </div>
        </div>
    )
}