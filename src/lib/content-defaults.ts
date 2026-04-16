/**
 * Fallbacks de contenido alineados con initialValue en:
 * - sanity/schemaTypes/appearance.ts
 * - sanity/schemaTypes/siteConfig.ts (siteName)
 * Solo aplican cuando Sanity no devuelve el campo (documento nuevo o vacío).
 */

/** Valores por defecto (números tipados como number para estado React / formularios). */
export const CONTENT_DEFAULTS: {
    /** Altura máxima del logo (px). El campo en Sanity sigue llamándose `logoWidth` por compatibilidad. */
    logoMaxHeightPx: number
    primaryColor: string
    siteDisplayName: string
    heroTitle: string
    heroSubtitle: string
} = {
    logoMaxHeightPx: 64,
    primaryColor: '#000000',
    siteDisplayName: '',
    heroTitle: 'TRANSFORMA TU CAMINO',
    heroSubtitle: 'Comprar y vender un auto nunca fue tan simple.',
}

/** Barra de navegación: `h-20` en Navigation.tsx. */
export const HEADER_NAV_BAR_HEIGHT_PX = 80

/**
 * Techo físico del logo en header/pie (barra y legibilidad).
 * El admin solo permite hasta este valor como "altura máxima".
 */
export const HEADER_LOGO_MAX_HEIGHT_PX = 72

/** Rango del control en admin (y valor guardado en `logoWidth`): altura máxima en px. */
export const LOGO_MAX_HEIGHT_MIN_PX = 48
export const LOGO_MAX_HEIGHT_MAX_PX = HEADER_LOGO_MAX_HEIGHT_PX
export const LOGO_MAX_HEIGHT_STEP_PX = 1

/** Antes el campo era "ancho" 72–140 px; se mapea a altura 48–72 px. */
const LEGACY_LOGO_WIDTH_MIN = 72
const LEGACY_LOGO_WIDTH_MAX = 140

export function clampLogoMaxHeightPx(value: number): number {
    const n = Math.round(Number(value))
    if (!Number.isFinite(n)) {
        return clampLogoMaxHeightPx(CONTENT_DEFAULTS.logoMaxHeightPx)
    }
    return Math.min(LOGO_MAX_HEIGHT_MAX_PX, Math.max(LOGO_MAX_HEIGHT_MIN_PX, n))
}

/**
 * Interpreta `appearance.logoWidth`: altura máxima (px).
 * Migra valores antiguos guardados como ancho (72–140) a escala de altura.
 */
export function resolveLogoMaxHeightPx(logoWidthField?: number | null): number {
    let n = Number(logoWidthField)
    if (!Number.isFinite(n) || n <= 0) {
        return clampLogoMaxHeightPx(CONTENT_DEFAULTS.logoMaxHeightPx)
    }
    if (n > LOGO_MAX_HEIGHT_MAX_PX) {
        n = Math.round(
            LOGO_MAX_HEIGHT_MIN_PX +
            ((Math.min(n, LEGACY_LOGO_WIDTH_MAX) - LEGACY_LOGO_WIDTH_MIN) /
                (LEGACY_LOGO_WIDTH_MAX - LEGACY_LOGO_WIDTH_MIN)) *
            (LOGO_MAX_HEIGHT_MAX_PX - LOGO_MAX_HEIGHT_MIN_PX)
        )
    }
    return clampLogoMaxHeightPx(n)
}

/** @deprecated Usar `resolveLogoMaxHeightPx` (el campo Sanity sigue llamándose logoWidth). */
export const resolveLogoWidthPx = resolveLogoMaxHeightPx

/** @deprecated Usar `clampLogoMaxHeightPx` */
export const clampLogoWidthPx = clampLogoMaxHeightPx

export function resolvePrimaryColor(primaryColor?: string | null): string {
    const s = primaryColor?.trim()
    if (s) return s
    return CONTENT_DEFAULTS.primaryColor
}

/** Marca para logo en texto / alt: preferencia apariencia, luego SEO del sitio. */
export function resolveBrandLabel(
    appearance: { brandName?: string | null } | undefined,
    config: { siteName?: string | null } | undefined
): string {
    const fromSite = config?.siteName?.trim()
    if (fromSite) return fromSite
    const fromAppearance = appearance?.brandName?.trim()
    if (fromAppearance) return fromAppearance
    return CONTENT_DEFAULTS.siteDisplayName
}
