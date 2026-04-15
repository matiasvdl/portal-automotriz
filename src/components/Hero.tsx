'use client'

import { useSettings } from '@/context/SettingsContext'
import Image from 'next/image'
import { urlFor } from '@/sanity/lib/image'
import { CONTENT_DEFAULTS, resolveBrandLabel } from '@/lib/content-defaults'

export default function Hero() {
    const { appearance, config } = useSettings()
    const hero = appearance?.hero
    const brandName = resolveBrandLabel(appearance, config)

    const heroImageUrl = hero?.image?.asset ? urlFor(hero.image).url() : null
    const title = hero?.title?.trim() || CONTENT_DEFAULTS.heroTitle
    const subtitle = hero?.subtitle?.trim() || CONTENT_DEFAULTS.heroSubtitle

    return (
        <section className="relative flex min-h-[50vh] w-full flex-col items-center justify-center overflow-hidden bg-zinc-900 px-4 py-14 text-center text-white md:min-h-[400px] md:h-[60vh] md:py-0">
            {heroImageUrl ? (
                <Image
                    src={heroImageUrl}
                    alt={hero?.title?.trim() || `${brandName} — ${title}`}
                    fill
                    priority
                    sizes="100vw"
                    className="object-cover transition-opacity duration-700"
                    style={{
                        objectPosition: hero?.position || 'center',
                        opacity: 0.6,
                    }}
                />
            ) : null}

            <div className="relative z-10 flex max-w-4xl flex-col items-center px-2">
                <h1 className="text-2xl font-black uppercase tracking-tighter sm:text-3xl md:text-5xl lg:text-6xl">
                    {title}
                </h1>
                <p className="mt-2 max-w-2xl text-[10px] font-bold uppercase tracking-widest text-zinc-300 sm:text-xs md:text-sm">
                    {subtitle}
                </p>
            </div>
        </section>
    )
}