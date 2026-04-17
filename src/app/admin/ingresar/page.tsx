'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { signIn } from 'next-auth/react'
import { useSettings } from '@/context/SettingsContext'
import { requestAdminPasswordRecovery } from '@/app/actions/contact'
import { resolveBrandLabel } from '@/lib/content-defaults'

export default function LoginPage() {
    const { config, appearance } = useSettings()
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [error, setError] = useState(false)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [showRecoveryForm, setShowRecoveryForm] = useState(false)
    const [recoveryIdentifier, setRecoveryIdentifier] = useState('')
    const [recoveryFullName, setRecoveryFullName] = useState('')
    const [recoveryContactEmail, setRecoveryContactEmail] = useState('')
    const [recoveryPhone, setRecoveryPhone] = useState('')
    const [recoveryMessage, setRecoveryMessage] = useState('')
    const [recoveryError, setRecoveryError] = useState('')
    const [isRecoverySubmitting, setIsRecoverySubmitting] = useState(false)
    const [recoveryNotice, setRecoveryNotice] = useState('')

    const companyName = 'VDL GROUP'
    const splitText = appearance?.splitText !== false
    const isJoined = appearance?.isJoined === true
    const companyFirstWord = companyName.split(' ')[0] || companyName
    const companyDisplayName = companyName.replace(/\s+/g, '')
    const companyRestWords = companyDisplayName.substring(companyFirstWord.length)
    const siteName = resolveBrandLabel(appearance, config)
    const siteFirstWord = siteName.split(' ')[0] || siteName
    const siteDisplayName = isJoined ? siteName.replace(/\s+/g, '') : siteName
    const siteRestWords = splitText
        ? (
            isJoined
                ? siteDisplayName.substring(siteFirstWord.length)
                : siteName.substring(siteFirstWord.length)
        )
        : ''

    useEffect(() => {
        if (error || recoveryNotice) {
            const timer = setTimeout(() => {
                setError(false)
                setRecoveryNotice('')
            }, 5000)
            return () => clearTimeout(timer)
        }
    }, [error, recoveryNotice])

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

    const handlePasswordRecovery = async () => {
        setIsRecoverySubmitting(true)
        setRecoveryError('')

        const result = await requestAdminPasswordRecovery({
            identifier: recoveryIdentifier || email,
            fullName: recoveryFullName,
            contactEmail: recoveryContactEmail,
            phone: recoveryPhone,
            message: recoveryMessage,
        })

        if (!result.success) {
            setRecoveryError(result.error || 'No se pudo enviar la solicitud.')
            setIsRecoverySubmitting(false)
            return
        }

        setRecoveryNotice(result.message || 'Solicitud enviada.')
        closeRecoveryScreen()
        setIsRecoverySubmitting(false)
    }

    const openRecoveryScreen = () => {
        setShowRecoveryForm(true)
        setRecoveryIdentifier(email)
        setRecoveryContactEmail(email)
        setRecoveryError('')
        setError(false)
    }

    const closeRecoveryScreen = () => {
        setShowRecoveryForm(false)
        setRecoveryIdentifier('')
        setRecoveryFullName('')
        setRecoveryContactEmail('')
        setRecoveryPhone('')
        setRecoveryMessage('')
        setRecoveryError('')
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
                    {!showRecoveryForm ? (
                        <>
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
                                            onClick={openRecoveryScreen}
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
                        </>
                    ) : (
                        <>
                            <header className="text-left space-y-4">


                                <div className="space-y-1 text-left">
                                    <h1 className="text-xl font-black uppercase tracking-tighter text-black leading-none">
                                        Recuperar Acceso
                                    </h1>
                                    <p className="text-[10px] font-bold text-zinc-500 uppercase tracking-[0.1em]">
                                        Si los datos son válidos, soporte recibirá la solicitud internamente.

                                    </p>
                                </div>
                            </header>

                            <div className="space-y-5">
                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                        Nombre Completo
                                    </label>
                                    <input
                                        type="text"
                                        value={recoveryFullName}
                                        onChange={(e) => {
                                            setRecoveryFullName(e.target.value)
                                            if (recoveryError) setRecoveryError('')
                                        }}
                                        placeholder="INGRESA TU NOMBRE COMPLETO"
                                        className="w-full bg-[#F7F7F7] border border-gray-200 px-4 py-3 rounded-xl text-[9px] font-black text-zinc-600 focus:outline-none focus:border-black uppercase placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                        Usuario o Correo
                                    </label>
                                    <input
                                        type="text"
                                        value={recoveryIdentifier}
                                        onChange={(e) => {
                                            setRecoveryIdentifier(e.target.value)
                                            if (recoveryError) setRecoveryError('')
                                        }}
                                        placeholder="INGRESA TU USUARIO O CORREO"
                                        className="w-full bg-[#F7F7F7] border border-gray-200 px-4 py-3 rounded-xl text-[9px] font-black text-zinc-600 focus:outline-none focus:border-black uppercase placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                        Correo de Contacto
                                    </label>
                                    <input
                                        type="email"
                                        value={recoveryContactEmail}
                                        onChange={(e) => {
                                            setRecoveryContactEmail(e.target.value)
                                            if (recoveryError) setRecoveryError('')
                                        }}
                                        placeholder="INGRESA TU CORREO DE CONTACTO"
                                        className="w-full bg-[#F7F7F7] border border-gray-200 px-4 py-3 rounded-xl text-[9px] font-black text-zinc-600 focus:outline-none focus:border-black placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                        Teléfono
                                    </label>
                                    <input
                                        type="text"
                                        value={recoveryPhone}
                                        onChange={(e) => {
                                            setRecoveryPhone(e.target.value)
                                            if (recoveryError) setRecoveryError('')
                                        }}
                                        placeholder="INGRESA TU TELÉFONO"
                                        className="w-full bg-[#F7F7F7] border border-gray-200 px-4 py-3 rounded-xl text-[9px] font-black text-zinc-600 focus:outline-none focus:border-black uppercase placeholder:text-zinc-400"
                                    />
                                </div>

                                <div className="space-y-1">
                                    <label className="text-[9px] font-black uppercase tracking-widest text-zinc-500 ml-1 block text-left">
                                        Detalle
                                    </label>
                                    <textarea
                                        value={recoveryMessage}
                                        onChange={(e) => {
                                            setRecoveryMessage(e.target.value)
                                            if (recoveryError) setRecoveryError('')
                                        }}
                                        rows={4}
                                        placeholder="INDICA ALGÚN DATO QUE AYUDE A VALIDAR TU SOLICITUD"
                                        className="w-full bg-[#F7F7F7] border border-gray-200 px-4 py-3 rounded-2xl text-[9px] font-black text-zinc-600 focus:outline-none focus:border-black resize-none placeholder:text-zinc-400"
                                    />
                                </div>



                                <button
                                    type="button"
                                    onClick={() => void handlePasswordRecovery()}
                                    disabled={isRecoverySubmitting}
                                    className="w-full bg-black text-white text-[9px] font-black uppercase tracking-[0.25em] py-3.5 rounded-xl hover:bg-zinc-950 shadow-xl shadow-black/10 disabled:bg-zinc-800 disabled:cursor-not-allowed"
                                >
                                    {isRecoverySubmitting ? 'ENVIANDO...' : 'SOLICITAR RECUPERACIÓN'}
                                </button>

                                <div className="flex justify-center pt-1">
                                    <button
                                        type="button"
                                        onClick={closeRecoveryScreen}
                                        className="text-[8px] font-bold text-zinc-400 uppercase tracking-widest hover:text-black transition-colors"
                                    >
                                        Volver a Ingresar
                                    </button>
                                </div>

                                {recoveryError && (
                                    <p className="text-[8px] font-bold uppercase tracking-tight text-red-500 leading-tight text-left">
                                        {recoveryError}
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>

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

                {recoveryNotice && (
                    <div className="fixed bottom-6 right-6 bg-white border border-gray-100 p-4 rounded-xl shadow-[0_10px_40px_rgba(0,0,0,0.06)] flex items-center gap-4 z-[200]">
                        <div className="w-1.5 h-1.5 bg-emerald-500 rounded-full"></div>
                        <div className="flex flex-col justify-center text-left">
                            <p className="text-[10px] font-black uppercase tracking-widest text-black leading-none">
                                Solicitud enviada
                            </p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-[4px] leading-none">
                                {recoveryNotice}
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
