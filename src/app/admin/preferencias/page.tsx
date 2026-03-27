'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { writeClient } from '@/sanity/lib/client'

export default function PreferenciasPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)

    // ESTADO PARA CONFIGURACIONES GLOBALES
    const [settings, setSettings] = useState({
        siteName: 'VDL MOTORS',
        contactEmail: 'contacto@vdlmotors.cl',
        whatsappNumber: '+56 9 1234 5678',
        instagramUrl: 'https://instagram.com/vdlmotors',
        facebookUrl: 'https://facebook.com/vdlmotors',
        address: 'Santiago, Región Metropolitana',
        maintenanceMode: false
    })

    const SETTINGS_DOC_ID = 'site-settings-config'

    useEffect(() => {
        const fetchSettings = async () => {
            const data = await writeClient.fetch(`*[_id == $id][0]`, { id: SETTINGS_DOC_ID })
            if (data) {
                setSettings({
                    siteName: data.siteName || 'VDL MOTORS',
                    contactEmail: data.contactEmail || 'contacto@vdlmotors.cl',
                    whatsappNumber: data.whatsappNumber || '+56 9 1234 5678',
                    instagramUrl: data.instagramUrl || '',
                    facebookUrl: data.facebookUrl || '',
                    address: data.address || '',
                    maintenanceMode: data.maintenanceMode || false
                })
            }
        }
        fetchSettings()
    }, [])

    const handleSave = async () => {
        setIsSubmitting(true)
        try {
            await writeClient.createOrReplace({
                _id: SETTINGS_DOC_ID,
                _type: 'siteSettings',
                ...settings
            })
            alert('Preferencias actualizadas con éxito')
        } catch (error) {
            console.error(error)
            alert('Error al guardar las preferencias.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40 text-left">

            {/* NAVEGACIÓN */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-[100] h-20 flex items-center shadow-none">
                <div className="max-w-7xl mx-auto w-full px-6 flex justify-between items-center relative">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>

                    <div className="relative">
                        <div onClick={() => setIsUserMenuOpen(!isUserMenuOpen)} className="flex items-center gap-3 cursor-pointer select-none group">
                            <div className="text-right hidden sm:block leading-none">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none text-black group-hover:text-zinc-600 transition-colors">Matías</p>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Admin</p>
                            </div>
                            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black group-hover:bg-zinc-800 transition-all">M</div>
                        </div>

                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-4 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 z-20 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button onClick={() => { setIsUserMenuOpen(false); router.push('/admin/cuenta'); }} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:bg-[#F7F8FA] transition-colors">Mi cuenta</button>
                                    <button onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-[#F7F8FA]">Preferencias</button>
                                    <div className="h-[1px] bg-gray-50 mx-4 my-1"></div>
                                    <button onClick={() => router.push('/')} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-red-500 hover:bg-red-50 transition-colors">Cerrar sesión</button>
                                </div>
                            </>
                        )}
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex justify-between items-end mb-9 gap-4 relative">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Ajustes generales</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Preferencias</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSave} disabled={isSubmitting} className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-10 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95">
                            {isSubmitting ? 'Guardando...' : 'Guardar Ajustes'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">

                    {/* BLOQUE: INFORMACIÓN DE CONTACTO */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Contacto y Soporte</h3>
                        <div className="grid grid-cols-1 gap-7">
                            <PrefInput label="Email Público" value={settings.contactEmail} onChange={(v) => setSettings({ ...settings, contactEmail: v })} />
                            <PrefInput label="WhatsApp de Ventas" value={settings.whatsappNumber} onChange={(v) => setSettings({ ...settings, whatsappNumber: v })} />
                            <PrefInput label="Dirección Física / Oficina" value={settings.address} onChange={(v) => setSettings({ ...settings, address: v })} />
                        </div>
                    </div>

                    {/* BLOQUE: REDES SOCIALES */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6 shadow-none">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Redes Sociales</h3>
                        <div className="grid grid-cols-1 gap-7">
                            <PrefInput label="Instagram (URL)" value={settings.instagramUrl} onChange={(v) => setSettings({ ...settings, instagramUrl: v })} />
                            <PrefInput label="Facebook (URL)" value={settings.facebookUrl} onChange={(v) => setSettings({ ...settings, facebookUrl: v })} />
                        </div>
                    </div>

                    {/* BLOQUE: SISTEMA */}
                    <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6 shadow-none lg:col-span-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Configuración del Sitio</h3>
                        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
                            <div className="flex-1 w-full">
                                <PrefInput label="Nombre del Sitio (SEO)" value={settings.siteName} onChange={(v) => setSettings({ ...settings, siteName: v })} />
                            </div>
                            <div className="flex items-center gap-4 bg-[#F7F8FA] p-5 rounded-2xl border border-gray-100 w-full md:w-auto">
                                <div className="leading-tight">
                                    <p className="text-[10px] font-black uppercase tracking-widest">Modo Mantenimiento</p>
                                    <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter">Oculta el sitio al público</p>
                                </div>
                                <button
                                    onClick={() => setSettings({ ...settings, maintenanceMode: !settings.maintenanceMode })}
                                    className={`w-12 h-6 rounded-full transition-all relative ${settings.maintenanceMode ? 'bg-black' : 'bg-zinc-200'}`}
                                >
                                    <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.maintenanceMode ? 'left-7' : 'left-1'}`}></div>
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

// COMPONENTE AUXILIAR
interface PIProps { label: string; value: string; onChange: (v: string) => void; }
function PrefInput({ label, value, onChange }: PIProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type="text"
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all"
            />
        </div>
    )
}