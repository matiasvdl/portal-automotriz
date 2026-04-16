'use server'

import { revalidatePath } from 'next/cache'
import { client, writeClient } from '@/sanity/lib/client'
import {
    PRINCIPAL_ROLE,
    getSessionUser,
    requireAuthenticatedSession,
    requirePrincipalSession
} from '@/lib/auth'

type ActionError = {
    message?: string
}

type AdminProfileUpdatePayload = {
    firstName?: string
    lastName?: string
    username?: string
    email?: string
    phone?: string
    role?: string
    password?: string
    image?: {
        _type: 'image'
        asset: {
            _type: 'reference'
            _ref: string
        }
    }
}

type AdminProfileDocument = {
    _id: string
    role?: string
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === 'object' && 'message' in error) {
        return (error as ActionError).message || fallback
    }

    return fallback
}

export async function deleteAdminProfile(documentId: string) {
    try {
        await requirePrincipalSession()

        if (!documentId || documentId === 'new') {
            return { success: false, error: 'ID inválido' }
        }

        const profile = await client.fetch<AdminProfileDocument | null>(
            `*[_type == "adminProfile" && _id == $id][0]{ _id, role }`,
            { id: documentId }
        )
        if (!profile) {
            return { success: false, error: 'Usuario no encontrado' }
        }
        if (profile.role === PRINCIPAL_ROLE) {
            return { success: false, error: 'No se puede eliminar al administrador principal' }
        }

        await writeClient.delete(documentId)
        revalidatePath('/admin/administracion')
        return { success: true }
    } catch (error: unknown) {
        console.error('deleteAdminProfile:', error)
        return { success: false, error: getErrorMessage(error, 'Error al eliminar') }
    }
}

export async function updateAdminProfile(
    id: string,
    updateData: AdminProfileUpdatePayload,
    imageBase64?: string | null
) {
    try {
        const session = await requireAuthenticatedSession()
        const user = getSessionUser(session)
        const isPrincipal = user.role === PRINCIPAL_ROLE
        const isOwnProfile = Boolean(id) && id === user.id

        if (!isPrincipal && !isOwnProfile) {
            return { success: false, error: 'No autorizado' }
        }

        if (!isPrincipal && (id === 'new' || !id)) {
            return { success: false, error: 'No autorizado' }
        }

        const finalData: AdminProfileUpdatePayload = { ...updateData }

        if (!isPrincipal) {
            delete finalData.role
        }

        if (imageBase64) {
            const buffer = Buffer.from(imageBase64.split(',')[1], 'base64')
            const asset = await writeClient.assets.upload('image', buffer, {
                filename: `profile-${Date.now()}.jpg`
            })

            finalData.image = {
                _type: 'image',
                asset: { _type: 'reference', _ref: asset._id }
            }
        }

        if (id === 'new' || !id) {
            const result = await writeClient.create({
                _type: 'adminProfile',
                ...finalData
            })
            return { success: true, data: result }
        }

        if (!isPrincipal) {
            const currentProfile = await client.fetch<AdminProfileDocument | null>(
                `*[_type == "adminProfile" && _id == $id][0]{ _id, role }`,
                { id }
            )

            if (currentProfile?.role === PRINCIPAL_ROLE) {
                finalData.role = PRINCIPAL_ROLE
            }
        }

        const result = await writeClient
            .patch(id)
            .set(finalData)
            .commit()

        return { success: true, data: result }
    } catch (error: unknown) {
        console.error("Error en Server Action:", error)
        return { success: false, error: getErrorMessage(error, "Error desconocido") }
    }
}
