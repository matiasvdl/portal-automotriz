'use client'
/* eslint-disable @next/next/no-img-element */

import { useCallback, useEffect, useRef, useState } from 'react'
import { client } from '@/sanity/lib/client'
import { urlFor } from '@/sanity/lib/image'
import AdminNavigation from '@/components/AdminNavigation'
import { useSession } from "next-auth/react"
import bcrypt from "bcryptjs"
import { updateAdminProfile } from '@/app/actions/updateProfile'

type AccountProfile = {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    email?: string
    phone?: string
    role?: string
    image?: Record<string, unknown> | null
}

type ProfileState = {
    _id: string
    firstName: string
    lastName: string
    username: string
    email: string
    phone: string
    role: string
    image: File | Record<string, unknown> | null
}

type PasswordState = {
    new: string
    confirm: string
}

type ProfileUpdatePayload = {
    firstName: string
    lastName: string
    username: string
    email: string
    phone: string
    role: string
    password?: string
}

const INITIAL_PROFILE: ProfileState = {
    _id: '',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: 'Administrador',
    image: null
}

function formatShortTime(date: Date): string {
    return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit'
    })
}

export default function MiCuentaPage() {
    const { data: session } = useSession()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [isOnline, setIsOnline] = useState(true)
    const [localTime, setLocalTime] = useState('--:--')
    const [lastSyncLabel, setLastSyncLabel] = useState('--')
    const fileInputRef = useRef<HTMLInputElement>(null)
    const [profileData, setProfileData] = useState<ProfileState>(INITIAL_PROFILE)
    const [imagePreview, setImagePreview] = useState<string | null>(null)
    const [passwords, setPasswords] = useState<PasswordState>({ new: '', confirm: '' })

    const loadAllData = useCallback(async () => {
        if (!session?.user?.email) {
            return
        }

        const allUsers = await client.fetch<AccountProfile[]>(
            `*[_type == "adminProfile"] | order(_createdAt asc){
                _id,
                firstName,
                lastName,
                username,
                email,
                phone,
                role,
                image
            }`,
            {},
            { cache: 'no-store' }
        )

        const myData = allUsers.find((user) => user.email === session.user?.email)
        if (myData) {
            setProfileData({
                _id: myData._id,
                firstName: myData.firstName || '',
                lastName: myData.lastName || '',
                username: myData.username || '',
                email: myData.email || '',
                phone: myData.phone || '',
                role: myData.role || 'Administrador',
                image: myData.image || null
            })

            setImagePreview(myData.image ? urlFor(myData.image).url() : null)
        }

        setLastSyncLabel(formatShortTime(new Date()))
    }, [session?.user?.email])

    useEffect(() => {
        setMounted(true)
        setIsOnline(typeof navigator !== 'undefined' ? navigator.onLine : true)
        setLocalTime(formatShortTime(new Date()))
        void loadAllData()
    }, [loadAllData])

    useEffect(() => {
        if (!mounted) return

        const updateOnlineStatus = () => setIsOnline(navigator.onLine)
        const updateClock = () => setLocalTime(formatShortTime(new Date()))

        window.addEventListener('online', updateOnlineStatus)
        window.addEventListener('offline', updateOnlineStatus)
        const clockInterval = window.setInterval(updateClock, 30000)

        return () => {
            window.removeEventListener('online', updateOnlineStatus)
            window.removeEventListener('offline', updateOnlineStatus)
            window.clearInterval(clockInterval)
        }
    }, [mounted])

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0]
        if (file) {
            setProfileData({ ...profileData, image: file })
            setImagePreview(URL.createObjectURL(file))
        }
    }

    const handleSave = async () => {
        if (!profileData._id) return alert("No se pudo identificar el perfil.")
        setIsSubmitting(true)

        try {
            const updateData: ProfileUpdatePayload = {
                firstName: profileData.firstName,
                lastName: profileData.lastName,
                username: profileData.username,
                email: profileData.email,
                phone: profileData.phone,
                role: profileData.role,
            }

            if (passwords.new !== '') {
                if (passwords.new !== passwords.confirm) {
                    alert('Las contraseñas no coinciden')
                    setIsSubmitting(false)
                    return
                }
                const salt = await bcrypt.genSalt(10)
                updateData.password = await bcrypt.hash(passwords.new, salt)
            }

            let imageBase64: string | null = null
            const imageFile = profileData.image instanceof File ? profileData.image : null

            if (imageFile) {
                imageBase64 = await new Promise<string>((resolve) => {
                    const reader = new FileReader()
                    reader.onloadend = () => resolve(String(reader.result || ''))
                    reader.readAsDataURL(imageFile)
                })
            }

            const result = await updateAdminProfile(profileData._id, updateData, imageBase64)

            if (result.success) {
                alert('Cambios guardados con éxito')
                setPasswords({ new: '', confirm: '' })
                await loadAllData()
            } else {
                alert('Error: ' + result.error)
            }
        } catch (error) {
            console.error(error)
            alert('Error al guardar los cambios')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40 text-left no-scrollbar">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-8 gap-4 sm:gap-7 relative">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Panel de Control</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">
                            {profileData.email === session?.user?.email ? "Mi Cuenta" : `Editando a ${profileData.firstName}`}
                        </h1>
                    </div>
                    <button
                        onClick={handleSave}
                        disabled={isSubmitting}
                        className="w-full sm:w-auto bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-7 py-3.5 rounded-xl text-center"
                    >
                        {isSubmitting ? '...' : 'Guardar Cambios'}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">
                    <div className="space-y-7 order-1 lg:order-2">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-5 text-center">
                            <p className="text-[9px] font-black uppercase tracking-widest text-zinc-400 mb-6 leading-none">Foto de Perfil</p>
                            <div className="relative inline-block">
                                <div className="w-32 h-32 bg-[#F7F8FA] rounded-full flex items-center justify-center border border-zinc-100 overflow-hidden">
                                    {imagePreview ? (
                                        <img src={imagePreview} className="w-full h-full object-cover" alt="Profile" />
                                    ) : (
                                        <span className="text-3xl font-black text-zinc-300">{profileData.firstName.charAt(0) || 'M'}</span>
                                    )}
                                </div>
                                <button
                                    onClick={() => fileInputRef.current?.click()}
                                    className="absolute bottom-0 right-0 bg-black text-white w-10 h-10 rounded-full flex items-center justify-center border-4 border-white"
                                >
                                    <span className="text-lg font-light">+</span>
                                </button>
                                <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleFileChange} />
                            </div>
                            <div className="mt-7">
                                <p className="text-[11px] font-black uppercase tracking-widest leading-none">{profileData.firstName} {profileData.lastName}</p>
                                <p className="text-[9px] font-bold text-zinc-400 uppercase tracking-tighter mt-1 italic leading-none">{profileData.role}</p>
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[30px] p-6 text-white">
                            <h4 className="text-[9px] font-black uppercase tracking-widest mb-5 opacity-50 leading-none">Estado de Conexión</h4>
                            <div className="space-y-4">
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-[9px] font-bold uppercase text-zinc-500">Internet</span>
                                    <span className={`text-[9px] font-black uppercase px-2 py-0 rounded ${isOnline ? 'bg-green-500/20 text-green-400' : 'bg-red-500/20 text-red-300'}`}>
                                        {isOnline ? 'En Línea' : 'Sin Conexión'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-[9px] font-bold uppercase text-zinc-400">Sesión</span>
                                    <span className="text-[9px] font-black uppercase">
                                        {session?.user?.email ? 'Activa' : 'Sin sesión'}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center border-b border-white/5 pb-4">
                                    <span className="text-[9px] font-bold uppercase text-zinc-400">Última Sincronización</span>
                                    <span className="text-[9px] font-black uppercase">
                                        {lastSyncLabel}
                                    </span>
                                </div>
                                <div className="flex justify-between items-center">
                                    <span className="text-[9px] font-bold uppercase text-zinc-400">Hora Local</span>
                                    <span className="text-[9px] font-black uppercase">
                                        {mounted ? localTime : '--:--'}
                                    </span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="lg:col-span-2 space-y-7 order-2 lg:order-1">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Información Personal</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AccountInput label="Nombre" value={profileData.firstName} onChange={(v) => setProfileData({ ...profileData, firstName: v })} />
                                <AccountInput label="Apellido" value={profileData.lastName} onChange={(v) => setProfileData({ ...profileData, lastName: v })} />
                                <AccountInput label="Nombre de Usuario" value={profileData.username} onChange={(v) => setProfileData({ ...profileData, username: v })} />
                                <AccountInput label="Correo Electrónico" value={profileData.email} onChange={(v) => setProfileData({ ...profileData, email: v })} />
                                <AccountInput label="Teléfono de Contacto" value={profileData.phone} onChange={(v) => setProfileData({ ...profileData, phone: v })} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Seguridad y Acceso</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <AccountInput label="Nueva Contraseña" type="password" value={passwords.new} onChange={(v) => setPasswords({ ...passwords, new: v })} />
                                <AccountInput label="Confirmar Contraseña" type="password" value={passwords.confirm} onChange={(v) => setPasswords({ ...passwords, confirm: v })} />
                            </div>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase italic tracking-wider">La clave se encripta de forma segura al guardar.</p>
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
                className="w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 text-[11px] font-bold outline-none shadow-none"
            />
        </div>
    )
}
