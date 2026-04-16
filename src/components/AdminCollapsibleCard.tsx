'use client'

import { useState } from 'react'

type AdminCollapsibleCardProps = {
    title: string
    children: React.ReactNode
    defaultOpen?: boolean
    className?: string
    summary?: string
    isOpen?: boolean
    onToggle?: () => void
}

export default function AdminCollapsibleCard({
    title,
    children,
    defaultOpen = true,
    className = '',
    summary,
    isOpen: controlledIsOpen,
    onToggle,
}: AdminCollapsibleCardProps) {
    const [internalIsOpen, setInternalIsOpen] = useState(defaultOpen)
    const isControlled = typeof controlledIsOpen === 'boolean'
    const isOpen = isControlled ? controlledIsOpen : internalIsOpen

    const handleToggle = () => {
        if (onToggle) {
            onToggle()
            return
        }

        setInternalIsOpen((prev) => !prev)
    }

    return (
        <div className={`bg-white rounded-[30px] border border-gray-100 p-7 shadow-none ${className}`.trim()}>
            <button
                type="button"
                onClick={handleToggle}
                className={`flex w-full items-center justify-between gap-4 text-left ${isOpen ? 'border-b border-gray-50 pb-5' : ''}`}
                aria-expanded={isOpen}
            >
                <div className="min-w-0 flex-1">
                    <h3 className="text-[10px] font-black uppercase tracking-widest text-zinc-700 leading-none">
                        {title}
                    </h3>
                    {summary && (
                        <p className="mt-2 text-[8px] font-bold uppercase tracking-tight text-zinc-400 leading-tight">
                            {summary}
                        </p>
                    )}
                </div>
                <span className="flex h-8 w-8 items-center justify-center rounded-full bg-[#F7F8FA] text-zinc-400">
                    <svg
                        className={`h-4 w-4 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                    >
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="3" d="M19 9l-7 7-7-7" />
                    </svg>
                </span>
            </button>

            {isOpen && (
                <div className="pt-5">
                    {children}
                </div>
            )}
        </div>
    )
}
