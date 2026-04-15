// src/sanity/schemaTypes/siteConfig.ts

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
                                    { title: 'Preguntas Frecuentes', value: '/faq' },
                                    { title: 'Terminos y Condiciones', value: '/terminos' },
                                    { title: 'Contacto', value: '/contacto' }
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
                                    { title: 'Comprar un Auto', value: '/catalogo' },
                                    { title: 'Vende tu Auto', value: '/vender' },
                                    { title: 'Financiamiento', value: '/financiamiento' },
                                    { title: 'Preguntas Frecuentes', value: '/faq' },
                                    { title: 'Terminos y Condiciones', value: '/terminos' },
                                    { title: 'Contacto', value: '/contacto' }
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
        },
        {
            name: 'whatsappNumber',
            title: 'Número de WhatsApp (Soporte Admin)',
            type: 'string',
        },
        {
            name: 'supportMessage',
            title: 'Mensaje de Soporte',
            type: 'string',
        },
        {
            name: 'termsAndConditions',
            title: 'Términos y Condiciones',
            type: 'text',
            rows: 15,
        },
        {
            name: 'lastLegalUpdate',
            title: 'Última actualización legal',
            type: 'date',
        },
        {
            name: 'seoDescriptions',
            title: 'Descripciones SEO por Página',
            type: 'object',
            fields: [
                { name: 'home', title: 'Descripción Inicio', type: 'text', rows: 2 },
                { name: 'catalogo', title: 'Descripción Catálogo', type: 'text', rows: 2 },
                { name: 'vender', title: 'Descripción Vender', type: 'text', rows: 2 },
                { name: 'financiamiento', title: 'Descripción Financiamiento', type: 'text', rows: 2 },
                { name: 'contacto', title: 'Descripción Contacto', type: 'text', rows: 2 },
                { name: 'faq', title: 'Descripción FAQ', type: 'text', rows: 2 },
                { name: 'terminos', title: 'Descripción Términos y Condiciones', type: 'text', rows: 2 },
            ]
        }
    ]
}