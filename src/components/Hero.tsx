'use client'

import { useSettings } from '@/context/SettingsContext'
import Image from 'next/image'

export default function Hero() {
    const { config } = useSettings()
    const hero = config?.hero // Asumiendo que lo traes en el context

    // Imagen por defecto (el Porsche que tienes ahora)
    const DEFAULT_BANNER = '/images/porsche-banner.jpg'

    return (
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-black">
            {/* Imagen Dinámica */}
            <Image
                src={hero?.image?.url || DEFAULT_BANNER}
                alt="Banner VDL Motors"
                fill
                priority
                className="object-cover transition-opacity duration-700"
                style={{
                    objectPosition: hero?.position || 'center', // Aquí es donde "mueves" la foto
                    opacity: 0.6 // El oscurecimiento que tienes ahora
                }}
            />

            {/* Textos */}
            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
                <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                    {hero?.title || 'TRANSFORMA TU CAMINO'}
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-300 md:text-sm">
                    {hero?.subtitle || 'Comprar y vender un auto nunca fue tan simple.'}
                </p>

                {/* Buscador (el que ya tienes) */}
                <div className="mt-8 w-full max-w-2xl">
                    {/* ... tu input de búsqueda ... */}
                </div>
            </div>
        </section>
    )
}