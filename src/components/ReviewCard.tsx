export default function ReviewCard({ name, date, text, rating, badge }: { name: string; date: string; text: string; rating: number; badge?: string }) {
    return (
        <div className="bg-[#F7F8F9] border border-gray-200 p-8 rounded-2xl text-left h-full transition-colors hover:border-gray-300">
            <div className="space-y-5">
                <div className="flex items-start gap-4">
                    <div className="w-12 h-12 bg-zinc-900 rounded-full flex items-center justify-center font-bold text-white uppercase shrink-0 text-lg">
                        {name.charAt(0)}
                    </div>
                    <div className="flex flex-col gap-0.5">
                        <span className="text-[9px] font-black text-zinc-500 uppercase tracking-[0.2em] mb-0.5">
                            {badge || 'Comprador'}
                        </span>
                        <div className="flex items-center gap-1.5">
                            <h4 className="font-extrabold text-black uppercase text-sm tracking-tighter leading-none">{name}</h4>
                            <div className="w-3.5 h-3.5 bg-zinc-900 rounded-full flex items-center justify-center shrink-0">
                                <svg viewBox="0 0 24 24" className="w-2 h-2 text-white fill-current" stroke="currentColor" strokeWidth="4">
                                    <path d="M20 6L9 17L4 12" fill="none" />
                                </svg>
                            </div>
                        </div>
                        <p className="text-[9px] text-zinc-400 font-bold uppercase tracking-widest mt-0.5">{date}</p>
                    </div>
                </div>
                <div className="flex gap-0.5">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className={`w-3.5 h-3.5 ${i < rating ? 'text-zinc-800' : 'text-zinc-200'} fill-current`} viewBox="0 0 20 20">
                            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                </div>
                <p className="text-sm text-zinc-700 leading-relaxed font-medium italic">"{text}"</p>
            </div>
        </div>
    )
}