import { defineType, defineField } from 'sanity'

export const appearance = defineType({
    name: 'appearance',
    title: 'Personalización',
    type: 'document',
    fields: [
        defineField({
            name: 'brandName',
            title: 'Nombre de la Marca',
            type: 'string',
        }),
        defineField({
            name: 'logo',
            title: 'Logo Principal',
            type: 'image',
            options: { hotspot: true },
        }),
        defineField({
            name: 'splitText',
            title: 'Estilo Dividido',
            type: 'boolean',
        }),
        defineField({
            name: 'isJoined',
            title: 'Eliminar Espacios',
            type: 'boolean',
        }),
        defineField({
            name: 'minDepositPercent',
            title: 'Porcentaje de Pie Mínimo (%)',
            type: 'number',
            description: 'Porcentaje por defecto para el cálculo del financiamiento (ej: 30)',
            initialValue: 30,
            validation: Rule => Rule.min(0).max(100)
        }),
        defineField({
            name: 'minIncome',
            title: 'Renta Mínima Requerida ($)',
            type: 'number',
            description: 'Ingreso líquido mensual mínimo (ej: 500000)',
            initialValue: 500000,
        }),
        defineField({
            name: 'minWorkExperience',
            title: 'Antigüedad Laboral Requerida',
            type: 'string',
            description: 'Texto descriptivo (ej: Mínimo 1 año de continuidad)',
            initialValue: 'Mínimo 1 año de continuidad laboral.',
        }),
        // --- NUEVO: SECCIÓN DEL BANNER ---
        defineField({
            name: 'hero',
            title: 'Banner Principal (Hero)',
            type: 'object',
            fields: [
                { name: 'title', title: 'Título Principal', type: 'string' },
                { name: 'subtitle', title: 'Subtítulo', type: 'string' },
                {
                    name: 'image',
                    title: 'Imagen de Fondo',
                    type: 'image',
                    options: { hotspot: true }
                },
                {
                    name: 'position',
                    title: 'Posición de la Imagen',
                    type: 'string',
                    options: {
                        list: [
                            { title: 'Centro', value: 'center' },
                            { title: 'Arriba', value: 'top' },
                            { title: 'Abajo', value: 'bottom' },
                        ]
                    },
                    initialValue: 'center'
                }
            ]
        })
    ],
})