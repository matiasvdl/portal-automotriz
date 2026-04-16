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

        // ---> CATEGORÍA (BADGE: RECIÉN LLEGADO, ETC) <---
        defineField({
            name: 'category',
            title: 'Etiqueta (Badge)',
            type: 'string',
            options: {
                list: [
                    { title: 'Seminuevo', value: 'Seminuevo' },
                    { title: 'Recién Llegado', value: 'Recién Llegado' },
                    { title: 'Oferta de la Semana', value: 'Oferta de la Semana' },
                    { title: 'Reserva Online', value: 'Reserva Online' },
                    { title: 'Garantía VDL', value: 'Garantía VDL' },
                    { title: 'Único Dueño', value: 'Único Dueño' },
                    { title: 'Oportunidad', value: 'Oportunidad' },
                    { title: 'Vendido', value: 'Vendido' },
                ],
            },
            initialValue: 'Seminuevo'
        }),

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

        defineField({ name: 'mileage', title: 'Kilometraje', type: 'number' }),

        // ---> MOTOR (EJ: 2.0) <---
        defineField({
            name: 'engine',
            title: 'Motor (Cilindrada/Potencia)',
            type: 'string',
            placeholder: 'Ej: 3.0L V6 o 2.0 Turbo'
        }),

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

        // ====================================================================
        // CAMPOS DE ESPECIFICACIONES (TEXTO LIBRE)
        // ====================================================================
        defineField({
            name: 'specsGeneral',
            title: 'Especificaciones: General',
            type: 'object',
            fields: [
                { name: 'cilindrada', title: 'Cilindrada (Ej: 1.6L)', type: 'string' },
                { name: 'cilindros', title: 'Cilindros (Ej: 4)', type: 'string' },
                { name: 'potencia', title: 'Potencia (Ej: 110 HP)', type: 'string' },
            ]
        }),
        // NUEVO BLOQUE: HISTORIAL Y MANTENCIONES
        defineField({
            name: 'specsHistory',
            title: 'Especificaciones: Historial',
            type: 'object',
            fields: [
                { name: 'duenos', title: 'Dueños (Ej: Único dueño)', type: 'string' },
                { name: 'mantenciones', title: 'Mantenciones (Ej: Al día en concesionario)', type: 'string' },
                { name: 'historial', title: 'Historial Autofact (Ej: 100% limpio)', type: 'string' },
            ]
        }),
        defineField({
            name: 'specsExterior',
            title: 'Especificaciones: Exterior',
            type: 'object',
            fields: [
                { name: 'puertas', title: 'Número de Puertas', type: 'string' },
                { name: 'rin', title: 'Diámetro de Rin', type: 'string' },
                { name: 'tipoRin', title: 'Tipo de Rin', type: 'string' },
                { name: 'luces', title: 'Tipo de Luces', type: 'string' },
            ]
        }),
        defineField({
            name: 'specsComfort',
            title: 'Especificaciones: Equipamiento y Confort',
            type: 'object',
            fields: [
                { name: 'encendido', title: 'Botón de Encendido', type: 'string' },
                { name: 'crucero', title: 'Control de Crucero', type: 'string' },
                { name: 'sensorDistancia', title: 'Sensor de Distancia', type: 'string' },
                { name: 'aire', title: 'Aire Acondicionado', type: 'string' },
                { name: 'estacionamiento', title: 'Asistencia de Estacionamiento', type: 'string' },
            ]
        }),
        defineField({
            name: 'specsSecurity',
            title: 'Especificaciones: Seguridad',
            type: 'object',
            fields: [
                { name: 'airbagsDelanteros', title: 'Bolsas de Aire Delanteras', type: 'string' },
                { name: 'airbagsTotales', title: 'Número total de Airbags', type: 'string' },
                { name: 'frenosDisco', title: 'Cantidad de discos de freno', type: 'string' },
                { name: 'abs', title: 'Frenos ABS', type: 'string' },
                { name: 'estabilidad', title: 'Control de estabilidad', type: 'string' },
            ]
        }),
        defineField({
            name: 'specsInterior',
            title: 'Especificaciones: Interior',
            type: 'object',
            fields: [
                { name: 'pasajeros', title: 'Número de Pasajeros', type: 'string' },
                { name: 'materialAsientos', title: 'Material Asientos', type: 'string' },
            ]
        }),
        defineField({
            name: 'specsEntertainment',
            title: 'Especificaciones: Entretenimiento',
            type: 'object',
            fields: [
                { name: 'pantalla', title: 'Pantalla Táctil', type: 'string' },
                { name: 'carplay', title: 'Apple CarPlay / Android Auto', type: 'string' },
                { name: 'bluetooth', title: 'Bluetooth', type: 'string' },
                { name: 'radio', title: 'Radio', type: 'string' },
            ]
        }),
        // ====================================================================

        defineField({
            name: 'features',
            title: 'Equipamiento / Características',
            type: 'array',
            of: [{ type: 'string' }],
            options: { layout: 'tags' }
        }),

        // ====================================================================
        // GALERÍAS DE IMÁGENES
        // ====================================================================
        defineField({
            name: 'images',
            title: 'Imágenes Principales',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
        }),
        defineField({
            name: 'exteriorImages',
            title: 'Fotos Detalles de Exterior',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
        }),
        defineField({
            name: 'interiorImages',
            title: 'Fotos Detalles de Interior',
            type: 'array',
            of: [{ type: 'image', options: { hotspot: true } }],
        }),

        defineField({
            name: 'description',
            title: 'Descripción',
            type: 'text',
        }),
        defineField({
            name: 'status',
            title: 'Estado de publicación',
            type: 'boolean',
            initialValue: true
        })
    ],
})