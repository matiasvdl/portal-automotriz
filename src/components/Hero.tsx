'use client'

import { useSettings } from '@/context/SettingsContext'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'

export default function Hero() {
    // 1. AHORA EXTRAEMOS appearance EN LUGAR DE config
    const { appearance } = useSettings()
    // 2. BUSCAMOS EL HERO DENTRO DE appearance
    const hero = appearance?.hero

    const DEFAULT_BANNER = '/images/porsche-banner.jpg'

    // Lógica para obtener la URL de la imagen de Sanity
    const heroImageUrl = hero?.image?.asset
        ? urlFor(hero.image).url()
        : DEFAULT_BANNER

    return (
        <section className="relative h-[60vh] min-h-[400px] w-full overflow-hidden bg-black">
            <Image
                src={heroImageUrl}
                alt={hero?.title || "Banner VDL Motors"}
                fill
                priority
                className="object-cover transition-opacity duration-700"
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
            </div>
        </section>
    )
}