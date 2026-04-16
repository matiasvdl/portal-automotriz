'use server'

import { client } from '@/sanity/lib/client'

// Token con permisos de escritura necesario
const writeClient = client.withConfig({
    token: process.env.SANITY_WRITE_TOKEN,
    useCdn: false
})

export async function syncBrandDatabaseAction(make: string, model: string, version?: string) {
    if (!make || !model) return

    try {
        // 1. Buscar si la marca ya existe
        const existingBrand = await writeClient.fetch(
            `*[_type == "brand" && name == $make][0]`,
            { make }
        )

        if (!existingBrand) {
            // Si la marca no existe, crearla con su modelo y versión
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

        // 2. Si la marca existe, ver si el modelo ya está
        const modelIndex = existingBrand.models?.findIndex((m: any) => m.modelName === model)

        if (modelIndex === -1 || modelIndex === undefined) {
            // Marca existe pero modelo no: Agregar el modelo
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
            // Marca y modelo existen: Ver si la versión es nueva
            const currentVersions = existingBrand.models[modelIndex].versions || []
            if (!currentVersions.includes(version)) {
                const updatedModels = [...existingBrand.models]
                updatedModels[modelIndex].versions = [...currentVersions, version]

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