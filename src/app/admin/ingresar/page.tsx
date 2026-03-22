'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [showSupportToast, setShowSupportToast] = useState(false)
    const router = useRouter()

    const ADMIN_EMAIL = "admin@vdlmotors.cl"
    const ADMIN_PASSWORD = "vdlmotors"

    const WHATSAPP_NUMBER = "569XXXXXXXX"
    const WHATSAPP_MESSAGE = encodeURIComponent("Hola, olvidé mi contraseña del Panel VDL y necesito ayuda para recuperar el acceso.");

    useEffect(() => {
        if (error || showSupportToast) {
            const timer = setTimeout(() => {
                setError(false)
                setShowSupportToast(false)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [error, showSupportToast])

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            setError(false)
            router.push('/admin/dashboard')
        } else {
            setError(true)
            setShowSupportToast(false)
        }
    }

    return (
        <div className="fixed inset-0 min-h-screen flex antialiased font-sans z-[100] bg-white overflow-hidden">

            {/* LADO IZQUIERDO: CORPORATIVO */}
            <div className="hidden lg:flex lg:w-[60%] h-full bg-black relative flex-col p-8 justify-between">
                <Link href="/" className="z-20 inline-block">
                    <p className="text-2xl font-black tracking-tighter uppercase text-white italic leading-none text-left">
                        VDL<span className="font-light text-zinc-400">GROUP</span>
                    </p>
                </Link>
            </div>

            {/* LADO DERECHO: FORMULARIO */}
            <div className="w-full lg:w-[40%] h-full flex items-center justify-center bg-white relative">

                <div className="max-w-[340px] w-full px-6 lg:px-0 space-y-5">
                    <header className="text-left space-y-4">
                        <Link href="/" className="z-20 inline-block">
                            <p className="text-2xl font-black tracking-tighter uppercase text-black italic leading-none">
                                VDL<span className="font-light text-zinc-700">MOTORS</span>
                            </p>
                        </Link>

                        <div className="space-y-1 text-left">
                            <h1 className="text-xl font-black uppercase tracking-tighter text-black leading-none">
                                Panel Administrativo
                            </h1>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>
                    </header>

                    <form onSubmit={handleLogin} noValidate className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                Usuario o Correo
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (error) setError(false); }}
                                placeholder="INGRESE SU CORREO O USUARIO"
                                required
                                className="w-full bg-[#F7F7F7] border border-gray-200 px-4 py-3 rounded-xl text-[9px] font-black text-zinc-600 focus:outline-none focus:border-black uppercase placeholder:text-zinc-400"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (error) setError(false); }}
                                placeholder="••••••••"
                                required
                                className={`w-full bg-[#F7F7F7] border ${error ? 'border-red-500/50' : 'border-gray-200'} px-4 py-3 rounded-xl text-[11px] font-black text-zinc-600 focus:outline-none focus:border-black placeholder:text-zinc-400`}
                            />

                            <div className="flex justify-end pr-1 pt-0">
                                <button
                                    type="button"
                                    onClick={() => { setShowSupportToast(true); setError(false); }}
                                    className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white text-[9px] font-black uppercase tracking-[0.25em] py-3.5 rounded-xl hover:bg-zinc-950 mt-0 shadow-xl shadow-black/10"
                        >
                            Ingresar
                        </button>
                    </form>
                </div>

                {/* --- NOTIFICACIÓN DE SOPORTE (ESTÁTICA) --- */}
                {showSupportToast && (
                    <a
                        href={`https://wa.me/${WHATSAPP_NUMBER}?text=${WHATSAPP_MESSAGE}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="fixed bottom-6 right-6 bg-white border border-zinc-100 px-5 py-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex items-center gap-4 z-[200]"
                    >
                        <div className="w-2 h-2 bg-green-500 rounded-full border border-white"></div>
                        <div className="flex flex-col justify-center text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black leading-none">
                                ¿Necesitas ayuda?
                            </p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-[4px] leading-none">
                                Haz clic aquí para contactar a soporte
                            </p>
                        </div>
                    </a>
                )}

                {/* --- TOAST DE ERROR (ESTÁTICO) --- */}
                {error && (
                    <div className="fixed bottom-6 right-6 bg-white border border-gray-100 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex items-center gap-4 z-[200]">
                        <div className="w-1.5 h-1.5 bg-red-500 rounded-full"></div>
                        <div className="flex flex-col justify-center text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black leading-none">
                                Error de acceso
                            </p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-[4px] leading-none">
                                Credenciales incorrectas
                            </p>
                        </div>
                    </div>
                )}

                {/* Copyright - Gris más definido (zinc-500) */}
                <div className="absolute bottom-6 right-7 z-18">
                    <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        © VDL Group SpA
                    </p>
                </div>
            </div>
        </div>
    )
}