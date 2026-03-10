import { defineField, defineType } from 'sanity'

export const car = defineType({
    name: 'car',
    title: 'Autos',
    type: 'document',
    fields: [
        defineField({ name: 'make', title: 'Marca', type: 'string' }),
        defineField({ name: 'model', title: 'Modelo', type: 'string' }),
        defineField({
            name: 'slug',
            title: 'Enlace (Slug)',
            type: 'slug',
            options: { source: (doc: any) => `${doc.make}-${doc.model}-${doc.year}` },
            validation: Rule => Rule.required()
        }),
        defineField({ name: 'year', title: 'Año', type: 'number' }),
        defineField({ name: 'price', title: 'Precio', type: 'number' }),
        defineField({ name: 'mileage', title: 'Kilometraje', type: 'number' }),

        // COLOR con lista predefinida pero permite escribir cualquiera
        defineField({
            name: 'color',
            title: 'Color',
            type: 'string',
            options: {
                list: [
                    { title: 'Blanco', value: 'Blanco' },
                    { title: 'Negro', value: 'Negro' },
                    { title: 'Gris', value: 'Gris' },
                    { title: 'Azul', value: 'Azul' },
                    { title: 'Rojo', value: 'Rojo' },
                ],
            }
        }),

        defineField({
            name: 'fuel',
            title: 'Combustible',
            type: 'string',
            options: {
                list: [
                    { title: 'Bencina', value: 'Bencina' },
                    { title: 'Diésel', value: 'Diesel' },
                    { title: 'Híbrido', value: 'Hibrido' },
                ],
            },
        }),

        // CARACTERÍSTICAS (Equipamiento)
        defineField({
            name: 'features',
            title: 'Equipamiento / Características',
            type: 'array',
            of: [{ type: 'string' }],
            options: { layout: 'tags' } // Esto hace que se vean como etiquetas
        }),

        defineField({
            name: 'images',
            title: 'Imágenes',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
        }),
        defineField({
            name: 'description',
            title: 'Descripción',
            type: 'text',
        }),
    ],
})