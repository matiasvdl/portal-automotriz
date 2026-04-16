'use server'

import { client, writeClient } from '@/sanity/lib/client'
import { revalidatePath } from 'next/cache'
import { requireAdminSession } from '@/lib/auth'
import { recordAuditLogFromSession } from '@/lib/audit'

type ActionError = {
    message?: string
}

type SiteSettingsPayload = {
    siteName?: string
    siteUrl?: string
    footerDescription?: string
    footerTagline?: string
    navMenu?: unknown[]
    footerLinks?: unknown[]
    maintenanceMode?: boolean
    termsAndConditions?: string
    lastLegalUpdate?: string
    seoDescriptions?: {
        home?: string
        catalogo?: string
        vender?: string
        financiamiento?: string
        contacto?: string
        faq?: string
        terminos?: string
    }
}

type AppearancePayload = Record<string, unknown>
type ContactPayload = {
    _id?: string
    whatsapp?: string
    email?: string
    address?: string
}

type ContactDocument = ContactPayload & {
    notificationEmails?: string[]
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === 'object' && 'message' in error) {
        return (error as ActionError).message || fallback
    }

    return fallback
}

export async function uploadSanityImage(formData: FormData) {
    try {
        await requireAdminSession()

        const file = formData.get('file')

        if (!(file instanceof File)) {
            return { success: false, error: 'Archivo no válido' }
        }

        const asset = await writeClient.assets.upload('image', file)
        return { success: true, assetId: asset._id }
    } catch (error) {
        console.error(error)
        return { success: false }
    }
}

export async function saveGlobalPreferences(
    settings: SiteSettingsPayload,
    appearanceData: AppearancePayload,
    contact: ContactPayload
) {
    try {
        await requireAdminSession()

        const existingContact = await client.fetch<ContactDocument | null>(
            `coalesce(*[_id == "contact-settings" && _type == "contact"][0], *[_type == "contact"][0], *[_type == "contactSettings"][0])`
        )

        await writeClient.createOrReplace({
            _id: 'siteConfig',
            _type: 'siteConfig',
            siteName: settings.siteName,
            siteUrl: settings.siteUrl,
            footerDescription: settings.footerDescription,
            footerTagline: settings.footerTagline,
            navMenu: settings.navMenu,
            footerLinks: settings.footerLinks,
            maintenanceMode: settings.maintenanceMode,
            termsAndConditions: settings.termsAndConditions || "",
            lastLegalUpdate: settings.lastLegalUpdate || "",
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

        await writeClient.createOrReplace({
            _id: 'appearance-settings',
            _type: 'appearance',
            ...appearanceData
        })

        await writeClient.createOrReplace({
            _id: 'contact-settings',
            _type: 'contact',
            notificationEmails: existingContact?.notificationEmails || [],
            ...contact
        })

        await recordAuditLogFromSession({
            action: 'save_preferences',
            entityType: 'preferencias',
            entityId: 'appearance-settings',
            entityTitle: settings.siteName || 'Preferencias globales',
            message: 'Guardó las preferencias globales del sitio.',
        })

        revalidatePath('/')
        return { success: true }
    } catch (error: unknown) {
        console.error("ERROR EN SERVIDOR:", error)
        return { success: false, error: getErrorMessage(error, 'Error al guardar preferencias') }
    }
}

export async function createSanityDocument(type: string, data: Record<string, unknown>) {
    try {
        await requireAdminSession()

        const result = await writeClient.create({ _type: type, ...data })
        await recordAuditLogFromSession({
            action: `create_${type}`,
            entityType: type === 'review' || type === 'faq' ? 'contenido' : 'preferencias',
            entityId: result._id,
            entityTitle: String(data.title || data.name || data.question || result._id),
            message: `Creó un registro de tipo ${type}.`,
        })
        revalidatePath('/')
        return { success: true, data: result }
    } catch {
        return { success: false }
    }
}

export async function deleteSanityDocument(id: string) {
    try {
        await requireAdminSession()

        await writeClient.delete(id)
        await recordAuditLogFromSession({
            action: 'delete_document',
            entityType: 'contenido',
            entityId: id,
            entityTitle: id,
            message: 'Eliminó un registro de contenido.',
        })
        revalidatePath('/')
        return { success: true }
    } catch {
        return { success: false }
    }
}

export async function updateSanityDocument(id: string, data: Record<string, unknown>) {
    try {
        await requireAdminSession()

        await writeClient.patch(id).set(data).commit()
        await recordAuditLogFromSession({
            action: 'update_document',
            entityType: 'contenido',
            entityId: id,
            entityTitle: String(data.title || data.name || data.question || id),
            message: 'Actualizó un registro de contenido.',
        })
        revalidatePath('/')
        return { success: true }
    } catch {
        return { success: false }
    }
}
