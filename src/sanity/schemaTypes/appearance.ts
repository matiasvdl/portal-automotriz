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
            description: 'Texto que se mostrará si no hay un logo cargado (Ej: VDL GROUP)',
            initialValue: 'VDL GROUP'
        }),
        defineField({
            name: 'logo',
            title: 'Logo Principal',
            type: 'image',
            description: 'Carga tu logo aquí. Si lo dejas vacío, se usará el nombre de la marca.',
            options: {
                hotspot: true, // Permite recortar la imagen en Sanity
            },
        }),
    ],
})