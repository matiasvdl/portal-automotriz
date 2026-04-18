'use client'
/* eslint-disable @next/next/no-img-element */

import Link from 'next/link'
import { useSettings } from '@/context/SettingsContext'
import { urlFor } from '@/sanity/lib/image'
import { resolveBrandLabel, resolveBrandTextParts, resolveLogoMaxHeightPx } from '@/lib/content-defaults'

interface FooterLink {
    title: string
    path: string
}

interface FooterConfig {
    siteName?: string
    footerDescription?: string
    footerTagline?: string
    footerLinks?: FooterLink[]
}

function resolveFooterLinks(items: FooterLink[]) {
    const cleanedItems = items.filter((item) => item.path !== '/sucursales')
    const faqIndex = cleanedItems.findIndex((item) => item.path === '/faq')
    const preferredIndex = faqIndex >= 0 ? faqIndex : cleanedItems.length

    const nextItems = [...cleanedItems]
    nextItems.splice(preferredIndex, 0, { title: 'Sucursales', path: '/sucursales' })
    return nextItems
}

export default function Footer({ config: propConfig }: { config?: FooterConfig }) {
    const { appearance, config: contextConfig } = useSettings()
    const config = (propConfig || contextConfig) as FooterConfig

    const brandName = resolveBrandLabel(appearance, config)
    const { splitText, isJoined, firstWord, displayName, restText } = resolveBrandTextParts(brandName, {
        splitText: appearance?.splitText,
        isJoined: appearance?.isJoined,
    })

    const renderTextLogo = () => {
        if (!splitText) return <span>{displayName}</span>

        return (
            <>
                {firstWord}
                {restText ? (
                    <span className={`font-light text-zinc-400${isJoined ? '' : ' ml-1'}`}>
                        {restText}
                    </span>
                ) : null}
            </>
        )
    }

    const logoUrl = appearance?.logo ? urlFor(appearance.logo).url() : null
    const logoMaxH = resolveLogoMaxHeightPx(appearance?.logoWidth)
    const year = new Date().getFullYear()
    const footerLinks = resolveFooterLinks(config?.footerLinks || [])

    return (
        <footer className="border-t border-white/5 bg-black pb-8 pt-16 text-white">
            <div className="mx-auto mb-12 grid max-w-7xl grid-cols-1 gap-8 px-6 text-left md:grid-cols-12 md:gap-16">
                <div className="space-y-6 md:col-span-4">
                    <div className="space-y-4">
                        <Link href="/" className="block">
                            {logoUrl ? (
                                <div
                                    className="relative flex max-w-full items-center justify-start"
                                    style={{ maxHeight: logoMaxH }}
                                >
                                    <img
                                        src={logoUrl}
                                        alt={brandName}
                                        className="h-auto w-auto max-h-full max-w-full object-contain object-left"
                                        style={{
                                            maxHeight: logoMaxH,
                                            maxWidth: '100%',
                                            width: 'auto',
                                            height: 'auto',
                                        }}
                                    />
                                </div>
                            ) : (
                                <div className="text-2xl font-black italic uppercase tracking-tighter text-white">
                                    {renderTextLogo()}
                                </div>
                            )}
                        </Link>

                        <p className="max-w-xs text-sm font-medium leading-relaxed text-zinc-400">
                            {config?.footerDescription || ''}
                        </p>
                    </div>
                </div>

                <div className="space-y-4 text-sm font-medium text-gray-400 md:hidden">
                    {footerLinks.map((link, i: number) => (
                        <Link key={i} href={link.path || '#'} className="block transition-colors hover:text-white">
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="hidden space-y-4 text-sm font-medium text-gray-400 md:col-span-3 md:block">
                    {footerLinks.slice(0, 3).map((link, i: number) => (
                        <Link key={i} href={link.path || '#'} className="block transition-colors hover:text-white">
                            {link.title}
                        </Link>
                    ))}
                </div>

                <div className="hidden space-y-4 text-sm font-medium text-gray-400 md:col-span-3 md:block">
                    {footerLinks.slice(3).map((link, i: number) => (
                        <Link key={i} href={link.path || '#'} className="block transition-colors hover:text-white">
                            {link.title}
                        </Link>
                    ))}
                    <div className="flex items-center gap-2 pt-4 text-white opacity-50">
                        <span className="rounded border border-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter">CL</span>
                        <span className="text-sm font-normal">Chile</span>
                    </div>
                </div>

                <div className="flex items-center gap-2 text-white opacity-50 md:hidden">
                    <span className="rounded border border-white px-1.5 py-0.5 text-[10px] font-bold uppercase tracking-tighter">CL</span>
                    <span className="text-sm font-normal">Chile</span>
                </div>
            </div>

            <div className="mx-auto mt-16 flex max-w-7xl flex-col items-center justify-between gap-4 border-t border-white/10 px-6 pt-8 text-[10px] font-bold uppercase tracking-[0.2em] text-gray-500 md:flex-row">
                <Link href="/admin/ingresar" className="ml-0.5 cursor-default transition-none hover:text-gray-500">
                    <p className="select-none text-center md:text-left">
                        © {year} {config?.siteName?.trim() || brandName} | TODOS LOS DERECHOS RESERVADOS
                    </p>
                </Link>

                <p className="hidden font-medium uppercase tracking-normal text-white md:block">
                    {config?.footerTagline || ''}
                </p>
            </div>
        </footer>
    )
}
