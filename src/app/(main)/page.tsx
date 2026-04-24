/* eslint-disable @next/next/no-img-element */
import type { CSSProperties } from 'react'
import { client } from '@/sanity/lib/client'
import Link from 'next/link'
import CarCard from "@/components/CarCard"
import { urlFor } from '@/sanity/lib/image'
import { CONTENT_DEFAULTS, resolvePrimaryColor } from '@/lib/content-defaults'

export const revalidate = 0

interface HomeCar {
  _id: string
  slug: string
  make: string
  model: string
  version?: string
  year: number
  listPrice: number
  financedPrice: number
  fuel: string
  transmission: string
  mileage: number
  category?: string
  engine?: string
  imageUrl: string
}

interface HomeReview {
  _id: string
  name: string
  date: string
  rating: number
  comment: string
  badge?: string
}

interface HomeAppearance {
  hero?: {
    title?: string
    subtitle?: string
    image?: { asset?: unknown }
    position?: string
  }
  primaryColor?: string
}

interface HomePageData {
  cars: HomeCar[]
  reviews: HomeReview[]
  config?: {
    homeContent?: {
      featuredTitle?: string
      reviewsTitle?: string
    }
  }
  appearance?: HomeAppearance
}

export async function generateMetadata() {
  const config = await client.fetch(`*[_type == "siteConfig"][0]{ seoDescriptions }`)
  return {
    title: 'Inicio',
    description: config?.seoDescriptions?.home || 'Comprar y vender un auto nunca fue tan simple. Explora nuestro catÃ¡logo de vehÃ­culos seleccionados.'
  }
}

async function getData() {
  const query = `{
    "cars": *[_type == "car" && status != false] | order(_createdAt desc)[0...4] {
      _id,
      make,
      model,
      version,
      year,
      listPrice,
      financedPrice,
      fuel,
      transmission,
      mileage,
      category,
      engine,
      "slug": slug.current,
      "imageUrl": images[0].asset->url
    },
    "reviews": *[_type == "review"] | order(date desc)[0...3] {
      _id, name, date, rating, comment, badge
    },
    "config": *[_type == "siteConfig"][0] {
      navMenu,
      footerDescription,
      footerLinks,
      footerTagline
    },
    "appearance": *[_id == "appearance-settings"][0] {
      hero,
      primaryColor
    }
  }`
  return await client.fetch<HomePageData>(query)
}

