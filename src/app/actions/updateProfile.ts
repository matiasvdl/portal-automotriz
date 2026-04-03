'use server'

import { writeClient } from '@/sanity/lib/client'

export async function updateAdminProfile(id: string, updateData: any, imageBase64?: string | null) {
    try {
        let finalData = { ...updateData };

        // Si hay una imagen nueva en Base64, la subimos a Sanity
        if (imageBase64) {
            const buffer = Buffer.from(imageBase64.split(',')[1], 'base64');
            const asset = await writeClient.assets.upload('image', buffer, {
                filename: `profile-${id}.jpg`
            });

            finalData.image = {
                _type: 'image',
                asset: { _type: 'reference', _ref: asset._id }
            };
        }

        // Aplicamos los cambios (Nombre, Email, Rol, Password, etc.)
        const result = await writeClient
            .patch(id)
            .set(finalData)
            .commit();

        return { success: true, data: result };
    } catch (error: any) {
        console.error("Error en Server Action:", error);
        return { success: false, error: error.message || "Error desconocido" };
    }
}