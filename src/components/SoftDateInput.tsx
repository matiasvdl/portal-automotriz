'use client'

import { useEffect, useMemo, useRef, useState } from 'react'
import { CalendarDays, ChevronLeft, ChevronRight } from 'lucide-react'

type SoftDateInputProps = {
    value: string
    onChange: (value: string) => void
    placeholder?: string
    variant?: 'public' | 'admin' | 'adminCompact'
    primaryColor?: string
}

const DAY_LABELS = ['lu', 'ma', 'mi', 'ju', 'vi', 'sa', 'do']

function parseIsoDate(value: string) {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value)) {
        return null
    }

    const [year, month, day] = value.split('-').map(Number)
    return new Date(year, month - 1, day, 12)
}

function formatIsoDate(date: Date) {
    const year = date.getFullYear()
    const month = `${date.getMonth() + 1}`.padStart(2, '0')
    const day = `${date.getDate()}`.padStart(2, '0')

    return `${year}-${month}-${day}`
}

function formatDisplayDate(value: string) {
    const parsedDate = parseIsoDate(value)

    if (!parsedDate) {
        return ''
    }

    return new Intl.DateTimeFormat('es-CL', {
        day: '2-digit',
        month: '2-digit',
        year: 'numeric',
    }).format(parsedDate)
}

function getMonthMatrix(currentMonth: Date) {
    const year = currentMonth.getFullYear()
    const month = currentMonth.getMonth()
    const firstDay = new Date(year, month, 1, 12)
    const startOffset = (firstDay.getDay() + 6) % 7
    const startDate = new Date(year, month, 1 - startOffset, 12)

    return Array.from({ length: 42 }, (_, index) => {
        const day = new Date(startDate)
        day.setDate(startDate.getDate() + index)
        return day
    })
}

