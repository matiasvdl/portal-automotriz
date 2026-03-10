import { client } from '@/sanity/lib/client'
import Link from 'next/link'

async function getCarDetail(id: string) {
    const query = `*[_type == "car" && _id == $id][0] {
    make, model, year, price, fuel, transmission, body,
    "images": images[].asset->url
  }`
    return await client.fetch(query, { id })
}

export default async function CarDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const { id } = await params;
    const car = await getCarDetail(id);

    if (!car) return <div className="min-h-screen bg-white p-10 font-bold">Vehículo no encontrado</div>

    const whatsappUrl = `https://wa.me/569XXXXXXXX?text=Hola VDL Motors, me interesa el ${car.make} ${car.model}.`

    return (
        <main className="min-h-screen bg-[#F9FAFB] text-gray-900 font-sans">
            <nav className="bg-white border-b border-gray-200 h-16 flex items-center sticky top-0 z-50">
                <div className="max-w-6xl mx-auto px-4 w-full flex justify-between items-center">
                    <Link href="/" className="text-sm font-bold text-gray-500 hover:text-[#0052FF]">← Volver</Link>
                    <span className="text-xs font-bold text-gray-400 uppercase tracking-widest">Detalle del vehículo</span>
                    <div className="w-10"></div>
                </div>
            </nav>

            <div className="max-w-6xl mx-auto px-4 py-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">

                    {/* IZQUIERDA: Fotos y Datos */}
                    <div className="lg:col-span-8 space-y-6">
                        <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                            <img src={car.images?.[0]} alt={car.model} className="w-full aspect-video object-cover" />
                        </div>

                        <div className="grid grid-cols-4 gap-2">
                            {car.images?.slice(1, 5).map((img: string, i: number) => (
                                <div key={i} className="bg-white border border-gray-200 rounded-md overflow-hidden aspect-video">
                                    <img src={img} className="w-full h-full object-cover" />
                                </div>
                            ))}
                        </div>

                        {/* Especificaciones Planas */}
                        <div className="bg-white border border-gray-200 rounded-lg p-6">
                            <h3 className="text-sm font-bold text-gray-900 uppercase tracking-wider mb-6 border-b border-gray-100 pb-2">Especificaciones Técnicas</h3>
                            <div className="grid grid-cols-2 sm:grid-cols-3 gap-6">
                                {[
                                    { label: 'Marca', val: car.make },
                                    { label: 'Modelo', val: car.model },
                                    { label: 'Año', val: car.year },
                                    { label: 'Transmisión', val: car.transmission },
                                    { label: 'Combustible', val: car.fuel },
                                    { label: 'Carrocería', val: car.body || 'Sedán' },
                                ].map((item) => (
                                    <div key={item.label} className="border-l-2 border-gray-100 pl-4">
                                        <p className="text-[10px] uppercase font-bold text-gray-400">{item.label}</p>
                                        <p className="text-sm font-bold text-gray-900 uppercase">{item.val}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </div>

                    {/* DERECHA: Compra / Acciones */}
                    <div className="lg:col-span-4 space-y-4">
                        <div className="bg-white border border-gray-200 rounded-lg p-6 sticky top-24">
                            <div className="mb-6">
                                <h1 className="text-2xl font-bold text-gray-900 uppercase tracking-tight">
                                    {car.make} {car.model}
                                </h1>
                                <p className="text-sm text-gray-500 font-medium">{car.year} · Certificado</p>
                            </div>

                            <div className="mb-8">
                                <p className="text-[10px] font-bold text-gray-400 uppercase mb-1">Precio</p>
                                <p className="text-3xl font-bold text-gray-900">
                                    ${car.price?.toLocaleString('es-CL')}
                                </p>
                            </div>

                            <div className="space-y-3">
                                <a href={whatsappUrl} target="_blank" className="flex items-center justify-center w-full bg-[#0052FF] text-white h-12 rounded-md text-sm font-bold hover:bg-[#0041CC] transition-colors">
                                    Contactar por WhatsApp
                                </a>
                                <button className="w-full border border-gray-200 text-gray-900 h-12 rounded-md text-sm font-bold hover:bg-gray-50">
                                    Simular crédito
                                </button>
                            </div>

                            <div className="mt-6 pt-6 border-t border-gray-100 text-center">
                                <p className="text-[10px] text-gray-400 font-bold uppercase">Entrega en Santiago y Regiones</p>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </main>
    )
}