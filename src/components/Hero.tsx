'use client'

import { useSettings } from '@/context/SettingsContext'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image' // Asegúrate de tener este import

export default function Hero() {
    const { config } = useSettings()
    const hero = config?.hero

    const DEFAULT_BANNER = '/images/porsche-banner.jpg'

    // Obtenemos la URL de la imagen de Sanity o usamos la por defecto
    const bannerUrl = hero?.image?.asset
        ? urlFor(hero.image).url()
        : DEFAULT_BANNER

    return (
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-black">
            {/* Imagen Dinámica */}
            <Image
                src={bannerUrl}
                alt={hero?.title || "VDL Motors Banner"}
                fill
                priority
                className="object-cover"
                style={{
                    objectPosition: hero?.position || 'center',
                    opacity: 0.6
                }}
            />

            <div className="relative z-10 flex h-full flex-col items-center justify-center px-6 text-center text-white">
                <h1 className="text-3xl font-black uppercase tracking-tighter md:text-5xl lg:text-6xl">
                    {hero?.title || 'TRANSFORMA TU CAMINO'}
                </h1>
                <p className="mt-2 text-xs font-bold uppercase tracking-widest text-zinc-300 md:text-sm">
                    {hero?.subtitle || 'Comprar y vender un auto nunca fue tan simple.'}
                </p>

                {/* El buscador que ya tenías aquí abajo */}
            </div>
        </section>
    )
}