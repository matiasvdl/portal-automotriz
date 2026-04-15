'use server'

import { writeClient } from '@/sanity/lib/client'

// Esta función corre 100% en el servidor, por lo que puede usar el Token
export async function uploadSanityImage(formData: FormData) {
    try {
        const file = formData.get('file') as File;

        if (!file) {
            return { success: false, error: "No se encontró el archivo en el formulario" };
        }

        // Subimos la imagen a Sanity usando el cliente de escritura
        const asset = await writeClient.assets.upload('image', file, {
            filename: file.name,
            contentType: file.type,
        });

        return { success: true, assetId: asset._id };
    } catch (error: any) {
        console.error("Error detallado en uploadSanityImage:", error);
        return { success: false, error: error.message || "Error desconocido al subir" };
    }
}