export default function SoftDateInput({
    value,
    onChange,
    placeholder = 'Seleccionar fecha',
    variant = 'admin',
    primaryColor = '#000000',
}: SoftDateInputProps) {
    const containerRef = useRef<HTMLDivElement>(null)
    const selectedDate = useMemo(() => parseIsoDate(value), [value])
    const [isOpen, setIsOpen] = useState(false)
    const [currentMonth, setCurrentMonth] = useState(() => selectedDate ?? new Date())

    useEffect(() => {
        const handlePointerDown = (event: MouseEvent) => {
            if (!containerRef.current?.contains(event.target as Node)) {
                setIsOpen(false)
            }
        }

        const handleEscape = (event: KeyboardEvent) => {
            if (event.key === 'Escape') {
                setIsOpen(false)
            }
        }

        window.addEventListener('mousedown', handlePointerDown)
        window.addEventListener('keydown', handleEscape)

        return () => {
            window.removeEventListener('mousedown', handlePointerDown)
            window.removeEventListener('keydown', handleEscape)
        }
    }, [])

    const calendarDays = useMemo(() => getMonthMatrix(currentMonth), [currentMonth])
    const monthLabel = new Intl.DateTimeFormat('es-CL', {
        month: 'long',
        year: 'numeric',
    }).format(currentMonth)

    const isCompact = variant === 'adminCompact'
    const buttonClassName = variant === 'public'
        ? 'w-full h-[42px] bg-[#F7F8FA] border-none rounded-xl px-5 pr-12 text-[11px] font-bold outline-none text-left leading-none shadow-none'
        : isCompact
            ? 'w-full h-8 bg-gray-50 border border-transparent rounded-lg px-2 pr-9 text-[10px] font-bold outline-none text-left leading-none shadow-none'
            : 'w-full h-[45px] bg-[#F7F8FA] border-none rounded-xl px-5 pr-12 text-[11px] font-bold outline-none text-left leading-none shadow-none'

    const panelClassName = variant === 'public'
        ? 'absolute left-0 top-[calc(100%+8px)] z-30 w-[260px] rounded-2xl border border-gray-200 bg-white p-2.5 shadow-none'
        : isCompact
            ? 'absolute left-0 top-[calc(100%+8px)] z-30 w-[248px] rounded-2xl border border-gray-200 bg-white p-2.5 shadow-none'
            : 'absolute left-0 top-[calc(100%+8px)] z-30 w-[272px] rounded-2xl border border-gray-200 bg-white p-2.5 shadow-none'

    return (
        <div className="relative" ref={containerRef}>
            <button
                type="button"
                onClick={() => {
                    if (!isOpen && selectedDate) {
                        setCurrentMonth(selectedDate)
                    }
                    setIsOpen((prev) => !prev)
                }}
                className={buttonClassName}
                style={{
                    borderColor: isOpen ? `${primaryColor}33` : undefined,
                    boxShadow: 'none',
                }}
            >
                <span className={value ? 'text-black' : 'text-zinc-300 font-normal'}>
                    {formatDisplayDate(value) || placeholder}
                </span>
            </button>

            <div className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-zinc-400">
                <CalendarDays className={isCompact ? 'h-3.5 w-3.5' : 'h-4 w-4'} strokeWidth={2} />
            </div>

            {isOpen && (
                <div className={panelClassName}>
                    <div className="mb-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() - 1, 1, 12))}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-[#F7F8FA] hover:text-black"
                        >
                            <ChevronLeft className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                        <p className="text-[10px] font-black capitalize text-black">{monthLabel}</p>
                        <button
                            type="button"
                            onClick={() => setCurrentMonth((prev) => new Date(prev.getFullYear(), prev.getMonth() + 1, 1, 12))}
                            className="flex h-7 w-7 items-center justify-center rounded-full text-zinc-500 transition-colors hover:bg-[#F7F8FA] hover:text-black"
                        >
                            <ChevronRight className="h-3.5 w-3.5" strokeWidth={2.5} />
                        </button>
                    </div>

                    <div className="mb-1.5 grid grid-cols-7 gap-1">
                        {DAY_LABELS.map((day) => (
                            <span key={day} className="py-0.5 text-center text-[8px] font-bold uppercase text-zinc-400">
                                {day}
                            </span>
                        ))}
                    </div>

                    <div className="grid grid-cols-7 gap-1">
                        {calendarDays.map((day) => {
                            const isoValue = formatIsoDate(day)
                            const isSelected = isoValue === value
                            const isCurrentMonth = day.getMonth() === currentMonth.getMonth()

                            return (
                                <button
                                    key={isoValue}
                                    type="button"
                                    onClick={() => {
                                        onChange(isoValue)
                                        setIsOpen(false)
                                    }}
                                    className={`h-7 rounded-lg text-[9px] font-bold transition-colors ${
                                        isSelected
                                            ? 'text-white'
                                            : isCurrentMonth
                                                ? 'text-black hover:bg-[#F7F8FA]'
                                                : 'text-zinc-300 hover:bg-[#F7F8FA]'
                                    }`}
                                    style={{
                                        backgroundColor: isSelected ? primaryColor : undefined,
                                    }}
                                >
                                    {day.getDate()}
                                </button>
                            )
                        })}
                    </div>

                    <div className="mt-2 flex items-center justify-between">
                        <button
                            type="button"
                            onClick={() => {
                                onChange('')
                                setIsOpen(false)
                            }}
                            className="text-[9px] font-bold text-zinc-400 transition-colors hover:text-black"
                        >
                            Borrar
                        </button>
                        <button
                            type="button"
                            onClick={() => {
                                const today = new Date()
                                const todayIso = formatIsoDate(today)
                                onChange(todayIso)
                                setCurrentMonth(today)
                                setIsOpen(false)
                            }}
                            className="text-[9px] font-bold transition-colors"
                            style={{ color: primaryColor }}
                        >
                            Hoy
                        </button>
                    </div>
                </div>
            )}
        </div>
    )
}
