'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams, useRouter } from 'next/navigation'
import { client } from '@/sanity/lib/client'

export default function EditarAutoPage() {
    const params = useParams()
    const router = useRouter()
    
    const [loading, setLoading] = useState(true)
    const [car, setCar] = useState<any>(null)

    useEffect(() => {
        const fetchCar = async () => {
            const query = `*[_type == "car" && _id == $id][0]{ ... }`
            const data = await client.fetch(query, { id: params.id })
            if (data) setCar(data)
            setLoading(false)
        }
        if (params.id) fetchCar()
    }, [params.id])

    if (loading) return <div className="min-h-screen bg-[#FBFBFB]" />

    return (
        <div className="min-h-screen bg-[#F7F8FA] text-black font-sans antialiased">
            
            {/* HEADER ORIGINAL DASHBOARD */}
            <nav className="bg-white border-b border-gray-100 sticky top-0 z-50 h-20 flex items-center px-8 shadow-none">
                <div className="max-w-7xl mx-auto w-full flex justify-between items-center relative">
                    <Link href="/admin/dashboard" className="text-2xl font-black italic tracking-tighter uppercase flex items-center text-black">
                        VDL<span className="font-light text-zinc-700">MOTORS</span>
                    </Link>
                    <div className="flex items-center gap-3">
                        <div className="text-right hidden sm:block">
                            <p className="text-[11px] font-black uppercase tracking-widest leading-none text-black">Matías</p>
                            <p className="text-[8px] font-bold text-zinc-400 uppercase tracking-tighter mt-1">Admin</p>
                        </div>
                        <div className="w-8 h-8 bg-black rounded-full flex items-center justify-center text-white text-[10px] font-black shadow-lg">M</div>
                    </div>
                </div>
            </nav>

            <main className="max-w-7xl mx-auto px-8 py-12">
                {/* Aquí empezamos a construir el contenido nuevo */}
            </main>
        </div>
    )
}