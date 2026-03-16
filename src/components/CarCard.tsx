import Link from 'next/link'

interface Car {
    _id: string
    slug: string
    make: string
    model: string
    year: number
    listPrice: number
    financedPrice: number
    fuel: string
    transmission: string
    mileage: number
    imageUrl: string
    category?: string
    engine?: string
}

export default function CarCard({ car }: { car: Car }) {
    const detailUrl = `/catalogo/${car.slug}`

    return (
        <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-colors">

            {/* IMAGEN Y BADGE */}
            <div className="aspect-[4/3] relative bg-gray-50 border-b border-gray-100 overflow-hidden">
                <Link href={detailUrl}>
                    <img
                        src={car.imageUrl || 'https://via.placeholder.com/600x450?text=Sin+Imagen'}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500 cursor-pointer"
                    />
                </Link>
                <div className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-br-lg pointer-events-none">
                    {car.category || 'Seminuevo'}
                </div>
            </div>

            {/* INFORMACIÓN */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-left"> {/* Reducido p-6 a 5 y space-y-5 a 4 */}
                <Link href={detailUrl}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic">
                        {car.year} · {car.transmission}
                    </p>
                    <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate leading-none mb-3 group-hover:text-zinc-700 transition-colors"> {/* mb-4 a 3 */}
                        {car.make} {car.model}
                    </h4>

                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1 text-zinc-400">Kilómetros</span>
                            <span className="text-[11px] font-bold text-zinc-700 italic">
                                {car.mileage ? car.mileage.toLocaleString('es-CL') : '0'} KM
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1 text-zinc-400">Motor</span>
                            <span className="text-[11px] font-bold text-zinc-700 uppercase italic">
                                {car.engine ? `${car.engine}L` : '-'}
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1 text-zinc-400">Combustible</span>
                            <span className="text-[11px] font-bold text-zinc-700 uppercase italic">
                                {car.fuel}
                            </span>
                        </div>
                    </div>
                </Link>

                {/* PRECIO DINÁMICO */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between"> {/* pt-5 a 4 */}
                    <div className="flex flex-col text-left">
                        <span className="text-[8px] font-black text-gray-400 uppercase mb-0.5 leading-none line-through opacity-50 italic">
                            ${car.listPrice?.toLocaleString('es-CL')}
                        </span>
                        <p className="text-lg font-black text-black tracking-tighter leading-none">
                            ${car.financedPrice?.toLocaleString('es-CL')}
                        </p>
                    </div>

                    <Link
                        href={detailUrl}
                        className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 transition-all hover:bg-black hover:text-white hover:border-black shrink-0" // w-10 h-10 a 9x9
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="w-4 h-4 fill-none stroke-current translate-x-[0.5px]" // w-5 h-5 a 4x4
                            strokeWidth="2.5"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        >
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </Link>
                </div>
            </div>
        </div>
    )
}