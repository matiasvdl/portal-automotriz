import { defineType, defineField } from 'sanity'

export const faq = defineType({
    name: 'faq',
    title: 'Preguntas Frecuentes',
    type: 'document',
    fields: [
        defineField({
            name: 'question',
            title: 'Pregunta',
            type: 'string',
        }),
        defineField({
            name: 'answer',
            title: 'Respuesta',
            type: 'text',
        }),
        defineField({
            name: 'order',
            title: 'Orden de visualización',
            type: 'number',
            description: 'Define la posición (ej: 1 para la primera)',
        })
    ],
})