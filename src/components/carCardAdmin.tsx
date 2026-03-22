'use client'

import Link from 'next/link'

export default function CarCardAdmin({ car }: { car: any }) {
    return (
        <Link href={`/admin/editar/${car.slug}`} className="group">
            <div className="bg-white rounded-[20px] overflow-hidden border border-gray-100 shadow-sm hover:shadow-md transition-all h-full flex flex-col">

                {/* IMAGEN Y BADGE */}
                <div className="relative h-48 w-full overflow-hidden">
                    <div className="absolute top-0 left-0 z-10 bg-black text-white text-[10px] font-black uppercase tracking-[0.2em] px-5 py-2 rounded-br-xl">
                        {car.condition || 'STOCK'}
                    </div>
                    <img
                        src={car.imageUrl}
                        alt={`${car.make} ${car.model}`}
                        className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                </div>

                {/* CONTENIDO */}
                <div className="p-6 space-y-4">
                    <div className="space-y-1">
                        <p className="text-[10px] font-bold text-zinc-400 uppercase tracking-widest italic">
                            {car.year} • {car.transmission}
                        </p>
                        <h3 className="text-sm font-black text-black uppercase tracking-tighter leading-none">
                            {car.make} {car.model}
                        </h3>
                    </div>

                    {/* FICHA TÉCNICA MINI */}
                    <div className="grid grid-cols-3 gap-2 py-3 border-y border-gray-50">
                        <div>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Kilómetros</p>
                            <p className="text-[9px] font-black text-black uppercase">{car.mileage.toLocaleString()} KM</p>
                        </div>
                        <div>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Motor</p>
                            <p className="text-[9px] font-black text-black uppercase">{car.engine}</p>
                        </div>
                        <div>
                            <p className="text-[7px] font-bold text-zinc-400 uppercase tracking-widest">Combustible</p>
                            <p className="text-[9px] font-black text-black uppercase">{car.fuel}</p>
                        </div>
                    </div>

                    {/* PRECIO Y BOTÓN */}
                    <div className="flex justify-between items-end pt-2">
                        <div className="space-y-0.5">
                            <p className="text-[9px] text-zinc-300 font-bold line-through">
                                ${(car.listPrice * 1.1).toLocaleString()}
                            </p>
                            <p className="text-lg font-black text-black tracking-tighter">
                                ${car.listPrice.toLocaleString()}
                            </p>
                        </div>
                        <div className="w-10 h-10 rounded-full border border-gray-100 flex items-center justify-center group-hover:bg-black group-hover:text-white transition-colors">
                            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M9 5l7 7-7 7" />
                            </svg>
                        </div>
                    </div>
                </div>
            </div>
        </Link>
    )
}