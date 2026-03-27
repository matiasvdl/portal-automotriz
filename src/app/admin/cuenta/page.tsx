'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { writeClient } from '@/sanity/lib/client' // Usaremos Sanity para el perfil si ahí guardas al admin

export default function MiCuentaPage() {
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [isUserMenuOpen, setIsUserMenuOpen] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ESTADO PARA DATOS DEL PERFIL
    const [profileData, setProfileData] = useState({
        firstName: 'Matías',
        lastName: 'Videla',
        email: 'mvidal@vdlmotors.cl',
        phone: '+56 9 1234 5678',
        role: 'Administrador Principal'
    })

    // ESTADO PARA CONTRASEÑAS
    const [passwords, setPasswords] = useState({
        new: '',
        confirm: ''
    })

    // ID del documento en Sanity (deberías tener uno creado tipo 'admin' o 'settings')
    const ADMIN_DOC_ID = 'admin-profile-config'

    // Cargar datos reales al iniciar (Opcional si usas Sanity)
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

        // 1. Validar Contraseñas si se escribió algo
        if (passwords.new !== '' || passwords.confirm !== '') {
            if (passwords.new !== passwords.confirm) {
                alert('Las contraseñas no coinciden')
                setIsSubmitting(false)
                return
            }
            // Aquí iría tu lógica de Supabase: supabase.auth.updateUser({ password: passwords.new })
            console.log("Cambiando contraseña...")
        }

        try {
            // 2. Guardar Info Personal en Sanity (o tu DB elegida)
            await writeClient.createOrReplace({
                _id: ADMIN_DOC_ID,
                _type: 'adminProfile',
                ...profileData
            })

            alert('Perfil actualizado con éxito')
            setPasswords({ new: '', confirm: '' }) // Limpiar campos de clave
        } catch (error) {
            console.error(error)
            alert('Error al guardar los cambios.')
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
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none text-black group-hover:text-zinc-600 transition-colors">{profileData.firstName}</p>
                                <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 leading-none">Admin</p>
                            </div>
                            <div className="w-9 h-9 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black group-hover:bg-zinc-800 transition-all">M</div>
                        </div>

                        {isUserMenuOpen && (
                            <>
                                <div className="fixed inset-0 z-10" onClick={() => setIsUserMenuOpen(false)}></div>
                                <div className="absolute right-0 mt-4 w-48 bg-white border border-gray-100 rounded-2xl shadow-2xl shadow-black/10 z-20 overflow-hidden py-2 animate-in fade-in slide-in-from-top-2 duration-200">
                                    <button onClick={() => setIsUserMenuOpen(false)} className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 bg-[#F7F8FA]">Mi cuenta</button>
                                    <button className="w-full text-left px-5 py-3 text-[10px] font-black uppercase tracking-widest text-zinc-700 hover:bg-[#F7F8FA] transition-colors">Preferencias</button>
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
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Ajustes de perfil</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Mi Cuenta</h1>
                    </div>
                    <div className="flex items-center gap-3">
                        <button onClick={handleSave} disabled={isSubmitting} className="bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-10 py-3 rounded-xl shadow-xl shadow-black/10 hover:bg-zinc-800 disabled:opacity-50 transition-all active:scale-95">
                            {isSubmitting ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
                    <div className="lg:col-span-2 space-y-8">
                        {/* INFORMACIÓN PERSONAL */}
                        <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                <AccountInput label="Nombre" value={profileData.firstName} onChange={(v) => setProfileData({ ...profileData, firstName: v })} />
                                <AccountInput label="Apellido" value={profileData.lastName} onChange={(v) => setProfileData({ ...profileData, lastName: v })} />
                                <AccountInput label="Correo Electrónico" value={profileData.email} onChange={(v) => setProfileData({ ...profileData, email: v })} />
                                <AccountInput label="Teléfono de Contacto" value={profileData.phone} onChange={(v) => setProfileData({ ...profileData, phone: v })} />
                            </div>
                        </div>

                        {/* SEGURIDAD */}
                        <div className="bg-white rounded-[30px] border border-gray-100 p-8 space-y-6 shadow-none">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Seguridad y Acceso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-7">
                                <AccountInput label="Nueva Contraseña" type="password" value={passwords.new} onChange={(v) => setPasswords({ ...passwords, new: v })} />
                                <AccountInput label="Confirmar Contraseña" type="password" value={passwords.confirm} onChange={(v) => setPasswords({ ...passwords, confirm: v })} />
                            </div>
                            <p className="text-[9px] font-bold text-zinc-400 italic">Deja los campos en blanco si no deseas cambiar tu contraseña actual.</p>
                        </div>
                    </div>

                    {/* COLUMNA DERECHA */}
                    <div className="space-y-8">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-8 text-center shadow-none">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-6">Foto de Perfil</p>
                            <div className="relative inline-block group">
                                <div className="w-32 h-32 bg-[#F7F8FA] rounded-full flex items-center justify-center border-2 border-dashed border-zinc-200 overflow-hidden">
                                    <span className="text-3xl font-black text-zinc-300">M</span>
                                </div>
                                <button onClick={() => fileInputRef.current?.click()} className="absolute bottom-0 right-0 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white hover:scale-110 transition-all shadow-lg">
                                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M12 4v16m8-8H4" /></svg>
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" />
                            </div>
                            <div className="mt-8 space-y-1">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">{profileData.firstName} {profileData.lastName}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter italic">{profileData.role}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[30px] p-8 text-white">
                            <h4 className="text-[9px] font-black uppercase tracking-widest mb-4 opacity-50">Acceso del Sistema</h4>
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
                </div>
            </main>
        </div>
    )
}

// COMPONENTE AUXILIAR ACTUALIZADO
interface AIProps { label: string; value: string; onChange: (v: string) => void; type?: string; placeholder?: string; }
function AccountInput({ label, value, onChange, type = "text", placeholder = "" }: AIProps) {
    return (
        <div className="flex flex-col space-y-2.5 text-left leading-none">
            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                placeholder={placeholder}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 py-0 text-[11px] font-bold outline-none focus:ring-1 focus:ring-black transition-all"
            />
        </div>
    )
}