export default async function HomePage() {
  const { cars, reviews, appearance, config } = await getData()

  const hero = appearance?.hero
  const primaryColor = resolvePrimaryColor(appearance?.primaryColor)

  const heroImageUrl = hero?.image?.asset ? urlFor(hero.image).url() : null
  const heroTitle = hero?.title?.trim() || CONTENT_DEFAULTS.heroTitle
  const heroSubtitle = hero?.subtitle?.trim() || CONTENT_DEFAULTS.heroSubtitle

  return (
    <div
      className="flex flex-col flex-grow"
      style={{ '--primary': primaryColor } as CSSProperties}
    >
      <header className="relative flex min-h-[min(60vh,560px)] flex-col items-center justify-center overflow-hidden bg-zinc-900 px-4 py-12 md:min-h-[400px] md:h-[450px] md:py-0">
        {heroImageUrl ? (
          <img
            src={heroImageUrl}
            className="absolute inset-0 h-full w-full object-cover opacity-60 transition-all duration-700"
            style={{ objectPosition: hero?.position || 'center' }}
            alt={heroTitle}
          />
        ) : null}
        <div className="relative z-10 max-w-3xl px-2 text-center text-white">
          <h1 className="mb-1 text-3xl font-extrabold uppercase leading-tight tracking-tight sm:text-4xl">
            {heroTitle}
          </h1>
          <p className="mb-5 text-base font-medium opacity-80 sm:text-lg">
            {heroSubtitle}
          </p>

          <div className="bg-white p-1 rounded-xl flex max-w-xl mx-auto border border-gray-200 shadow-sm">
            <input
              type="text"
              placeholder="Busca por marca o modelo..."
              className="flex-grow bg-transparent text-black py-3 px-4 outline-none text-sm font-medium placeholder:text-gray-400"
            />
            <button
              className="text-white px-8 py-3 rounded-lg text-[11px] font-bold uppercase transition-colors"
              style={{ backgroundColor: 'var(--primary)' }}
            >
              Buscar
            </button>
          </div>
        </div>
      </header>

      <section className="max-w-7xl mx-auto px-6 py-10">
        <div className="flex justify-between items-baseline mb-8">
          <div className="space-y-2">
            <h2 className="text-xl font-black tracking-tight text-black uppercase">{config?.homeContent?.featuredTitle?.trim() || 'ReciÃ©n llegados'}</h2>
            <div className="h-1 w-12" style={{ backgroundColor: 'var(--primary)' }}></div>
          </div>
          <Link href="/catalogo" className="text-[11px] font-bold text-[#666666] hover:text-black uppercase tracking-[0.15em] transition-colors">
            Ver todos los autos
          </Link>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {cars?.map((car) => (
            <CarCard key={car._id} car={car} />
          ))}
        </div>
      </section>

      <section className="bg-white pb-16 pt-10 border-t border-gray-100">
        <div className="max-w-7xl mx-auto px-6">
          <div className="mb-10 space-y-2 text-left">
            <h2 className="text-xl font-black tracking-tight text-black uppercase">{config?.homeContent?.reviewsTitle?.trim() || 'ReseÃ±a de nuestros clientes'}</h2>
            <div className="h-1 w-12" style={{ backgroundColor: 'var(--primary)' }}></div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {reviews?.map((review) => (
              <ReviewCard
                key={review._id}
                name={review.name}
                date={review.date}
                text={review.comment}
                rating={review.rating}
                badge={review.badge}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}

function ReviewCard({ name, date, text, rating, badge }: { name: string; date: string; text: string; rating: number; badge?: string }) {
  return (
    <div className="bg-[#F7F8F9] border border-gray-200 p-6 rounded-2xl text-left h-full transition-colors hover:border-gray-300">
      <div className="space-y-4">
        <div className="flex items-start gap-3">
          <div
            className="w-10 h-10 rounded-full flex items-center justify-center font-bold text-white uppercase shrink-0 text-base"
            style={{ backgroundColor: 'var(--primary)' }}
          >
            {name.charAt(0)}
          </div>
          <div className="flex flex-col gap-0.5">
            <span className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.2em] mb-0.5 leading-none">
              {badge || 'Comprador'}
            </span>
            <div className="flex items-center gap-1.5">
              <h4 className="font-extrabold text-black uppercase text-[12px] tracking-tighter leading-none">{name}</h4>
              <div
                className="w-3 h-3 rounded-full flex items-center justify-center shrink-0"
                style={{ backgroundColor: 'var(--primary)' }}
              >
                <svg viewBox="0 0 24 24" className="w-1.5 h-1.5 text-white fill-current" stroke="currentColor" strokeWidth="4">
                  <path d="M20 6L9 17L4 12" fill="none" />
                </svg>
              </div>
            </div>
            <p className="text-[8px] text-zinc-400 font-bold uppercase tracking-widest mt-1">{date}</p>
          </div>
        </div>
        <div className="flex gap-0.5">
          {[...Array(5)].map((_, i) => (
            <svg
              key={i}
              className="w-3 h-3 fill-current"
              viewBox="0 0 20 20"
              style={{ color: i < rating ? 'var(--primary)' : '#e5e7eb' }}
            >
              <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
            </svg>
          ))}
        </div>
        <p className="text-[13px] text-zinc-700 leading-relaxed font-medium italic">&quot;{text}&quot;</p>
      </div>
    </div>
  )
}
