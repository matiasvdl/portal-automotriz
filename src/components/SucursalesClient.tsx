'use client'

import { useSettings } from '@/context/SettingsContext'

type BranchItem = {
    _key?: string
    name?: string
    address?: string
    hours?: string
    phone?: string
    daySchedules?: Array<{
        day?: string
        openTime?: string
        closeTime?: string
    }>
    workDays?: string[]
    openTime?: string
    closeTime?: string
}

const BRANCH_DAY_LABELS: Record<string, string> = {
    lun: 'Lun',
    mar: 'Mar',
    mie: 'Mié',
    jue: 'Jue',
    vie: 'Vie',
    sab: 'Sáb',
    dom: 'Dom',
}

function formatBranchSchedule(branch: BranchItem) {
    const daySchedules = Array.isArray(branch.daySchedules)
        ? branch.daySchedules.filter(
            (slot): slot is { day: string; openTime: string; closeTime: string } =>
                Boolean(slot?.day && slot?.openTime && slot?.closeTime)
        )
        : []

    if (daySchedules.length) {
        const ordered = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
        const sorted = [...daySchedules].sort((a, b) => ordered.indexOf(a.day) - ordered.indexOf(b.day))

        return sorted
            .map((slot) => `${BRANCH_DAY_LABELS[slot.day] || slot.day} ${slot.openTime}-${slot.closeTime}`)
            .join(' | ')
    }

    const workDays = Array.isArray(branch.workDays) ? branch.workDays : []
    const orderedDays = ['lun', 'mar', 'mie', 'jue', 'vie', 'sab', 'dom']
        .filter((day) => workDays.includes(day))
        .map((day) => BRANCH_DAY_LABELS[day])

    const daysLabel = orderedDays.join(', ')
    const timeLabel =
        branch.openTime && branch.closeTime
            ? `${branch.openTime} - ${branch.closeTime}`
            : branch.openTime || branch.closeTime || ''

    if (daysLabel && timeLabel) return `${daysLabel} | ${timeLabel}`
    if (daysLabel) return daysLabel
    if (timeLabel) return timeLabel
    return branch.hours || ''
}

function buildGoogleMapsEmbedUrl(address?: string) {
    const source = (address || '').trim()

    if (!source) {
        return ''
    }

    if (source.includes('/maps/embed')) {
        return source
    }

    return `https://maps.google.com/maps?q=${encodeURIComponent(source)}&t=&z=15&ie=UTF8&iwloc=&output=embed`
}

function buildGoogleMapsOpenUrl(address?: string) {
    const source = (address || '').trim()

    if (!source) {
        return ''
    }

    if (source.startsWith('http://') || source.startsWith('https://')) {
        return source
    }

    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(source)}`
}

export default function SucursalesClient() {
    const { config, appearance } = useSettings()
    const primaryColor = appearance?.primaryColor || '#000000'
    const branches = (config?.branches || []) as BranchItem[]
    const content = config?.branchesContent || {}

    return (
        <div className="min-h-screen bg-[#F7F8FA] antialiased text-black font-sans">
            <main className="max-w-7xl mx-auto px-6 pt-10 pb-20">
                <header className="mb-8 text-left">
                    <p className="mb-1 text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 italic leading-none">
                        {content.eyebrow || 'Ubicaciones'}
                    </p>
                    <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                        {content.title || 'Sucursales'}
                    </h1>
                </header>

                {branches.length === 0 ? (
                    <div className="rounded-[30px] border border-gray-100 bg-white p-8 text-left">
                        <p className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Sin sucursales disponibles</p>
                        <p className="mt-3 text-[12px] font-medium leading-relaxed text-zinc-500">
                            Aún no hay sucursales disponibles para mostrar.
                        </p>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {branches.map((branch, index) => {
                            const embedUrl = buildGoogleMapsEmbedUrl(branch.address)
                            const openMapUrl = buildGoogleMapsOpenUrl(branch.address)
                            const schedule = formatBranchSchedule(branch)

                            return (
                                <section key={branch._key || `${branch.name}-${index}`} className="grid grid-cols-1 gap-6 rounded-[30px] border border-gray-100 bg-white p-6 shadow-none lg:grid-cols-12 lg:p-7">
                                    <div className="space-y-5 lg:col-span-4">
                                        <div className="border-b border-gray-50 pb-5">
                                            <p className="text-[8px] font-black uppercase tracking-[0.3em] text-zinc-400 leading-none">
                                                Sucursal {index + 1}
                                            </p>
                                            <h2 className="mt-2 text-[20px] font-black uppercase tracking-tight leading-none text-black">
                                                {branch.name || 'Sucursal'}
                                            </h2>
                                        </div>

                                        <div className="space-y-4">
                                            <DetailItem label="Dirección" value={branch.address || 'Sin dirección disponible'} />
                                            {schedule ? <DetailItem label="Horario" value={schedule} /> : null}
                                            {branch.phone ? <DetailItem label="Teléfono" value={branch.phone} /> : null}
                                        </div>
                                    </div>

                                    <div className="lg:col-span-8 lg:pt-6">
                                        <div className="overflow-hidden rounded-[24px] border border-gray-100 bg-[#F7F8FA]">
                                            {embedUrl ? (
                                                <iframe
                                                    src={embedUrl}
                                                    className="h-[320px] w-full border-0"
                                                    loading="lazy"
                                                    referrerPolicy="no-referrer-when-downgrade"
                                                    allowFullScreen
                                                    title={`Mapa de ${branch.name || `Sucursal ${index + 1}`}`}
                                                />
                                            ) : (
                                                <div className="flex h-[320px] items-center justify-center px-6 text-center">
                                                    <p className="text-[10px] font-black uppercase tracking-widest text-zinc-400">
                                                        Esta sucursal aún no tiene mapa configurado
                                                    </p>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )
                        })}
                    </div>
                )}
            </main>
        </div>
    )
}

function DetailItem({ label, value }: { label: string; value: string }) {
    return (
        <div className="rounded-2xl border border-gray-100 bg-[#F7F8FA] px-4 py-4 text-left">
            <p className="text-[8px] font-black uppercase tracking-[0.25em] text-zinc-400 leading-none">{label}</p>
            <p className="mt-2 text-[12px] font-bold leading-relaxed text-black">{value}</p>
        </div>
    )
}
