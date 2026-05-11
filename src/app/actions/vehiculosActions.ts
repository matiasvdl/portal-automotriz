'use server'

import { writeClient } from '@/sanity/lib/client'
import { requireAuthenticatedSession } from '@/lib/auth'

const ALLOWED_IMAGE_MIME = new Set(['image/jpeg', 'image/png', 'image/webp', 'image/avif'])
const MAX_IMAGE_BYTES = 8 * 1024 * 1024 // 8 MB
const ALLOWED_FILE_MIME = new Set([
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'image/jpeg',
    'image/png',
    'image/webp',
])
const MAX_FILE_BYTES = 15 * 1024 * 1024 // 15 MB

type ActionError = {
    message?: string
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === 'object' && 'message' in error) {
        return (error as ActionError).message || fallback
    }

    return fallback
}

export async function uploadSanityImage(formData: FormData) {
    try {
        await requireAuthenticatedSession()

        const file = formData.get('file')

        if (!(file instanceof File)) {
            return { success: false, error: "No se encontró el archivo en el formulario" }
        }

        if (!ALLOWED_IMAGE_MIME.has(file.type)) {
            return { success: false, error: "Formato no permitido. Usa JPG, PNG, WEBP o AVIF." }
        }

        if (file.size > MAX_IMAGE_BYTES) {
            return { success: false, error: "La imagen supera el tamaño máximo de 8 MB." }
        }

        const asset = await writeClient.assets.upload('image', file, {
            filename: file.name,
            contentType: file.type,
        })

        return { success: true, assetId: asset._id }
    } catch (error: unknown) {
        console.error("Error detallado en uploadSanityImage:", error)
        return { success: false, error: getErrorMessage(error, "Error desconocido al subir") }
    }
}

export async function uploadSanityFile(formData: FormData) {
    try {
        await requireAuthenticatedSession()

        const file = formData.get('file')

        if (!(file instanceof File)) {
            return { success: false, error: "No se encontró el archivo en el formulario" }
        }

        if (!ALLOWED_FILE_MIME.has(file.type)) {
            return { success: false, error: "Formato no permitido. Usa PDF, DOC/DOCX o imagen." }
        }

        if (file.size > MAX_FILE_BYTES) {
            return { success: false, error: "El archivo supera el tamaño máximo de 15 MB." }
        }

        const asset = await writeClient.assets.upload('file', file, {
            filename: file.name,
            contentType: file.type,
        })

        return { success: true, assetId: asset._id, originalFilename: file.name }
    } catch (error: unknown) {
        console.error("Error detallado en uploadSanityFile:", error)
        return { success: false, error: getErrorMessage(error, "Error desconocido al subir archivo") }
    }
}
