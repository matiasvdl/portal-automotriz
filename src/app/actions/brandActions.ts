'use server'

import { client } from '@/sanity/lib/client'
import { requireAuthenticatedSession } from '@/lib/auth'

type BrandModel = {
    _key: string
    modelName: string
    versions?: string[]
}

type BrandDocument = {
    _id: string
    name: string
    models?: BrandModel[]
}

const writeClient = client.withConfig({
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false
})

export async function syncBrandDatabaseAction(make: string, model: string, version?: string) {
    if (!make || !model) return

    try {
        await requireAuthenticatedSession()

        const existingBrand = await writeClient.fetch<BrandDocument | null>(
            `*[_type == "brand" && name == $make][0]`,
            { make }
        )

        if (!existingBrand) {
            await writeClient.create({
                _type: 'brand',
                name: make,
                models: [{
                    _key: Math.random().toString(36).substring(2),
                    modelName: model,
                    versions: version ? [version] : []
                }]
            })
            return
        }

        const modelIndex = existingBrand.models?.findIndex((item) => item.modelName === model)

        if (modelIndex === -1 || modelIndex === undefined) {
            await writeClient
                .patch(existingBrand._id)
                .setIfMissing({ models: [] })
                .insert('after', 'models[-1]', [{
                    _key: Math.random().toString(36).substring(2),
                    modelName: model,
                    versions: version ? [version] : []
                }])
                .commit()
        } else if (version) {
            const currentVersions = existingBrand.models?.[modelIndex]?.versions || []
            if (!currentVersions.includes(version)) {
                const updatedModels = [...(existingBrand.models || [])]
                updatedModels[modelIndex] = {
                    ...updatedModels[modelIndex],
                    versions: [...currentVersions, version]
                }

                await writeClient
                    .patch(existingBrand._id)
                    .set({ models: updatedModels })
                    .commit()
            }
        }
    } catch (error) {
        console.error("Error sincronizando base de datos de marcas:", error)
    }
}

export async function deleteBrandAction(make: string) {
    if (!make) {
        return { success: false, error: 'Marca inválida' }
    }

    try {
        await requireAuthenticatedSession()

        const brand = await writeClient.fetch<BrandDocument | null>(
            `*[_type == "brand" && name == $make][0]{ _id }`,
            { make }
        )

        if (!brand?._id) {
            return { success: false, error: 'Marca no encontrada' }
        }

        const carsUsingBrand = await writeClient.fetch<number>(
            `count(*[_type == "car" && make == $make])`,
            { make }
        )

        if (carsUsingBrand > 0) {
            return { success: false, error: 'No puedes eliminar una marca que está en uso por vehículos.' }
        }

        await writeClient.delete(brand._id)
        return { success: true }
    } catch (error) {
        console.error('Error eliminando marca:', error)
        return { success: false, error: 'No se pudo eliminar la marca.' }
    }
}

export async function deleteBrandModelAction(make: string, model: string) {
    if (!make || !model) {
        return { success: false, error: 'Marca o modelo inválido' }
    }

    try {
        await requireAuthenticatedSession()

        const brand = await writeClient.fetch<BrandDocument | null>(
            `*[_type == "brand" && name == $make][0]`,
            { make }
        )

        if (!brand?._id) {
            return { success: false, error: 'Marca no encontrada' }
        }

        const carsUsingModel = await writeClient.fetch<number>(
            `count(*[_type == "car" && make == $make && model == $model])`,
            { make, model }
        )

        if (carsUsingModel > 0) {
            return { success: false, error: 'No puedes eliminar un modelo que está en uso por vehículos.' }
        }

        const updatedModels = (brand.models || []).filter((item) => item.modelName !== model)

        if (updatedModels.length === 0) {
            await writeClient.delete(brand._id)
            return { success: true }
        }

        await writeClient
            .patch(brand._id)
            .set({ models: updatedModels })
            .commit()

        return { success: true }
    } catch (error) {
        console.error('Error eliminando modelo:', error)
        return { success: false, error: 'No se pudo eliminar el modelo.' }
    }
}
