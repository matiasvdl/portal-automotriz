import Link from 'next/link'

// Definimos la interfaz con los nuevos campos de Sanity
interface Car {
    _id: string
    slug: string // Cambiamos ID por slug para las rutas
    make: string
    model: string
    year: number
    price: number
    fuel: string
    transmission: string
    mileage: number // Campo dinámico de kilometraje
    imageUrl: string
}

export default function CarCard({ car }: { car: Car }) {
    return (
        <div className="group bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col transition-colors">

            {/* IMAGEN Y BADGE CON SEGURIDAD */}
            <div className="aspect-[4/3] relative bg-gray-50 border-b border-gray-100 overflow-hidden">
                <img
                    src={car.imageUrl || 'https://via.placeholder.com/600x450?text=Sin+Imagen'}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                />
                <div className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-br-lg">
                    Seminuevo
                </div>
            </div>

            {/* INFORMACIÓN */}
            <div className="p-6 flex-grow flex flex-col justify-between space-y-5 text-left">
                <Link href={`/auto/${car.slug}`}>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1.5">
                        {car.year} · {car.transmission}
                    </p>
                    <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate leading-none mb-4 group-hover:text-zinc-700 transition-colors">
                        {car.make} {car.model}
                    </h4>

                    <div className="flex gap-4">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1.5">Kilómetros</span>
                            {/* KILOMETRAJE DINÁMICO */}
                            <span className="text-[11px] font-bold text-gray-700">
                                {car.mileage ? car.mileage.toLocaleString('es-CL') : '0'} KM
                            </span>
                        </div>
                        <div className="h-6 w-[1px] bg-gray-100"></div>
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1.5">Motor</span>
                            <span className="text-[11px] font-bold text-gray-700 uppercase">{car.fuel}</span>
                        </div>
                    </div>
                </Link>

                {/* PRECIO Y BOTÓN */}
                <div className="pt-5 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col text-left">
                        <span className="text-[9px] font-bold text-gray-400 uppercase mb-1 leading-none">Precio</span>
                        <p className="text-xl font-black text-black tracking-tighter leading-none">
                            ${car.price?.toLocaleString('es-CL')}
                        </p>
                    </div>

                    <Link
                        href={`/auto/${car.slug}`}
                        className="w-10 h-10 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 transition-all hover:bg-black hover:text-white hover:border-black shrink-0"
                    >
                        <svg
                            viewBox="0 0 24 24"
                            className="w-5 h-5 fill-none stroke-current translate-x-[0.5px]"
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