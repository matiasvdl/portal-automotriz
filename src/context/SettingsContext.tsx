'use client'

import { createContext, useContext, ReactNode } from 'react'

// 1. Definimos qué datos va a repartir el contexto a todo el sitio
interface SettingsContextType {
    contact: {
        whatsapp: string
        instagram: string
        facebook: string
        email: string
        address: string
    }
    config: any      // Aquí viven los menús y SEO
    appearance: any  // Aquí vive el LOGO y el nombre de la marca (VDL GROUP)
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

// 2. El Provider ahora recibe config y appearance como PROPS desde el Layout
export function SettingsProvider({
    children,
    config,
    appearance
}: {
    children: ReactNode,
    config: any,
    appearance: any
}) {

    // Ya no necesitamos useEffect ni fetch aquí, porque los datos 
    // vienen listos desde el servidor (Layout)

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