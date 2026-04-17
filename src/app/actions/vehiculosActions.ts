'use server'

import { writeClient } from '@/sanity/lib/client'
import { requireAuthenticatedSession } from '@/lib/auth'

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
