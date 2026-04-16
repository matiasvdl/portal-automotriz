'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSettings } from '@/context/SettingsContext'

export default function LoginPage() {
    const { config, appearance } = useSettings()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [showSupportToast, setShowSupportToast] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)

    const companyName = 'VDL GROUP'
    const splitText = appearance?.splitText !== false
    const isJoined = appearance?.isJoined === true
    const companyFirstWord = companyName.split(' ')[0] || companyName
    const companyDisplayName = companyName.replace(/\s+/g, '')
    const companyRestWords = companyDisplayName.substring(companyFirstWord.length)
    const siteName = config?.siteName || appearance?.brandName || ''
    const siteFirstWord = siteName.split(' ')[0] || siteName
    const siteDisplayName = isJoined ? siteName.replace(/\s+/g, '') : siteName
    const siteRestWords = splitText
        ? (
            isJoined
                ? siteDisplayName.substring(siteFirstWord.length)
                : siteName.substring(siteFirstWord.length)
        )
        : ''

    const whatsappNumber = config?.whatsappNumber || ''
    const whatsappMessage = encodeURIComponent(
        config?.supportMessage || 'Hola, olvidé mi contraseña del panel y necesito ayuda para recuperar el acceso.'
    )

    useEffect(() => {
        if (error || showSupportToast) {
            const timer = setTimeout(() => {
                setError(false)
                setShowSupportToast(false)
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [error, showSupportToast])

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault()
        setIsSubmitting(true)
        setError(false)

        const result = await signIn('credentials', {
            username: email,
            password,
            redirect: false,
        })

        if (result?.error) {
            setError(true)
            setIsSubmitting(false)
        } else {
            window.location.href = '/admin/dashboard'
        }
    }

    return (
        <div className="fixed inset-0 min-h-screen flex antialiased font-sans z-[100] bg-white overflow-hidden">
            <div className="hidden lg:flex lg:w-[60%] h-full bg-black relative flex-col p-8 justify-between">
                <Link href="/" className="z-20 inline-block">
                    <p className="text-2xl font-black tracking-tighter uppercase text-white italic leading-none text-left">
                        {companyFirstWord}<span className="font-light text-zinc-400">{companyRestWords}</span>
                    </p>
                </Link>
            </div>

            <div className="w-full lg:w-[40%] h-full flex items-center justify-center bg-white relative">
                <div className="max-w-[340px] w-full px-6 lg:px-0 space-y-5">
                    <header className="text-left space-y-4">
                        <Link href="/" className="z-20 inline-block">
                            <p className="text-2xl font-black tracking-tighter uppercase text-black italic leading-none">
                                {splitText ? (
                                    <>
                                        {siteFirstWord}
                                        <span className={`font-light text-zinc-700${isJoined ? '' : ''}`}>
                                            {siteRestWords}
                                        </span>
                                    </>
                                ) : (
                                    siteDisplayName
                                )}
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
                                onChange={(e) => { setEmail(e.target.value); if (error) setError(false) }}
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
                                onChange={(e) => { setPassword(e.target.value); if (error) setError(false) }}
                                placeholder="••••••••"
                                required
                                className={`w-full bg-[#F7F7F7] border ${error ? 'border-red-500/50' : 'border-gray-200'} px-4 py-3 rounded-xl text-[11px] font-black text-zinc-600 focus:outline-none focus:border-black placeholder:text-zinc-400`}
                            />

                            <div className="flex justify-end pr-1 pt-0">
                                <button
                                    type="button"
                                    onClick={() => { setShowSupportToast(true); setError(false) }}
                                    className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors"
                                >
                                    ¿Olvidaste tu contraseña?
                                </button>
                            </div>
                        </div>

                        <button
                            type="submit"
                            disabled={isSubmitting}
                            className="w-full bg-black text-white text-[9px] font-black uppercase tracking-[0.25em] py-3.5 rounded-xl hover:bg-zinc-950 mt-0 shadow-xl shadow-black/10 disabled:bg-zinc-800 disabled:cursor-not-allowed"
                        >
                            {isSubmitting ? 'VERIFICANDO...' : 'Ingresar'}
                        </button>
                    </form>
                </div>

                {showSupportToast && whatsappNumber && (
                    <a
                        href={`https://wa.me/${whatsappNumber}?text=${whatsappMessage}`}
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

                <div className="absolute bottom-6 right-7 z-18">
                    <p className="text-[7px] font-bold text-zinc-500 uppercase tracking-[0.2em]">
                        © VDL GROUP SpA
                    </p>
                </div>
            </div>
        </div>
    )
}
