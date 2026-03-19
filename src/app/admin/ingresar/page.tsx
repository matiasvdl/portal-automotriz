'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'

/**
 * PÁGINA DE ACCESO MINIMALISTA PREMIUM - VERSIÓN SPLIT FINAL
 * Ajuste: Redirección directa al panel de administración tras validar.
 */
export default function LoginPage() {
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const router = useRouter()

    const ADMIN_EMAIL = "admin@vdlmotors.cl"
    const ADMIN_PASSWORD = "vdlmotors"

    const handleLogin = (e: React.FormEvent) => {
        e.preventDefault()
        if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
            setError(false)
            // Redirección directa y automática
            router.push('/admin/dashboard')
        } else {
            setError(true)
        }
    }

    return (
        <div className="fixed inset-0 min-h-screen flex antialiased font-sans z-[100] bg-white">

            {/* LADO IZQUIERDO: NEGRO SÓLIDO (60%) */}
            <div className="hidden lg:flex lg:w-[60%] h-full bg-black relative flex-col p-8 justify-between">
                <Link href="/" className="z-20 inline-block transition-opacity hover:opacity-100">
                    <p className="text-2xl font-black tracking-tighter uppercase text-white italic leading-none">
                        VDL<span className="font-light text-zinc-500">MOTORS</span>
                    </p>
                </Link>

                {/* Logo Next sutil en la esquina inferior */}
                <div className="w-10 h-10 rounded-full border border-zinc-800 flex items-center justify-center bg-zinc-950">
                    <span className="text-white font-black text-lg italic">N</span>
                </div>
            </div>

            {/* LADO DERECHO: FORMULARIO (40%) */}
            <div className="w-full lg:w-[40%] h-full flex items-center justify-center bg-white relative">

                <div className="max-w-[340px] w-full px-0 space-y-5">
                    <header className="text-center lg:text-left">
                        <div className="space-y-2">
                            <h1 className="text-xl font-black uppercase tracking-tighter text-black italic leading-none">
                                Panel Administrativo
                            </h1>
                            <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                                Ingresa tus credenciales para continuar
                            </p>
                        </div>
                    </header>

                    <form onSubmit={handleLogin} className="space-y-5">
                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block">
                                Usuario o Correo
                            </label>
                            <input
                                type="text"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); if (error) setError(false); }}
                                placeholder="Ingrese su correo o usuario"
                                required
                                className="w-full bg-[#F7F7F7] border border-gray-200 px-6 py-3 rounded-xl text-[11px] font-black text-zinc-600 focus:outline-none focus:border-black transition-colors placeholder:text-zinc-400"
                            />
                        </div>

                        <div className="space-y-1">
                            <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block">
                                Contraseña
                            </label>
                            <input
                                type="password"
                                value={password}
                                onChange={(e) => { setPassword(e.target.value); if (error) setError(false); }}
                                placeholder="••••••••"
                                required
                                className={`w-full bg-[#F7F7F7] border ${error ? 'border-red-500' : 'border-gray-200'} px-6 py-3 rounded-xl text-[11px] font-black text-zinc-600 focus:outline-none focus:border-black transition-colors placeholder:text-zinc-400 placeholder:normal-case`}
                            />
                            {error && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1 animate-pulse italic mt-2 text-center">Credenciales Incorrectas</p>}
                        </div>

                        <button
                            type="submit"
                            className="w-full bg-black text-white text-[9px] font-black uppercase tracking-[0.25em] py-3.5 rounded-xl hover:bg-zinc-800 transition-colors active:scale-[0.98] mt-2 shadow-xl shadow-black/5"
                        >
                            Ingresar
                        </button>
                    </form>
                </div>

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