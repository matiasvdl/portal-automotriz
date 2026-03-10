'use server'

import { writeClient } from '@/sanity/lib/client'
import { revalidatePath } from 'next/cache'

/**
 * ACCIÓN PARA CREAR UN NUEVO AUTO
 */
export async function guardarAuto(formData: FormData) {
    const make = formData.get('make') as string
    const model = formData.get('model') as string
    const year = Number(formData.get('year'))
    const price = Number(formData.get('price'))
    const fuel = formData.get('fuel') as string
    const transmission = formData.get('transmission') as string
    const body = formData.get('body') as string

    // Capturamos el archivo de imagen
    const imageFile = formData.get('image') as File

    try {
        let imageAsset;

        // Subimos la imagen a Sanity si existe
        if (imageFile && imageFile.size > 0) {
            imageAsset = await writeClient.assets.upload('image', imageFile, {
                filename: imageFile.name,
            })
        }

        await writeClient.create({
            _type: 'car',
            make,
            model,
            year,
            price,
            fuel,
            transmission,
            body,
            images: imageAsset ? [{
                _key: Math.random().toString(36).substring(2),
                _type: 'image',
                asset: {
                    _type: "reference",
                    _ref: imageAsset._id
                }
            }] : [],
            slug: {
                _type: 'slug',
                current: `${make}-${model}-${year}`.toLowerCase().replace(/\s+/g, '-')
            }
        })

        revalidatePath('/')
        revalidatePath('/admin')
        return { success: true }
    } catch (error) {
        console.error("Error detallado:", error)
        return { success: false, error: "No se pudo completar la publicación" }
    }
}

/**
 * ACCIÓN PARA ACTUALIZAR UN AUTO EXISTENTE
 */
export async function actualizarAuto(id: string, formData: FormData) {
    const data = {
        make: formData.get('make') as string,
        model: formData.get('model') as string,
        year: Number(formData.get('year')),
        price: Number(formData.get('price')),
        fuel: formData.get('fuel') as string,
        transmission: formData.get('transmission') as string,
        body: formData.get('body') as string,
    }

    try {
        await writeClient
            .patch(id)
            .set(data)
            .commit()

        revalidatePath('/')
        revalidatePath('/admin')
        revalidatePath(`/admin/editar/${id}`)
        return { success: true }
    } catch (error) {
        console.error("Error al actualizar:", error)
        return { success: false }
    }
}

/**
 * ACCIÓN PARA ELIMINAR UN AUTO
 */
export async function eliminarAuto(id: string) {
    try {
        await writeClient.delete(id)

        revalidatePath('/')
        revalidatePath('/admin')

        return { success: true }
    } catch (error) {
        console.error("Error al eliminar de Sanity:", error)
        return { success: false }
    }
}