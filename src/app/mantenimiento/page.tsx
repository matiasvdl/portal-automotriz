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
        <div className="relative min-h-screen overflow-hidden bg-[#F7F8FA] text-black font-sans">
            <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.95),rgba(247,248,250,0.75)_45%,rgba(240,242,245,0.9)_100%)]" />
            <div className="absolute left-[-120px] top-[-120px] h-[280px] w-[280px] rounded-full bg-white/70 blur-3xl" />
            <div className="absolute bottom-[-120px] right-[-80px] h-[260px] w-[260px] rounded-full bg-white/60 blur-3xl" />

            <div className="relative flex min-h-screen flex-col px-6 py-8 md:px-10 md:py-10">
                <header className="flex items-start justify-start">
                    <div className="text-3xl md:text-4xl font-black italic tracking-tighter uppercase leading-none">
                        {firstWord}
                        {restWords ? <span className="font-light text-zinc-500"> {restWords}</span> : null}
                    </div>
                </header>

                <main className="flex flex-1 items-center justify-center">
                    <div className="w-full max-w-5xl">
                        <div className="grid grid-cols-1 gap-8 lg:grid-cols-[1.4fr_0.8fr] lg:gap-10 items-end">
                            <section className="text-left">
                                <p className="mb-5 text-[10px] font-black uppercase tracking-[0.35em] text-zinc-400 leading-none">
                                    {eyebrow}
                                </p>
                                <h1 className="max-w-3xl text-5xl md:text-7xl lg:text-[88px] font-black uppercase tracking-tighter leading-[0.88]">
                                    {title}
                                </h1>
                                <div className="mt-8 max-w-2xl rounded-[32px] border border-white/80 bg-white/80 px-7 py-7 shadow-[0_20px_60px_rgba(0,0,0,0.04)] backdrop-blur-sm">
                                    <p className="text-sm md:text-[15px] font-bold leading-relaxed text-zinc-600">
                                        {message}
                                    </p>
                                </div>
                            </section>

                            <aside className="rounded-[32px] border border-white/80 bg-white px-7 py-8 shadow-[0_20px_60px_rgba(0,0,0,0.05)]">
                                <div className="space-y-6 text-left">
                                    <div className="space-y-2">
                                        <p className="text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none">
                                            Estado
                                        </p>
                                        <div className="inline-flex items-center gap-2 rounded-full bg-[#F7F8FA] px-4 py-2">
                                            <span className="h-2 w-2 rounded-full bg-black" />
                                            <span className="text-[9px] font-black uppercase tracking-[0.18em] text-black">
                                                En mantenimiento
                                            </span>
                                        </div>
                                    </div>

                                    <div className="border-t border-gray-100 pt-6">
                                        <p className="mb-3 text-[9px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none">
                                            {contactLabel}
                                        </p>
                                        <div className="rounded-[24px] bg-[#F7F8FA] px-5 py-5">
                                            <p className="text-[13px] font-black italic tracking-tight uppercase break-words leading-relaxed">
                                                {contactEmail || 'Pronto volveremos a estar disponibles'}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            </aside>
                        </div>
                    </div>
                </main>

                <footer className="flex justify-center pt-6 md:justify-end">
                    <p className="text-[9px] font-black uppercase tracking-[0.2em] text-zinc-300">
                        {footerText}
                    </p>
                </footer>
            </div>
        </div>
    )
}
