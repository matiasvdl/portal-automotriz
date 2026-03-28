// sanity/schemaTypes/siteConfig.ts

export const siteConfig = {
    name: 'siteConfig',
    title: 'Configuración del Sitio',
    type: 'document',
    fields: [
        {
            name: 'siteName',
            title: 'Nombre del Sitio (SEO)',
            type: 'string',
            initialValue: 'VDL MOTORS'
        },
        {
            name: 'maintenanceMode',
            title: 'Modo Mantenimiento',
            type: 'boolean',
            description: 'Si está activo, el sitio mostrará una página de mantenimiento',
            initialValue: false
        },
        {
            name: 'footerDescription',
            title: 'Descripción bajo el Logo (Footer)',
            type: 'text',
            rows: 3,
        },
        {
            name: 'navMenu',
            title: 'Menú de Navegación (Navbar)',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Título del Enlace', type: 'string' },
                        {
                            name: 'path',
                            title: 'Ruta',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Inicio', value: '/' },
                                    { title: 'Comprar un Auto', value: '/catalogo' },
                                    { title: 'Vende tu Auto', value: '/vender' },
                                    { title: 'Financiamiento', value: '/financiamiento' },
                                    { title: 'Sedes', value: '/sedes' },
                                    { title: 'Preguntas Frecuentes', value: '/faq' },
                                    { title: 'Contacto', value: '/contacto' },
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'footerLinks',
            title: 'Enlaces del Footer',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'title', title: 'Título', type: 'string' },
                        {
                            name: 'path',
                            title: 'Ruta',
                            type: 'string',
                            options: {
                                list: [
                                    { title: 'Inicio', value: '/' },
                                    { title: 'Compra un auto', value: '/catalogo' },
                                    { title: 'Sedes', value: '/sedes' },
                                    { title: 'Preguntas frecuentes', value: '/faq' },
                                    { title: 'Contacto', value: '/contacto' },
                                ]
                            }
                        }
                    ]
                }
            ]
        },
        {
            name: 'footerTagline',
            title: 'Frase final del Footer',
            type: 'string',
            description: 'Ejemplo: TRANSFORMA TU CAMINO'
        }
    ]
}