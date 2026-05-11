import Link from 'next/link'

export default function NotFound() {
    return (
        <main className="min-h-[75vh] flex flex-col items-center justify-center px-6 py-28 text-center bg-[#F7F8F9]">
            <p className="text-[9px] font-black uppercase tracking-[0.3em] text-zinc-400 mb-2 leading-none">
                Vehículo no disponible
            </p>
            <h1 className="text-lg sm:text-xl font-black uppercase tracking-tight leading-tight max-w-md">
                Este vehículo ya no está publicado.
            </h1>
            <p className="mt-4 max-w-sm text-[11px] font-medium text-zinc-500 leading-relaxed">
                Puede que se haya vendido o que la publicación esté en pausa.
                Revisa el catálogo para encontrar otras opciones.
            </p>

            <div className="mt-6 flex flex-col sm:flex-row items-stretch sm:items-center gap-2.5">
                <Link
                    href="/catalogo"
                    className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-5 py-3 rounded-xl hover:bg-zinc-800 transition-colors active:scale-95"
                    style={{ backgroundColor: 'var(--primary)' }}
                >
                    Ver catálogo
                </Link>
                <Link
                    href="/"
                    className="bg-white border border-zinc-200 text-zinc-700 hover:border-black hover:text-black text-[9px] font-black uppercase tracking-[0.2em] px-5 py-3 rounded-xl transition-colors active:scale-95"
                >
                    Volver al inicio
                </Link>
            </div>
        </main>
    )
}
