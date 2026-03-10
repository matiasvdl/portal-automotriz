import { defineField, defineType } from 'sanity'

export const car = defineType({
    name: 'car',
    title: 'Autos',
    type: 'document',
    fields: [
        defineField({ name: 'make', title: 'Marca', type: 'string' }),
        defineField({ name: 'model', title: 'Modelo', type: 'string' }),
        defineField({ name: 'year', title: 'Año', type: 'number' }),
        defineField({ name: 'price', title: 'Precio', type: 'number' }),
        defineField({
            name: 'fuel',
            title: 'Combustible',
            type: 'string',
            options: {
                list: [
                    { title: 'Eléctrico', value: 'electrico' },
                    { title: 'Híbrido', value: 'hibrido' },
                    { title: 'Gasolina', value: 'gasolina' },
                    { title: 'Diésel', value: 'diesel' },
                ],
            },
        }),
        defineField({
            name: 'transmission',
            title: 'Transmisión',
            type: 'string',
            options: {
                list: [
                    { title: 'Automática', value: 'automatica' },
                    { title: 'Manual', value: 'manual' },
                ],
            },
        }),
        defineField({
            name: 'body',
            title: 'Carrocería',
            type: 'string',
            options: {
                list: [
                    { title: 'Camioneta', value: 'camioneta' },
                    { title: 'Sedán', value: 'sedan' },
                    { title: 'SUV', value: 'suv' },
                    { title: 'Hatchback', value: 'hatchback' },
                    { title: 'Coupé', value: 'coupe' },
                    { title: 'Van', value: 'van' },
                    { title: 'Minivan', value: 'minivan' },
                    { title: 'Camión', value: 'camion' },
                    { title: 'Wagon', value: 'wagon' },
                ],
            },
        }),
        defineField({
            name: 'images',
            title: 'Imágenes',
            type: 'array',
            of: [{ type: 'image' }],
        }),
        defineField({
            name: 'description',
            title: 'Descripción',
            type: 'text',
        }),
        defineField({
            name: 'slug',
            title: 'Enlace',
            type: 'slug',
            options: { source: (doc: any) => `${doc.make}-${doc.model}-${doc.year}` },
        }),
    ],
    preview: {
        select: {
            title: 'make',
            subtitle: 'model',
            media: 'images.0',
        },
    },
})
