// contact.ts
import { defineType, defineField } from 'sanity'

export const contact = defineType({
    name: 'contactSettings',
    title: 'Configuración de Contacto',
    type: 'document',
    fields: [
        defineField({
            name: 'whatsapp',
            title: 'Número de WhatsApp',
            description: 'Ingresa el número sin el +, ej: 56912345678',
            type: 'string',
        }),
        defineField({
            name: 'instagram',
            title: 'Link de Instagram',
            type: 'url',
        }),
        defineField({
            name: 'facebook',
            title: 'Link de Facebook',
            type: 'url',
        }),
        defineField({
            name: 'email',
            title: 'Correo de Contacto',
            type: 'string',
        }),
        defineField({
            name: 'address',
            title: 'Dirección física',
            type: 'string',
        })
    ],
})