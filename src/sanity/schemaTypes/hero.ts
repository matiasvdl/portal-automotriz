const hero = {
    name: 'hero',
    title: 'Banner Principal',
    type: 'document',
    fields: [
        {
            name: 'title',
            title: 'Título Principal',
            type: 'string',
            initialValue: 'TRANSFORMA TU CAMINO'
        },
        {
            name: 'subtitle',
            title: 'Subtítulo',
            type: 'string',
            initialValue: 'Comprar y vender un auto nunca fue tan simple.'
        },
        {
            name: 'image',
            title: 'Imagen de Fondo',
            type: 'image',
            options: { hotspot: true } // Esto permite elegir el foco en Sanity
        },
        {
            name: 'position',
            title: 'Alineación de la Imagen',
            type: 'string',
            description: 'Define qué parte de la foto se debe priorizar',
            options: {
                list: [
                    { title: 'Superior', value: 'top' },
                    { title: 'Centro', value: 'center' },
                    { title: 'Inferior', value: 'bottom' },
                ]
            },
            initialValue: 'center'
        }
    ]
}

export default hero
