'use client'

import { useRouter } from 'next/navigation'
import { useState } from 'react'

export default function HeroSearch() {
    const router = useRouter()
    const [value, setValue] = useState('')

    function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
        event.preventDefault()
        const term = value.trim()
        const target = term ? `/catalogo?search=${encodeURIComponent(term)}` : '/catalogo'
        router.push(target)
    }

    return (
        <form
            onSubmit={handleSubmit}
            role="search"
            className="bg-white p-1 rounded-xl flex max-w-xl mx-auto border border-gray-200 shadow-sm"
        >
            <label htmlFor="hero-search" className="sr-only">
                Buscar autos por marca o modelo
            </label>
            <input
                id="hero-search"
                type="search"
                value={value}
                onChange={(event) => setValue(event.target.value)}
                placeholder="Busca por marca o modelo..."
                className="flex-grow bg-transparent text-black py-3 px-4 outline-none text-sm font-medium placeholder:text-gray-400"
                autoComplete="off"
            />
            <button
                type="submit"
                className="text-white px-8 py-3 rounded-lg text-[11px] font-bold uppercase transition-colors"
                style={{ backgroundColor: 'var(--primary)' }}
            >
                Buscar
            </button>
        </form>
    )
}
