'use client'

import { useEffect, useState } from 'react'
import { client } from '@/sanity/lib/client'
import AdminNavigation from '@/components/AdminNavigation'
import AdminSoftSelect from '@/components/AdminSoftSelect'
import { useSession } from "next-auth/react"
import { useRouter } from 'next/navigation'
import bcrypt from "bcryptjs"
import { deleteAdminProfile, updateAdminProfile } from '@/app/actions/updateProfile'

type SessionUser = {
    role?: string
}

type AdminMember = {
    _id: string
    firstName?: string
    lastName?: string
    username?: string
    email?: string
    phone?: string
    role?: string
    image?: unknown
}

type AdminFormState = {
    _id: string
    firstName: string
    lastName: string
    username: string
    email: string
    phone: string
    role: string
    password: string
    confirmPassword: string
}

const EMPTY_USER_DATA: AdminFormState = {
    _id: 'new',
    firstName: '',
    lastName: '',
    username: '',
    email: '',
    phone: '',
    role: 'Ventas',
    password: '',
    confirmPassword: ''
}

export default function AdministracionPage() {
    const { data: session, status } = useSession()
    const router = useRouter()
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [mounted, setMounted] = useState(false)
    const [team, setTeam] = useState<AdminMember[]>([])
    const [userData, setUserData] = useState<AdminFormState>(EMPTY_USER_DATA)

    const loadTeam = async () => {
        const users = await client.fetch<AdminMember[]>(
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
        setTeam(users)
    }

    useEffect(() => {
        setMounted(true)

        if (status === 'authenticated') {
            const userRole = (session?.user as SessionUser | undefined)?.role
            if (userRole !== 'Administrador Principal') {
                router.push('/admin/dashboard')
            } else {
                void loadTeam()
            }
        }
    }, [session, status, router])

    const prepareNew = () => {
        setUserData(EMPTY_USER_DATA)
    }

    const handleDeleteMember = async (user: AdminMember) => {
        if (user.role === 'Administrador Principal') return
        const label = `${user.firstName || ''} ${user.lastName || ''}`.trim() || user._id
        if (!confirm(`¿Eliminar a ${label}? Esta acción no se puede deshacer.`)) return
        setIsSubmitting(true)
        try {
            const result = await deleteAdminProfile(user._id)
            if (result.success) {
                if (userData._id === user._id) prepareNew()
                await loadTeam()
            } else {
                alert(result.error || 'No se pudo eliminar')
            }
        } finally {
            setIsSubmitting(false)
        }
    }

    const selectToEdit = (user: AdminMember) => {
        setUserData({
            _id: user._id,
            firstName: user.firstName || '',
            lastName: user.lastName || '',
            username: user.username || '',
            email: user.email || '',
            phone: user.phone || '',
            role: user.role || 'Ventas',
            password: '',
            confirmPassword: ''
        })
        window.scrollTo({ top: 0, behavior: 'smooth' })
    }

    const handleSave = async () => {
        if (!userData.email || !userData.username) return alert("Usuario y Email obligatorios")
        setIsSubmitting(true)

        try {
            const payload: {
                firstName: string
                lastName: string
                username: string
                email: string
                phone: string
                role: string
                password?: string
            } = {
                firstName: userData.firstName,
                lastName: userData.lastName,
                username: userData.username.toLowerCase().trim(),
                email: userData.email,
                phone: userData.phone,
                role: userData.role,
            }

            if (userData.password !== '') {
                if (userData.password !== userData.confirmPassword) {
                    alert('Las contraseñas no coinciden')
                    setIsSubmitting(false)
                    return
                }
                const salt = await bcrypt.genSalt(10)
                payload.password = await bcrypt.hash(userData.password, salt)
            }

            const result = await updateAdminProfile(userData._id, payload, null)

            if (result.success) {
                alert(userData._id === 'new' ? 'Usuario creado' : 'Usuario actualizado')
                setUserData((prev) => ({ ...prev, password: '', confirmPassword: '' }))
                await loadTeam()
            }
        } catch (error) {
            console.error(error)
        } finally {
            setIsSubmitting(false)
        }
    }

    if (!mounted || status === 'loading') return null

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased pb-40 text-left no-scrollbar">
            <AdminNavigation />

            <main className="max-w-7xl mx-auto px-6 py-8">
                <header className="flex flex-col sm:flex-row justify-between items-stretch sm:items-end mb-8 gap-4 sm:gap-7 relative">
                    <div className="text-left flex-1">
                        <p className="text-[8px] font-black text-zinc-400 uppercase tracking-[0.3em] mb-0.5 leading-none italic">Gestión de Equipo</p>
                        <h1 className="text-2xl font-black uppercase tracking-tighter leading-none">Administración</h1>
                    </div>
                    <button onClick={handleSave} disabled={isSubmitting} className="w-full sm:w-auto bg-black text-white text-[9px] font-black uppercase tracking-[0.2em] px-7 py-3.5 rounded-xl text-center">
                        {isSubmitting ? '...' : 'Guardar Cambios'}
                    </button>
                </header>

                <div className="grid grid-cols-1 lg:grid-cols-3 gap-7 items-start">

                    <div className="space-y-7 order-1 lg:order-2">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5">
                            <div className="flex justify-between items-center border-b border-gray-50 pb-5 leading-none">
                                <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700">Miembros</h3>
                                <button onClick={prepareNew} className="text-[9px] font-black uppercase text-black tracking-widest hover:opacity-50">
                                    + Nuevo
                                </button>
                            </div>
                            <div className="space-y-3">
                                {team.map((user) => {
                                    const isPrincipal = user.role === 'Administrador Principal'
                                    return (
                                        <div
                                            key={user._id}
                                            onClick={() => selectToEdit(user)}
                                            className={`flex items-center justify-between gap-3 p-5 rounded-[20px] cursor-pointer transition-all border ${userData._id === user._id ? 'bg-black border-black text-white shadow-lg' : 'bg-[#F7F8FA] border-transparent hover:border-zinc-200 text-black'}`}
                                        >
                                            <div className="flex flex-col min-w-0 flex-1">
                                                <span className={`text-[9px] font-black uppercase ${userData._id === user._id ? 'text-white' : 'text-black'}`}>
                                                    {user.firstName} {user.lastName}
                                                </span>
                                                <span className={`text-[8px] font-bold uppercase tracking-tighter mt-1 ${userData._id === user._id ? 'text-zinc-400' : 'text-zinc-400'}`}>
                                                    @{user.username || 'sin-usuario'} • {user.role}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-2 shrink-0">
                                                {!isPrincipal && (
                                                    <button
                                                        type="button"
                                                        onClick={(e) => {
                                                            e.stopPropagation()
                                                            void handleDeleteMember(user)
                                                        }}
                                                        disabled={isSubmitting}
                                                        className={`rounded-lg p-2 transition-colors ${userData._id === user._id ? 'text-red-300 hover:bg-white/10' : 'text-zinc-400 hover:bg-red-50 hover:text-red-600'}`}
                                                        title="Eliminar usuario"
                                                        aria-label="Eliminar usuario"
                                                    >
                                                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth="2">
                                                            <path strokeLinecap="round" strokeLinejoin="round" d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                                                        </svg>
                                                    </button>
                                                )}
                                                {userData._id === user._id && (
                                                    <div className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></div>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>

                        <div className="bg-zinc-900 rounded-[30px] p-7 text-white space-y-7">
                            <div>
                                <h4 className="text-[9px] font-black uppercase tracking-widest mb-6 opacity-90 leading-none ">Jerarquía de Permisos</h4>
                                <div className="space-y-6">
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase text-white tracking-widest leading-none">1. Admin Principal</p>
                                        <p className="text-[8px] font-bold text-zinc-400 leading-tight uppercase tracking-tighter">Acceso total. Único perfil con gestión de equipo y roles.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase text-white tracking-widest leading-none">2. Administrador</p>
                                        <p className="text-[8px] font-bold text-zinc-400 leading-tight uppercase tracking-tighter">Gestión operativa. Sin acceso a panel administrativo.</p>
                                    </div>
                                    <div className="space-y-1">
                                        <p className="text-[8px] font-black uppercase text-white tracking-widest leading-none">3. Ventas</p>
                                        <p className="text-[8px] font-bold text-zinc-400 leading-tight uppercase tracking-tighter">Acceso limitado. Solo visualización e inventario de stock.</p>
                                    </div>
                                </div>
                            </div>
                        </div>

                    </div>

                    <div className="lg:col-span-2 space-y-7 order-2 lg:order-1">
                        <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">
                                {userData._id === 'new' ? 'Crear Nuevo Perfil' : `Perfil: ${userData.firstName}`}
                            </h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <AccountInput label="Nombre" value={userData.firstName} onChange={(v) => setUserData({ ...userData, firstName: v })} />
                                <AccountInput label="Apellido" value={userData.lastName} onChange={(v) => setUserData({ ...userData, lastName: v })} />
                                <AccountInput label="Usuario" value={userData.username} onChange={(v) => setUserData({ ...userData, username: v })} />

                                <div className="flex flex-col space-y-3 text-left leading-none">
                                    <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 leading-none">Cargo / Rol</label>
                                    <AdminSoftSelect
                                        value={userData.role}
                                        onChange={(value) => setUserData({ ...userData, role: value })}
                                        options={[
                                            { value: 'Administrador Principal', label: 'Administrador Principal' },
                                            { value: 'Administrador', label: 'Administrador' },
                                            { value: 'Ventas', label: 'Ventas' },
                                        ]}
                                    />
                                </div>

                                <AccountInput label="Correo Electronico" value={userData.email} onChange={(v) => setUserData({ ...userData, email: v })} />
                                <AccountInput label="Teléfono" value={userData.phone} onChange={(v) => setUserData({ ...userData, phone: v })} />
                            </div>
                        </div>

                        <div className="bg-white rounded-[30px] border border-gray-100 p-6 space-y-5">
                            <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 border-b border-gray-50 pb-5 leading-none">Seguridad</h3>
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-x-6 gap-y-6">
                                <AccountInput label="Contraseña" type="password" value={userData.password} onChange={(v) => setUserData({ ...userData, password: v })} />
                                <AccountInput label="Confirmar" type="password" value={userData.confirmPassword} onChange={(v) => setUserData({ ...userData, confirmPassword: v })} />
                            </div>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase italic tracking-[0.1em]">
                                El cambio de contraseña es instantáneo tras guardar.
                            </p>
                        </div>
                    </div>

                </div>
            </main>
        </div>
    )
}

function AccountInput({ label, value, onChange, type = "text" }: { label: string; value: string; onChange: (v: string) => void; type?: string; }) {
    return (
        <div className="flex flex-col space-y-3 text-left leading-none">
            <label className="text-[8px] font-black uppercase tracking-[0.2em] text-zinc-400 ml-1 leading-none">{label}</label>
            <input
                type={type}
                value={value}
                onChange={(e) => onChange(e.target.value)}
                className="w-full h-[50px] bg-[#F7F8FA] border-none rounded-2xl px-5 text-[9px] font-black outline-none shadow-none focus:bg-zinc-100 transition-colors uppercase"
            />
        </div>
    )
}
