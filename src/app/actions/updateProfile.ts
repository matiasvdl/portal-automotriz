'use server'

import { writeClient } from '@/sanity/lib/client'

export async function updateAdminProfile(id: string, updateData: any, imageBase64?: string | null) {
    try {
        let finalData = { ...updateData };

        // 1. Subida de imagen si existe
        if (imageBase64) {
            const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
            const asset = await writeClient.assets.upload('image', buffer, {
                filename: `profile-${Date.now()}.jpg`
            });

            finalData.image = {
                _type: 'image',
                asset: { _type: 'reference', _ref: asset._id }
            };
        }

        // 2. Aquí está el arreglo para Vercel:
        // Si el ID es 'new', creamos un documento nuevo.
        if (id === 'new' || !id) {
            const result = await writeClient.create({
                _type: 'adminProfile',
                ...finalData
            });
            return { success: true, data: result };
        } else {
            // Si el ID ya existe, lo editamos.
            const result = await writeClient
                .patch(id)
                .set(finalData)
                .commit();
            return { success: true, data: result };
        }

    } catch (error: any) {
        console.error("Error en Server Action:", error);
        return { success: false, error: error.message || "Error desconocido" };
    }
}