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
