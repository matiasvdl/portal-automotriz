// src\app\actions\carActions.ts

'use server'

import { writeClient } from '@/sanity/lib/client'
import { revalidatePath } from 'next/cache'

export async function saveCarAction(id: string | null, carData: any) {
    try {
        // Limpieza de datos: Aseguramos que los números sean números y no strings
        // Esto evita errores de esquema en Sanity
        const cleanData = {
            ...carData,
            listPrice: Number(carData.listPrice) || 0,
            financedPrice: Number(carData.financedPrice) || 0,
            year: Number(carData.year) || new Date().getFullYear(),
            mileage: Number(carData.mileage) || 0,
        }

        if (id) {
            // EDITAR: Actualiza el documento existente
            await writeClient.patch(id).set(cleanData).commit()
        } else {
            // NUEVO: Crea un documento desde cero
            // Verificamos que el _type sea 'car' explícitamente
            await writeClient.create({
                _type: 'car',
                ...cleanData
            })
        }

        // REVALIDACIÓN: Esto es clave para que los cambios se vean sin refrescar
        revalidatePath('/catalogo')
        revalidatePath('/admin/dashboard') // <-- Añadido para que el admin se actualice
        revalidatePath('/')

        return { success: true }
    } catch (error: any) {
        console.error("Error en Sanity al guardar vehículo:", error)
        return {
            success: false,
            error: error.message || "No se pudo guardar en la base de datos"
        }
    }
}

export async function deleteCarAction(id: string) {
    try {
        await writeClient.delete(id)

        // Revalidamos las mismas rutas tras eliminar
        revalidatePath('/catalogo')
        revalidatePath('/admin/dashboard')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error("Error al eliminar vehículo:", error)
        return { success: false, error: "Error al eliminar el registro" }
    }
}

// NUEVA FUNCIÓN: Cambia el estado de activo/desactivado rápidamente desde el Dashboard
export async function toggleCarStatusAction(id: string, currentStatus: boolean) {
    try {
        await writeClient
            .patch(id)
            .set({ status: !currentStatus }) // Invierte el estado actual
            .commit()

        // Revalidamos las rutas para que el cambio sea instantáneo en toda la web
        revalidatePath('/admin/dashboard')
        revalidatePath('/catalogo')
        revalidatePath('/')

        return { success: true, newStatus: !currentStatus }
    } catch (error) {
        console.error("Error al cambiar estado:", error)
        return { success: false }
    }
}