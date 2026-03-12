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

        // --- CAMBIO AQUÍ: REEMPLAZAMOS 'price' POR ESTOS DOS ---
        defineField({
            name: 'listPrice',
            title: 'Precio Lista (Contado)',
            type: 'number',
            validation: Rule => Rule.required().min(0)
        }),
        defineField({
            name: 'financedPrice',
            title: 'Precio Financiado (Bono)',
            type: 'number',
            validation: Rule => Rule.required().min(0)
        }),
        // -------------------------------------------------------

        defineField({ name: 'mileage', title: 'Kilometraje', type: 'number' }),

        defineField({
            name: 'body',
            title: 'Carrocería',
            type: 'string',
            options: {
                list: [
                    { title: 'SUV', value: 'Suv' },
                    { title: 'Sedán', value: 'Sedan' },
                    { title: 'Hatchback', value: 'Hatchback' },
                    { title: 'Camioneta', value: 'Camioneta' },
                    { title: 'Coupé', value: 'Coupe' },
                    { title: 'Van', value: 'Van' },
                ],
            }
        }),

        defineField({
            name: 'transmission',
            title: 'Transmisión',
            type: 'string',
            options: {
                list: [
                    { title: 'Automática', value: 'Automatica' },
                    { title: 'Manual', value: 'Manual' },
                ],
            }
        }),

        defineField({
            name: 'drivetrain',
            title: 'Tracción',
            type: 'string',
            options: {
                list: [
                    { title: 'Delantera', value: 'Delantera' },
                    { title: 'Trasera', value: 'Trasera' },
                    { title: '4x4', value: '4x4' },
                    { title: '4x2', value: '4x2' },
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
                    { title: 'Eléctrico', value: 'Electrico' },
                ],
            },
        }),

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
                    { title: 'Plateado', value: 'Plateado' },
                ],
            }
        }),

        defineField({
            name: 'location',
            title: 'Ubicación',
            type: 'string',
            initialValue: 'Metropolitana de Santiago'
        }),

        defineField({
            name: 'features',
            title: 'Equipamiento / Características',
            type: 'array',
            of: [{ type: 'string' }],
            options: { layout: 'tags' }
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