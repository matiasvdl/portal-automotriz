'use client'

import { createContext, useContext, ReactNode } from 'react'

/**
 * 1. Definimos la estructura de la Configuración del Sitio (siteConfig)
 * Aquí incluimos los campos legales, de navegación y de contacto.
 */
interface SiteConfig {
    siteName?: string
    footerDescription?: string
    footerTagline?: string
    whatsappNumber?: string;
    supportMessage?: string;
    termsAndConditions?: string
    lastLegalUpdate?: string
    maintenanceMode?: boolean
    whatsapp?: string
    email?: string
    address?: string
    navMenu?: Array<{ title: string; path: string }>
    footerLinks?: Array<{ title: string; path: string }>
}

/**
 * 2. Definimos la estructura de Apariencia (appearance)
 * Incluye la marca, el logo y los parámetros de financiamiento.
 */
interface AppearanceSettings {
    brandName?: string
    logo?: any // Se mantiene como 'any' por la complejidad del objeto de imagen de Sanity
    splitText?: boolean
    isJoined?: boolean
    minDepositPercent?: number
    minIncome?: number
    minWorkExperience?: string
}

/**
 * 3. Estructura global del contexto
 */
interface SettingsContextType {
    contact: {
        whatsapp: string
        email: string
        address: string
    }
    config: SiteConfig
    appearance: AppearanceSettings
}

const SettingsContext = createContext<SettingsContextType | undefined>(undefined)

/**
 * 4. El Provider ahora utiliza las interfaces definidas para validar los datos.
 */
export function SettingsProvider({
    children,
    config = {},      // Valor por defecto inicializado como objeto vacío
    appearance = {}   // Valor por defecto inicializado como objeto vacío
}: {
    children: ReactNode,
    config?: SiteConfig,
    appearance?: AppearanceSettings
}) {

    // Mapeamos los datos de contacto para un acceso más directo
    const value = {
        contact: {
            whatsapp: config?.whatsapp || '',
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

/**
 * Hook personalizado para consumir la configuración en cualquier componente.
 */
export const useSettings = () => {
    const context = useContext(SettingsContext)
    if (!context) throw new Error("useSettings debe usarse dentro de SettingsProvider")
    return context
}