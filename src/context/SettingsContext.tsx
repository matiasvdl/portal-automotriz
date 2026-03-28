'use client'

import { createContext, useContext, useEffect, useState, ReactNode } from 'react'
import { client } from '@/sanity/lib/client'

interface SettingsContextType {
    contact: {
        whatsapp: string
        instagram: string
        facebook: string
        email: string
        address: string
    }
    loading: boolean
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

export function SettingsProvider({ children }: { children: ReactNode }) {
    const [contact, setContact] = useState({
        whatsapp: '',
        instagram: '',
        facebook: '',
        email: '',
        address: ''
    })
    const [loading, setLoading] = useState(true)

    useEffect(() => {
        const fetchSettings = async () => {
            try {
                const data = await client.fetch(`*[_type == "contactSettings"][0]`)
                if (data) {
                    setContact({
                        whatsapp: data.whatsapp || '',
                        instagram: data.instagram || '',
                        facebook: data.facebook || '',
                        email: data.email || '',
                        address: data.address || ''
                    })
                }
            } catch (error) {
                console.error("Error cargando configuración:", error)
            } finally {
                setLoading(false)
            }
        }
        fetchSettings()
    }, [])

    return (
        <SettingsContext.Provider value={{ contact, loading }}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) throw new Error("useSettings debe usarse dentro de SettingsProvider")
    return context
}