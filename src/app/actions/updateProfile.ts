'use server'

import { getServerSession } from 'next-auth/next'
import { revalidatePath } from 'next/cache'
import { authOptions } from '@/app/api/auth/[...nextauth]/route'
import { client, writeClient } from '@/sanity/lib/client'

const PRINCIPAL_ROLE = 'Administrador Principal'

export async function deleteAdminProfile(documentId: string) {
    try {
        const session = await getServerSession(authOptions)
        const role = (session?.user as any)?.role
        if (role !== PRINCIPAL_ROLE) {
            return { success: false, error: 'No autorizado' }
        }
        if (!documentId || documentId === 'new') {
            return { success: false, error: 'ID inválido' }
        }

        const profile = await client.fetch<{ _id: string; role?: string } | null>(
            `*[_type == "adminProfile" && _id == $id][0]{ _id, role }`,
            { id: documentId }
        )
        if (!profile) {
            return { success: false, error: 'Usuario no encontrado' }
        }
        if (profile.role === PRINCIPAL_ROLE) {
            return { success: false, error: 'No se puede eliminar al administrador principal' }
        }

        await writeClient.delete(documentId)
        revalidatePath('/admin/administracion')
        return { success: true }
    } catch (error: any) {
        console.error('deleteAdminProfile:', error)
        return { success: false, error: error.message || 'Error al eliminar' }
    }
}

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