'use client'

import { createContext, useContext, ReactNode } from 'react'

// 1. Definimos la estructura del contexto
interface SettingsContextType {
    contact: {
        whatsapp: string
        instagram: string
        facebook: string
        email: string
        address: string
    }
    config: any
    appearance: any
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// 2. El Provider ahora tiene props OPCIONALES (con el ?)
export function SettingsProvider({
    children,
    config = {},      // Valor por defecto si no viene nada
    appearance = {}   // Valor por defecto si no viene nada
}: {
    children: ReactNode,
    config?: any,     //
    appearance?: any  //
}) {

    const value = {
        contact: {
            whatsapp: config?.whatsapp || '',
            instagram: config?.instagram || '',
            facebook: config?.facebook || '',
            email: config?.email || '',
            address: config?.address || ''
        },
        config,
        appearance
    }

    return (
        <SettingsContext.Provider value={value}>
            {children}
        </SettingsContext.Provider>
    )
}

export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) throw new Error("useSettings debe usarse dentro de SettingsProvider")
    return context
}