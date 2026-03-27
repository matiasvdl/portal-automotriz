// sanity/schemaTypes/review.ts
export const review = {
    name: 'review',
    title: 'Reseñas de Clientes',
    type: 'document',
    fields: [
        { name: 'name', title: 'Nombre del Cliente', type: 'string' },
        { name: 'date', title: 'Fecha', type: 'date' },
        { name: 'rating', title: 'Estrellas', type: 'number' },
        { name: 'comment', title: 'Comentario', type: 'text' },
        {
            name: 'badge',
            title: 'Etiqueta de Verificación',
            type: 'string',
            options: {
                list: [
                    { title: 'Comprador Satisfecho', value: 'Comprador Satisfecho' },
                    { title: 'Vendedor Satisfecho', value: 'Vendedor Satisfecho' },
                    { title: 'Cliente Verificado', value: 'Cliente Verificado' },
                    { title: 'Opinión Real de Cliente', value: 'Opinión Real de Cliente' },
                ],
            },
            initialValue: 'Comprador Satisfecho'
        },
    ],
}