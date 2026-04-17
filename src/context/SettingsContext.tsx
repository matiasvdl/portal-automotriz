'use client'

import { createContext, useContext, ReactNode } from 'react'

interface SanityImageLike {
    asset?: {
        _ref?: string
        _type?: string
    }
}

/**
 * 1. Definimos la estructura de la Configuración del Sitio (siteConfig)
 * Aquí incluimos los campos legales, de navegación y de soporte.
 * Nota: El 'hero' fue movido a AppearanceSettings.
 */
interface SiteConfig {
    siteName?: string
    footerDescription?: string
    footerTagline?: string
    branchesPageEnabled?: boolean
    whatsappNumber?: string;
    supportMessage?: string;
    termsAndConditions?: string
    lastLegalUpdate?: string
    maintenanceMode?: boolean
    whatsapp?: string
    email?: string
    address?: string
    defaultLocation?: string
    navMenu?: Array<{ title: string; path: string }>
    footerLinks?: Array<{ title: string; path: string }>
    branchesContent?: {
        eyebrow?: string
        title?: string
        description?: string
    }
    branches?: Array<{
        _key?: string
        name?: string
        address?: string
        hours?: string
        phone?: string
        daySchedules?: Array<{
            day?: string
            openTime?: string
            closeTime?: string
        }>
        workDays?: string[]
        openTime?: string
        closeTime?: string
    }>
    homeContent?: {
        featuredTitle?: string
        reviewsTitle?: string
    }
    catalogContent?: {
        recommendedTitle?: string
        whatsappLabel?: string
    }
    faqContent?: {
        ctaTitle?: string
        ctaDescription?: string
        ctaButtonLabel?: string
        trustTitle?: string
        trustSubtitle?: string
    }
    sellContent?: {
        eyebrow?: string
        title?: string
        steps?: Array<{ title?: string; description?: string }>
        trustTitle?: string
        trustSubtitle?: string
    }
    financeContent?: {
        eyebrow?: string
        title?: string
        requirementsTitle?: string
        whatsappLabel?: string
        digitalTitle?: string
        trustTitle?: string
        trustSubtitle?: string
    }
    maintenanceContent?: {
        eyebrow?: string
        title?: string
        message?: string
        contactLabel?: string
        contactEmail?: string
        footerText?: string
    }
    seoDescriptions?: {
        home?: string
        catalogo?: string
        vender?: string
        financiamiento?: string
        contacto?: string
        faq?: string
        terminos?: string
        sucursales?: string
    }
}

/**
 * 2. Definimos la estructura de Apariencia (appearance)
 * Incluye la marca, el logo, los parámetros de financiamiento y el BANNER PRINCIPAL (hero).
 */
interface AppearanceSettings {
    Sitename?: string
    primaryColor?: string
    accessibilityScale?: number
    brandName?: string
    logo?: SanityImageLike
    /** Altura máxima del logo (px). El campo Sanity conserva el nombre `logoWidth`. */
    logoWidth?: number
    splitText?: boolean
    isJoined?: boolean
    minDepositPercent?: number
    minIncome?: number
    minWorkExperience?: string
    hero?: {
        title?: string;
        subtitle?: string;
        image?: SanityImageLike;
        position?: string;
    };
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
 * 4. El Provider utiliza las interfaces definidas para validar los datos.
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
