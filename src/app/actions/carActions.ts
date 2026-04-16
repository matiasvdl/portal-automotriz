// src\app\actions\carActions.ts

'use server'

import { writeClient } from '@/sanity/lib/client'
import { revalidatePath } from 'next/cache'
import { requireAuthenticatedSession } from '@/lib/auth'
import { recordAuditLogFromSession } from '@/lib/audit'

type ActionError = {
    message?: string
}

type CarPayload = Record<string, unknown> & {
    listPrice?: number | string
    financedPrice?: number | string
    year?: number | string
    mileage?: number | string
}

function getErrorMessage(error: unknown, fallback: string) {
    if (error && typeof error === 'object' && 'message' in error) {
        return (error as ActionError).message || fallback
    }

    return fallback
}

export async function saveCarAction(id: string | null, carData: CarPayload) {
    try {
        await requireAuthenticatedSession()

        const cleanData: CarPayload = {
            ...carData,
            listPrice: Number(carData.listPrice) || 0,
            financedPrice: Number(carData.financedPrice) || 0,
            year: Number(carData.year) || new Date().getFullYear(),
            mileage: Number(carData.mileage) || 0,
        }

        if (id) {
            await writeClient.patch(id).set(cleanData).commit()
            await recordAuditLogFromSession({
                action: 'update_car',
                entityType: 'vehiculo',
                entityId: id,
                entityTitle: `${cleanData.make || ''} ${cleanData.model || ''} ${cleanData.year || ''}`.trim() || id,
                message: 'Actualizó un vehículo del inventario.',
            })
        } else {
            const createdCar = await writeClient.create({
                _type: 'car',
                ...cleanData
            })
            await recordAuditLogFromSession({
                action: 'create_car',
                entityType: 'vehiculo',
                entityId: createdCar._id,
                entityTitle: `${cleanData.make || ''} ${cleanData.model || ''} ${cleanData.year || ''}`.trim() || createdCar._id,
                message: 'Creó un nuevo vehículo en el inventario.',
            })
        }

        revalidatePath('/catalogo')
        revalidatePath('/admin/dashboard')
        revalidatePath('/')

        return { success: true }
    } catch (error: unknown) {
        console.error("Error en Sanity al guardar vehículo:", error)
        return {
            success: false,
            error: getErrorMessage(error, "No se pudo guardar en la base de datos")
        }
    }
}

export async function deleteCarAction(id: string) {
    try {
        await requireAuthenticatedSession()

        if (!id) {
            return { success: false, error: "ID de vehículo no válido" }
        }

        await writeClient.delete(id)
        await recordAuditLogFromSession({
            action: 'delete_car',
            entityType: 'vehiculo',
            entityId: id,
            entityTitle: id,
            message: 'Eliminó un vehículo del inventario.',
        })

        revalidatePath('/catalogo')
        revalidatePath('/admin/dashboard')
        revalidatePath('/')

        return { success: true }
    } catch (error: unknown) {
        console.error("Error al eliminar vehículo:", error)
        return {
            success: false,
            error: getErrorMessage(error, "Error al eliminar el registro de la base de datos")
        }
    }
}

export async function toggleCarStatusAction(id: string, currentStatus: boolean) {
    try {
        await requireAuthenticatedSession()

        await writeClient
            .patch(id)
            .set({ status: !currentStatus })
            .commit()

        await recordAuditLogFromSession({
            action: !currentStatus ? 'publish_car' : 'hide_car',
            entityType: 'vehiculo',
            entityId: id,
            entityTitle: id,
            message: !currentStatus
                ? 'Publicó un vehículo en el catálogo.'
                : 'Ocultó un vehículo del catálogo.',
        })

        revalidatePath('/admin/dashboard')
        revalidatePath('/catalogo')
        revalidatePath('/')

        return { success: true, newStatus: !currentStatus }
    } catch (error) {
        console.error("Error al cambiar estado:", error)
        return { success: false }
    }
}
