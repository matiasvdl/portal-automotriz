function AdminCarCard({ car }: { car: any }) {
    const displayPrice = car.financedPrice || car.listPrice || 0;
    const oldPrice = car.listPrice || 0;

    return (
        <div className="bg-white border border-gray-100 rounded-2xl overflow-hidden flex flex-col h-full transition-all">

            {/* IMAGEN Y BADGE */}
            <div className="aspect-[4/3] relative bg-gray-50 border-b border-gray-100 overflow-hidden">
                <img
                    src={car.imageUrl || 'https://via.placeholder.com/600x450?text=Sin+Imagen'}
                    alt={`${car.make} ${car.model}`}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute top-0 left-0 bg-black text-white text-[9px] font-bold uppercase tracking-[0.2em] px-4 py-2 rounded-br-lg z-10 pointer-events-none leading-none">
                    {car.category || 'Stock'}
                </div>
            </div>

            {/* INFORMACIÓN: Alineada a la izquierda */}
            <div className="p-5 flex-grow flex flex-col justify-between space-y-4 text-left">
                <div>
                    <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest mb-1 italic leading-none">
                        {car.year} · {car.transmission?.toUpperCase()}
                    </p>
                    <h4 className="text-sm font-bold text-black uppercase tracking-tight truncate leading-none mb-3">
                        {car.make} {car.model}
                    </h4>

                    {/* CARACTERÍSTICAS: Alineadas a la izquierda con gap fijo */}
                    <div className="flex items-start gap-5">
                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Kilómetros</span>
                            <span className="text-[11px] font-bold text-zinc-700 italic leading-none whitespace-nowrap">
                                {car.mileage ? car.mileage.toLocaleString('es-CL') : '0'} KM
                            </span>
                        </div>

                        <div className="h-6 w-[1px] bg-gray-100 shrink-0"></div>

                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Motor</span>
                            <span className="text-[11px] font-bold text-zinc-700 uppercase italic leading-none whitespace-nowrap">
                                {car.engine ? `${car.engine}L` : '-'}
                            </span>
                        </div>

                        <div className="h-6 w-[1px] bg-gray-100 shrink-0"></div>

                        <div className="flex flex-col">
                            <span className="text-[8px] font-bold text-gray-400 uppercase tracking-tighter leading-none mb-1">Combustible</span>
                            <span className="text-[11px] font-bold text-zinc-700 uppercase italic leading-none whitespace-nowrap">
                                {car.fuel?.toUpperCase() || '-'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* PRECIO Y ACCIÓN */}
                <div className="pt-4 border-t border-gray-100 flex items-center justify-between">
                    <div className="flex flex-col text-left leading-none">
                        <span className="text-[8px] font-black text-gray-300 uppercase mb-0.5 leading-none line-through italic">
                            ${oldPrice.toLocaleString('es-CL')}
                        </span>
                        <p className="text-lg font-black text-black tracking-tighter leading-none">
                            ${displayPrice.toLocaleString('es-CL')}
                        </p>
                    </div>

                    <div className="w-9 h-9 rounded-full border border-gray-200 flex items-center justify-center text-gray-400 shrink-0 shadow-none">
                        <svg viewBox="0 0 24 24" className="w-4 h-4 fill-none stroke-current translate-x-[0.5px]" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
                            <polyline points="9 18 15 12 9 6" />
                        </svg>
                    </div>
                </div>
            </div>
        </div>
    )
}