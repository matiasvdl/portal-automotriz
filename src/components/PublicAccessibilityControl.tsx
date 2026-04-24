'use client'

import { useEffect, useMemo, useState } from 'react'
import { useSettings } from '@/context/SettingsContext'
import { resolveAccessibilityScale } from '@/lib/content-defaults'

const STORAGE_KEY = 'public-accessibility-scale-multiplier-v1'
const MIN_MULTIPLIER = 1
const MAX_MULTIPLIER = 1.5
const STEP = 0.1

function clampMultiplier(value: number) {
    if (!Number.isFinite(value)) return MIN_MULTIPLIER
    return Math.min(MAX_MULTIPLIER, Math.max(MIN_MULTIPLIER, Math.round(value * 100) / 100))
}

export default function PublicAccessibilityControl() {
    const { appearance } = useSettings()
    const baseScale = useMemo(() => resolveAccessibilityScale(appearance?.accessibilityScale), [appearance?.accessibilityScale])
    const [isOpen, setIsOpen] = useState(true)
    const [multiplier, setMultiplier] = useState(() => {
        if (typeof window === 'undefined') return MIN_MULTIPLIER
        try {
            const raw = window.localStorage.getItem(STORAGE_KEY)
            return raw ? clampMultiplier(Number(raw)) : MIN_MULTIPLIER
        } catch {
            return MIN_MULTIPLIER
        }
    })

    useEffect(() => {
        const effectiveScale = Math.round(baseScale * multiplier * 100) / 100
        document.documentElement.style.fontSize = `${effectiveScale * 100}%`

        try {
            window.localStorage.setItem(STORAGE_KEY, String(multiplier))
        } catch {
            // Ignoramos errores de persistencia
        }

        return () => {
            document.documentElement.style.fontSize = `${baseScale * 100}%`
        }
    }, [baseScale, multiplier])

    const percentage = Math.round(multiplier * 100)

    return (
        <div className="fixed bottom-4 left-4 z-[70] flex items-end gap-2">
            <button
                type="button"
                onClick={() => setIsOpen((prev) => !prev)}
                className="relative inline-flex h-12 w-12 items-center justify-center rounded-full border border-gray-200 bg-white text-zinc-700"
                aria-label={isOpen ? 'Ocultar accesibilidad' : 'Mostrar accesibilidad'}
            >
                <span className="text-[12px] font-black tracking-tight leading-none">Aa</span>
            </button>

            {isOpen ? (
                <div className="flex items-center gap-1 rounded-xl border border-gray-200 bg-white px-2 py-1.5">
                    <button
                        type="button"
                        onClick={() => setMultiplier((prev) => clampMultiplier(prev - STEP))}
                        className="h-7 w-7 rounded-md border border-zinc-200 text-[10px] font-black text-zinc-700 hover:border-black hover:text-black"
                        aria-label="Reducir tamaño de texto"
                    >
                        A-
                    </button>
                    <span className="min-w-[38px] text-center text-[9px] font-black tracking-widest text-zinc-700">
                        {percentage}%
                    </span>
                    <button
                        type="button"
                        onClick={() => setMultiplier((prev) => clampMultiplier(prev + STEP))}
                        className="h-7 w-7 rounded-md border border-zinc-200 text-[10px] font-black text-zinc-700 hover:border-black hover:text-black"
                        aria-label="Aumentar tamaño de texto"
                    >
                        A+
                    </button>
                    <button
                        type="button"
                        onClick={() => setMultiplier(MIN_MULTIPLIER)}
                        className="h-7 rounded-md border border-zinc-200 px-2 text-[9px] font-black uppercase tracking-widest text-zinc-700 hover:border-black hover:text-black"
                        aria-label="Restablecer tamaño de texto"
                    >
                        Reset
                    </button>
                    <button
                        type="button"
                        onClick={() => setIsOpen(false)}
                        className="flex h-7 w-7 items-center justify-center rounded-md border border-zinc-200 text-zinc-500 hover:border-black hover:text-black"
                        aria-label="Cerrar panel de accesibilidad"
                    >
                        <svg
                            aria-hidden="true"
                            className="h-3.5 w-3.5"
                            viewBox="0 0 24 24"
                            fill="none"
                            stroke="currentColor"
                            strokeWidth="2.5"
                            strokeLinecap="round"
                        >
                            <path d="M6 6l12 12M18 6L6 18" />
                        </svg>
                    </button>
                </div>
            ) : null}
        </div>
    )
}