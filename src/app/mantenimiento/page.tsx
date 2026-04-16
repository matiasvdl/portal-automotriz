import { client } from '@/sanity/lib/client'

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
    }
    contact?: {
        email?: string
    }
}

async function getMaintenanceData() {
    return client.fetch<MaintenanceData>(`{
        "siteName": *[_type == "siteConfig"][0].siteName,
        "maintenanceContent": *[_type == "siteConfig"][0].maintenanceContent,
        "appearance": *[_id == "appearance-settings"][0]{ brandName },
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

    const firstWord = brandName.split(' ')[0] || brandName
    const restWords = brandName.split(' ').slice(1).join(' ')

    return (
        <div className="min-h-screen bg-white text-black font-sans flex flex-col items-center justify-center p-6 text-center">
            <div className="text-4xl font-black italic tracking-tighter uppercase mb-12">
                {firstWord}
                {restWords ? <span className="font-light text-zinc-500"> {restWords}</span> : null}
            </div>

            <div className="space-y-4 mb-12">
                <p className="text-[10px] font-black uppercase tracking-[0.4em] text-zinc-400 leading-none">{eyebrow}</p>
                <h1 className="text-5xl md:text-7xl font-black uppercase tracking-tighter leading-[0.9]">
                    {title}
                </h1>
            </div>

            <div className="max-w-md bg-[#F7F8FA] rounded-[30px] p-8 border border-gray-100">
                <p className="text-xs font-bold leading-relaxed text-zinc-600 mb-6">
                    {message}
                </p>
                <div className="flex flex-col gap-2">
                    <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400">{contactLabel}</p>
                    <p className="text-sm font-black italic tracking-tight uppercase">{contactEmail}</p>
                </div>
            </div>

            <div className="fixed bottom-10">
                <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">{footerText}</p>
            </div>
        </div>
    )
}
