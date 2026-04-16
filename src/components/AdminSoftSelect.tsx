'use client'

import { useEffect, useRef, useState } from 'react'
import type { CSSProperties } from 'react'

type AdminSoftSelectOption = {
    label: string
    value: string
}

type AdminSoftSelectProps = {
    value: string
    onChange: (value: string) => void
    options: AdminSoftSelectOption[]
    disabled?: boolean
    compact?: boolean
    className?: string
}

export default function AdminSoftSelect({
    value,
    onChange,
    options,
    disabled = false,
    compact = false,
    className = '',
}: AdminSoftSelectProps) {
    const [isOpen, setIsOpen] = useState(false)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        window.addEventListener('mousedown', handlePointerDown)
        return () => window.removeEventListener('mousedown', handlePointerDown)
    }, [])

    const selected = options.find((option) => option.value === value)
    const displayLabel = selected?.label || options[0]?.label || 'Seleccionar...'

    return (
        <div className={`relative ${className}`.trim()} ref={containerRef}>
            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className={`w-full bg-[#F7F8FA] border border-gray-200 rounded-2xl px-4 sm:px-5 pr-11 text-left text-[10px] font-bold uppercase outline-none transition-colors ${compact ? 'min-h-[32px]' : 'min-h-[46px]'} ${disabled ? 'cursor-not-allowed opacity-50' : 'cursor-pointer hover:border-gray-300'}`}
                style={{
                    borderColor: isOpen ? '#a1a1aa' : undefined,
                } as CSSProperties}
            >
                <span className="block truncate">{displayLabel}</span>
            </button>

            <div className="absolute right-4 top-1/2 -translate-y-1/2 pointer-events-none text-zinc-400">
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
                </svg>
            </div>

            {isOpen && !disabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="max-h-64 overflow-y-auto py-2">
                        {options.map((option) => {
                            const isSelected = option.value === value

                            return (
                                <button
                                    key={option.value}
                                    type="button"
                                    onClick={() => {
                                        onChange(option.value)
                                        setIsOpen(false)
                                    }}
                                    className={`flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-bold uppercase transition-colors ${isSelected ? 'bg-[#F7F8FA] text-black' : 'text-zinc-600 hover:bg-[#F7F8FA]'}`}
                                >
                                    <span className="pr-4">{option.label}</span>
                                    {isSelected && <span className="sr-only">Seleccionado</span>}
                                </button>
                            )
                        })}
                    </div>
                </div>
            )}
        </div>
    )
}
