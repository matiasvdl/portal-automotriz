'use client'

import { useState, useRef, useEffect } from 'react'
import { writeClient } from '@/sanity/lib/client'
import AdminNavigation from '@/components/AdminNavigation'

export default function MiCuentaPage() {
    const [isSubmitting, setIsSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    const [profileData, setProfileData] = useState({
        firstName: 'Matías',
        lastName: 'Videla',
        email: 'mvidal@vdlmotors.cl',
        phone: '+56 9 1234 5678',
        role: 'Administrador Principal'
    })

    const [passwords, setPasswords] = useState({ new: '', confirm: '' })
    const ADMIN_DOC_ID = 'admin-profile-config'

    useEffect(() => {
        const fetchAdminData = async () => {
            const data = await writeClient.fetch(`*[_id == $id][0]`, { id: ADMIN_DOC_ID })
            if (data) {
                setProfileData({
                    firstName: data.firstName || 'Matías',
                    lastName: data.lastName || 'Videla',
                    email: data.email || 'mvidal@vdlmotors.cl',
                    phone: data.phone || '+56 9 1234 5678',
                    role: data.role || 'Administrador Principal'
                })
            }
        }
        fetchAdminData()
    }, [])

    const handleSave = async () => {
        setIsSubmitting(true)
        if (passwords.new !== '' && passwords.new !== passwords.confirm) {
            alert('Las contraseñas no coinciden')
            setIsSubmitting(false)
            return
        }
        try {
            await writeClient.createOrReplace({
                _id: ADMIN_DOC_ID,
                _type: 'adminProfile',
                ...profileData
            })
            alert('Perfil actualizado con éxito')
            setPasswords({ new: '', confirm: '' })
        } catch (error) {
            alert('Error al guardar los cambios.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40 text-left">
            <AdminNavigation siteName={profileData.firstName} />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex flex-row justify-between items-end mb-9 gap-4 relative">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Ajustes de perfil</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Mi Cuenta</h1>
                    </div>
                    <button onClick={handleSave} disabled={isSubmitting} className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-6 sm:px-10 py-3 rounded-xl shadow-xl shadow-black/10 transition-all active:scale-95">
                        {isSubmitting ? '...' : 'Guardar'}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">

                    {/* BLOQUE FOTO Y ACCESO: Ahora va primero en el código para que en móvil suba solo */}
                    <div className="space-y-8 order-1 lg:order-2">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-8 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-6 leading-none">Foto de Perfil</p>
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-[#F7F8FA] rounded-full flex items-center justify-center border-2 border-dashed border-zinc-200 overflow-hidden">
                                    <span className="text-3xl font-black text-zinc-300">M</span>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white shadow-lg active:scale-90 transition-transform">
                                    <span className="text-lg">+</span>
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                            </div>
                            <div className="mt-8">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">{profileData.firstName} {profileData.lastName}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 italic leading-none">{profileData.role}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[30px] p-8 text-white">
                            <h4 className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-50 leading-none">Acceso del Sistema</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-[9px] font-bold uppercase text-zinc-400">Estado</span>
                                    <span className="text-[9px] font-black uppercase bg-green-500/20 text-green-400 px-2 py-1 rounded">Activo</span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold uppercase text-zinc-400">Última sesión</span>
                                    <span className="text-[9px] font-black uppercase">Hoy, 10:45 AM</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* INFORMACIÓN PERSONAL: Segundo en móvil, primero en escritorio */}
                    <div className="lg:col-span-2 space-y-8 order-2 lg:order-1">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                <AccountInput label="Nombre" value={profileData.firstName} onChange={(v) => setProfileData({ ...profileData, firstName: v })} />
                                <AccountInput label="Apellido" value={profileData.lastName} onChange={(v) => setProfileData({ ...profileData, lastName: v })} />
                                <AccountInput label="Correo Electrónico" value={profileData.email} onChange={(v) => setProfileData({ ...profileData, email: v })} />
                                <AccountInput label="Teléfono de Contacto" value={profileData.phone} onChange={(v) => setProfileData({ ...profileData, phone: v })} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Seguridad y Acceso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                <AccountInput label="Nueva Contraseña" type="password" value={passwords.new} onChange={(v) => setPasswords({ ...passwords, new: v })} />
                                <AccountInput label="Confirmar Contraseña" type="password" value={passwords.confirm} onChange={(v) => setPasswords({ ...passwords, confirm: v })} />
                            </div>
                            <p className="text-[9px] font-bold text-zinc-400 italic">Deja los campos en blanco si no deseas cambiar tu contraseña actual.</p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

function AccountInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string; }) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all"
            />
        </div>
    )
}