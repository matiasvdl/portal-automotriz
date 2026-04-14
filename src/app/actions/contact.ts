'use server'

import { Resend } from 'resend';

// Inicializa Resend con tu clave de API (reemplaza con tu propia clave)
const resend = new Resend('re_HsinTmo2_3Kc5xXDXhBvpDHMWjjRvPE54');

export async function sendContactEmail(formData: any) {
    try {
        const { name, email, phone, subject, message } = formData;

        const { data, error } = await resend.emails.send({
            from: 'VDL Motors <onboarding@resend.dev>', // Luego podrás usar tu propio dominio
            to: ['matiasvidalp49@gmail.com'], // Donde quieres recibir los leads
            subject: `NUEVO LEAD: ${subject} - ${name}`,
            html: `
                <div style="font-family: sans-serif; padding: 20px; color: #333;">
                    <h2 style="text-transform: uppercase;">Nuevo prospecto desde la Web</h2>
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    <p><strong>Asunto:</strong> ${subject}</p>
                    <hr />
                    <p><strong>Mensaje:</strong></p>
                    <p>${message}</p>
                </div>
            `
        });

        if (error) return { success: false, error };
        return { success: true };

    } catch (error) {
        return { success: false, error };
    }
}