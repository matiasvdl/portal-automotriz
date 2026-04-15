'use server'

import { writeClient } from '@/sanity/lib/client'
import { revalidatePath } from 'next/cache'

// 1. Acción para subir imágenes (Logo o Banner)
export async function uploadSanityImage(formData: FormData) {
    try {
        const file = formData.get('file') as File;
        const asset = await writeClient.assets.upload('image', file);
        return { success: true, assetId: asset._id }
    } catch (error) {
        console.error(error);
        return { success: false }
    }
}

// 2. Acción para guardar toda la configuración general
export async function saveGlobalPreferences(settings: any, appearanceData: any, contact: any) {
    try {
        // 1. Guardamos la Configuración del Sitio (siteConfig)
        // Incluimos siteUrl y seoDescriptions para el SEO dinámico
        await writeClient.createOrReplace({
            _id: 'siteConfig',
            _type: 'siteConfig',
            siteName: settings.siteName,
            siteUrl: settings.siteUrl, // <-- NUEVO: Guardado del dominio
            footerDescription: settings.footerDescription,
            footerTagline: settings.footerTagline,
            navMenu: settings.navMenu,
            footerLinks: settings.footerLinks,
            maintenanceMode: settings.maintenanceMode,
            termsAndConditions: settings.termsAndConditions || "",
            lastLegalUpdate: settings.lastLegalUpdate || "",
            // <-- NUEVO: Guardado de todas las descripciones de Google
            seoDescriptions: {
                home: settings.seoDescriptions?.home || "",
                catalogo: settings.seoDescriptions?.catalogo || "",
                vender: settings.seoDescriptions?.vender || "",
                financiamiento: settings.seoDescriptions?.financiamiento || "",
                contacto: settings.seoDescriptions?.contacto || "",
                faq: settings.seoDescriptions?.faq || "",
                terminos: settings.seoDescriptions?.terminos || ""
            }
        })

        // 2. Guardamos Apariencia
        // El spread (...) ya incluye brandName, logo, primaryColor, hero, etc.
        await writeClient.createOrReplace({
            _id: 'appearance-settings',
            _type: 'appearance',
            ...appearanceData
        })

        // 3. Guardamos Contacto
        await writeClient.createOrReplace({
            _id: 'contact-settings',
            _type: 'contactSettings',
            ...contact
        })

        revalidatePath('/')
        return { success: true }
    } catch (error: any) {
        console.error("ERROR EN SERVIDOR:", error);
        return { success: false, error: error.message }
    }
}

// 3. Acciones genéricas para FAQ y Reseñas
export async function createSanityDocument(type: string, data: any) {
    try {
        const result = await writeClient.create({ _type: type, ...data })
        revalidatePath('/')
        return { success: true, data: result }
    } catch (error) { return { success: false } }
}

export async function deleteSanityDocument(id: string) {
    try {
        await writeClient.delete(id)
        revalidatePath('/')
        return { success: true }
    } catch (error) { return { success: false } }
}

export async function updateSanityDocument(id: string, data: any) {
    try {
        await writeClient.patch(id).set(data).commit()
        revalidatePath('/')
        return { success: true }
    } catch (error) { return { success: false } }
}