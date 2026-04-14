'use server'

import { Resend } from 'resend'
import { client } from '@/sanity/lib/client'

const resend = new Resend(process.env.RESEND_API_KEY)

export async function sendContactEmail(formData: {
    name: string
    email: string
    phone: string
    subject: string
    message: string
}) {
    try {
        // Traemos los correos de notificación desde Sanity
        const contactConfig = await client.fetch(`*[_type == "contact"][0]`)
        const recipients = contactConfig?.notificationEmails?.length > 0
            ? contactConfig.notificationEmails
            : ['matiasvidalp49@gmail.com'] // Fallback por seguridad

        const { name, email, phone, subject, message } = formData

        const { data, error } = await resend.emails.send({
            from: 'VDL Motors <onboarding@resend.dev>',
            to: recipients,
            subject: `Consulta Web: ${subject} - ${name}`,
            replyTo: email,
            html: `
                <div style="font-family: sans-serif; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
                    <h2 style="color: #000; text-transform: uppercase;">Nueva Consulta</h2>
                    <hr />
                    <p><strong>Nombre:</strong> ${name}</p>
                    <p><strong>Email del Cliente:</strong> ${email}</p>
                    <p><strong>Teléfono:</strong> ${phone}</p>
                    <p><strong>Asunto:</strong> ${subject}</p>
                    <div style="background: #f9f9f9; padding: 15px; margin-top: 15px; border-radius: 5px;">
                        <strong>Mensaje:</strong><br />${message}
                    </div>
                </div>
            `
        })

        if (error) return { success: false, error }
        return { success: true, data }
    } catch (error) {
        console.error("Error enviando email:", error)
        return { success: false, error: "Error en el servidor" }
    }
}