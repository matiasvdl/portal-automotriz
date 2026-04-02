'use server'

import { writeClient } from '@/sanity/lib/client'
import { revalidatePath } from 'next/cache'

export async function saveCarAction(id: string | null, carData: any) {
    try {
        // Limpieza básica de datos antes de enviar
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
            await writeClient.create({ _type: 'car', ...cleanData })
        }

        // Esto limpia la memoria de Vercel para que el auto aparezca de inmediato
        revalidatePath('/catalogo')
        revalidatePath('/')

        return { success: true }
    } catch (error) {
        console.error("Error en Sanity:", error)
        return { success: false, error: "No se pudo guardar en la base de datos" }
    }
}

export async function deleteCarAction(id: string) {
    try {
        await writeClient.delete(id)
        revalidatePath('/catalogo')
        return { success: true }
    } catch (error) {
        return { success: false, error: "Error al eliminar" }
    }
}