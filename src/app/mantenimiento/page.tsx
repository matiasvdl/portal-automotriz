import { client } from '@/sanity/lib/client'
import { resolveBrandTextParts } from '@/lib/content-defaults'

interface MaintenanceData {
    siteName?: string
    maintenanceContent?: {
        eyebrow?: string
        title?: string
        message?: string
        contactLabel?: string
        contactEmail?: string
        footerText?: string
    }
    appearance?: {
        brandName?: string
        splitText?: boolean
        isJoined?: boolean
    }
    contact?: {
        email?: string
    }
}

async function getMaintenanceData() {
    return client.fetch<MaintenanceData>(`{
        "siteName": *[_type == "siteConfig"][0].siteName,
        "maintenanceContent": *[_type == "siteConfig"][0].maintenanceContent,
        "appearance": *[_id == "appearance-settings"][0]{ brandName, splitText, isJoined },
        "contact": coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0]){ email }
    }`, {}, { cache: 'no-store' })
}

export default async function MantenimientoPage() {
    const data = await getMaintenanceData()
    const brandName = data?.appearance?.brandName?.trim() || data?.siteName?.trim() || 'VDL MOTORS'
    const eyebrow = data?.maintenanceContent?.eyebrow?.trim() || 'Ajustes de inventario'
    const title = data?.maintenanceContent?.title?.trim() || 'VOLVEMOS PRONTO.'
    const message = data?.maintenanceContent?.message?.trim() || 'Estamos actualizando nuestro catálogo para ofrecerte los mejores vehículos.'
    const contactLabel = data?.maintenanceContent?.contactLabel?.trim() || 'Contacto Directo'
    const contactEmail = data?.maintenanceContent?.contactEmail?.trim() || data?.contact?.email?.trim() || ''
    const footerText = data?.maintenanceContent?.footerText?.trim() || `© ${new Date().getFullYear()} ${brandName}`

    const { splitText, isJoined, firstWord, displayName, restText } = resolveBrandTextParts(brandName, {
        splitText: data?.appearance?.splitText,
        isJoined: data?.appearance?.isJoined,
    })

    return (
        <div className="min-h-screen bg-white text-black font-sans">
            <div className="mx-auto flex min-h-screen max-w-7xl flex-col px-6 py-10">
                <div className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-3xl text-center">
                        <div className="mb-10 space-y-3">
                            <div className="mb-8 text-3xl font-black italic uppercase leading-none tracking-tighter md:text-4xl">
                                {splitText ? (
                                    <>
                                        {firstWord}
                                        {restText ? <span className={`font-light text-zinc-500${isJoined ? '' : ' ml-1'}`}>{restText}</span> : null}
                                    </>
                                ) : (
                                    displayName
                                )}
                            </div>
                            <p className="text-[10px] font-black uppercase tracking-[0.3em] text-zinc-400 leading-none">
                                {eyebrow}
                            </p>
                            <h1 className="text-3xl font-black uppercase tracking-tight leading-[0.95] md:text-5xl">
                                {title}
                            </h1>
                        </div>

                        <div className="mx-auto max-w-xl rounded-2xl border border-gray-200 bg-[#F7F8F9] p-6 text-left">
                            <p className="mb-6 text-[13px] font-medium leading-relaxed text-zinc-700">
                                {message}
                            </p>
                            <div className="flex flex-col gap-1.5">
                                <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400">
                                    {contactLabel}
                                </p>
                                <p className="break-words text-[12px] font-extrabold uppercase tracking-tight">
                                    {contactEmail}
                                </p>
                            </div>
                        </div>
                    </div>
                </div>

                <div className="pt-8 text-center">
                    <p className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {footerText}
                    </p>
                </div>
            </div>
        </div>
    )
}
