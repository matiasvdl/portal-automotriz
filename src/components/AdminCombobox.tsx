'use client'

import { useEffect, useMemo, useRef, useState } from 'react'

type AdminComboboxOption = {
    label: string
    value: string
}

type AdminComboboxProps = {
    value: string
    onChange: (value: string) => void
    options: AdminComboboxOption[]
    placeholder?: string
    disabled?: boolean
    className?: string
}

export default function AdminCombobox({
    value,
    onChange,
    options,
    placeholder = 'Escribe o selecciona...',
    disabled = false,
    className = '',
}: AdminComboboxProps) {
    const [isOpen, setIsOpen] = useState(false)
    const [query, setQuery] = useState(value)
    const containerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        setQuery(value)
    }, [value])

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        window.addEventListener('mousedown', handlePointerDown)
        return () => window.removeEventListener('mousedown', handlePointerDown)
    }, [])

    const filteredOptions = useMemo(() => {
        const normalizedQuery = query.trim().toLowerCase()

        if (!normalizedQuery) {
            return options
        }

        return options.filter((option) =>
            option.label.toLowerCase().includes(normalizedQuery) ||
            option.value.toLowerCase().includes(normalizedQuery)
        )
    }, [options, query])

    return (
        <div className={`relative ${className}`.trim()} ref={containerRef}>
            <input
                type="text"
                value={query}
                disabled={disabled}
                placeholder={placeholder}
                onFocus={() => !disabled && setIsOpen(true)}
                onChange={(event) => {
                    const nextValue = event.target.value
                    setQuery(nextValue)
                    onChange(nextValue)
                    if (!disabled) {
                        setIsOpen(true)
                    }
                }}
                className={`w-full h-[42px] bg-[#F7F8FA] border border-gray-200 rounded-xl px-5 pr-11 text-[11px] font-bold outline-none transition-colors ${disabled ? 'cursor-not-allowed opacity-50' : 'focus:border-zinc-400'}`}
            />

            <button
                type="button"
                disabled={disabled}
                onClick={() => !disabled && setIsOpen((prev) => !prev)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400"
                aria-label="Mostrar opciones"
            >
                <svg className={`w-4 h-4 transition-transform ${isOpen ? 'rotate-180' : ''}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="4" d="M19 9l-7 7-7-7" />
                </svg>
            </button>

            {isOpen && !disabled && (
                <div className="absolute left-0 right-0 top-[calc(100%+8px)] z-30 overflow-hidden rounded-2xl border border-gray-200 bg-white">
                    <div className="max-h-60 overflow-y-auto py-2 no-scrollbar">
                        {filteredOptions.length > 0 ? (
                            filteredOptions.map((option) => {
                                const isSelected = option.value === value

                                return (
                                    <button
                                        key={option.value}
                                        type="button"
                                        onClick={() => {
                                            onChange(option.value)
                                            setQuery(option.label)
                                            setIsOpen(false)
                                        }}
                                        className={`flex w-full items-center justify-between px-4 py-3 text-left text-[10px] font-bold uppercase transition-colors ${isSelected ? 'bg-[#F7F8FA] text-black' : 'text-zinc-600 hover:bg-[#F7F8FA]'}`}
                                    >
                                        <span className="pr-4">{option.label}</span>
                                        {isSelected && <span className="sr-only">Seleccionado</span>}
                                    </button>
                                )
                            })
                        ) : (
                            <div className="px-4 py-3 text-[10px] font-bold uppercase text-zinc-400">
                                Sin coincidencias
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    )
}
