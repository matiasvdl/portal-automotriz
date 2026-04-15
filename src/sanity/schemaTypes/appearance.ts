import { defineType, defineField } from 'sanity'

export const appearance = defineType({
    name: 'appearance',
    title: 'Personalización',
    type: 'document',
    fields: [
        {
            name: 'primaryColor',
            title: 'Color Primario',
            type: 'string',
            description: 'Hexadecimal (ej: #000000)'
        },
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
            name: 'logoWidth',
            title: 'Altura máxima del logo (px)',
            type: 'number',
            description:
                'Altura máxima visible en header y pie (48–72 px). El nombre técnico del campo sigue siendo logoWidth por compatibilidad.',
            initialValue: 64, // alinear con CONTENT_DEFAULTS.logoMaxHeightPx en src/lib/content-defaults.ts
            validation: (Rule) => Rule.min(48).max(72).integer(),
        }),
        // --- NUEVO: CAMPO PARA EL FAVICON ---
        defineField({
            name: 'favicon',
            title: 'Favicon (Icono de la pestaña)',
            type: 'image',
            description: 'Sube una imagen cuadrada (PNG o ICO). Si no subes nada, se usará el logo principal.',
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
        // --- SECCIÓN DEL BANNER ---
        defineField({
            name: 'hero',
            title: 'Banner Principal (Hero)',
            type: 'object',
            fields: [
                { name: 'title', title: 'Título Principal', type: 'string' },
                { name: 'subtitle', title: 'Subtítulo del Banner', type: 'string' },
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
                            { title: 'Centro (Recomendado)', value: 'center' },
                            { title: 'Superior (Enfocar arriba)', value: 'top' },
                            { title: 'Inferior (Enfocar abajo)', value: 'bottom' },
                        ]
                    },
                    initialValue: 'center'
                }
            ]
        })
    ],
})