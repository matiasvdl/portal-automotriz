import { defineField, defineType } from 'sanity'

export const brand = defineType({
    name: 'brand',
    title: 'Base de Datos: Marcas y Modelos',
    type: 'document',
    fields: [
        defineField({
            name: 'name',
            title: 'Nombre de la Marca',
            type: 'string',
            description: 'Ej: Jeep, Toyota, Ford'
        }),
        defineField({
            name: 'models',
            title: 'Modelos y Versiones',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'modelName', title: 'Nombre del Modelo', type: 'string' },
                        {
                            name: 'versions',
                            title: 'Versiones',
                            type: 'array',
                            of: [{ type: 'string' }],
                            options: { layout: 'tags' }
                        }
                    ]
                }
            ]
        })
    ]
})