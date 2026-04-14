import { defineType, defineField } from 'sanity'

export const contact = defineType({
    name: 'contact',
    title: 'Configuración de Contacto',
    type: 'document',
    // Esto es opcional, pero ayuda a que aparezca un icono de teléfono en el panel
    fields: [
        defineField({
            name: 'address',
            title: 'Dirección Física',
            type: 'string',
        }),
        defineField({
            name: 'email',
            title: 'Email Público',
            description: 'Este es el correo que verán los clientes en la página web.',
            type: 'string',
        }),
        defineField({
            name: 'whatsapp',
            title: 'Número de WhatsApp',
            description: 'Ejemplo: 56912345678 (sin el +)',
            type: 'string',
        }),
        defineField({
            name: 'notificationEmails',
            title: 'Correos de Notificación',
            description: '¿A qué correos debe avisar Resend cuando alguien escriba? (Separa con comas en el panel si es necesario).',
            type: 'array',
            of: [{ type: 'string' }],
        }),
    ],
})