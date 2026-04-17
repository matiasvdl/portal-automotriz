// src/sanity/schemaTypes/siteConfig.ts

export const siteConfig = {
    name: 'siteConfig',
    title: 'Configuración del Sitio',
    type: 'document',
    fields: [
        {
            name: 'siteName',
            title: 'Nombre de la Empresa',
            type: 'string',
            initialValue: 'VDL MOTORS',
        },
        {
            name: 'siteUrl',
            title: 'URL del Sitio (Dominio)',
            type: 'string',
            description: 'Ejemplo: dominio.cl (sin https:// si prefieres)',
        },
        {
            name: 'branchesPageEnabled',
            title: 'Página de Sucursales Activa',
            type: 'boolean',
            description: 'Activa o desactiva la página pública de sucursales.',
            initialValue: false,
        },
        {
            name: 'maintenanceMode',
            title: 'Modo Mantenimiento',
            type: 'boolean',
            description: 'Si está activo, el sitio mostrará una página de mantenimiento',
            initialValue: false,
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
                                    { title: 'Sucursales', value: '/sucursales' },
                                    { title: 'Preguntas Frecuentes', value: '/faq' },
                                    { title: 'Términos y Condiciones', value: '/terminos' },
                                    { title: 'Contacto', value: '/contacto' },
                                ],
                            },
                        },
                    ],
                },
            ],
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
                                    { title: 'Sucursales', value: '/sucursales' },
                                    { title: 'Preguntas Frecuentes', value: '/faq' },
                                    { title: 'Términos y Condiciones', value: '/terminos' },
                                    { title: 'Contacto', value: '/contacto' },
                                ],
                            },
                        },
                    ],
                },
            ],
        },
        {
            name: 'footerTagline',
            title: 'Frase final del Footer',
            type: 'string',
            description: 'Ejemplo: TRANSFORMA TU CAMINO',
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
                { name: 'vender', title: 'Descripción Vende tu Auto', type: 'text', rows: 2 },
                { name: 'financiamiento', title: 'Descripción Financiamiento', type: 'text', rows: 2 },
                { name: 'sucursales', title: 'Descripción Sucursales', type: 'text', rows: 2 },
                { name: 'contacto', title: 'Descripción Contacto', type: 'text', rows: 2 },
                { name: 'faq', title: 'Descripción FAQ', type: 'text', rows: 2 },
                { name: 'terminos', title: 'Descripción Términos y Condiciones', type: 'text', rows: 2 },
            ],
        },
        {
            name: 'defaultLocation',
            title: 'Ubicación por Defecto',
            type: 'string',
            initialValue: '',
        },
        {
            name: 'homeContent',
            title: 'Contenido Inicio',
            type: 'object',
            fields: [
                { name: 'featuredTitle', title: 'Título Autos Destacados', type: 'string' },
                { name: 'reviewsTitle', title: 'Título Reseñas', type: 'string' },
            ],
        },
        {
            name: 'catalogContent',
            title: 'Contenido Catálogo y Detalle',
            type: 'object',
            fields: [
                { name: 'recommendedTitle', title: 'Título Vehículos Recomendados', type: 'string' },
                { name: 'whatsappLabel', title: 'Texto CTA WhatsApp', type: 'string' },
            ],
        },
        {
            name: 'faqContent',
            title: 'Contenido FAQ',
            type: 'object',
            fields: [
                { name: 'ctaTitle', title: 'Título tarjeta lateral', type: 'string' },
                { name: 'ctaDescription', title: 'Descripción tarjeta lateral', type: 'text', rows: 3 },
                { name: 'ctaButtonLabel', title: 'Texto botón lateral', type: 'string' },
                { name: 'trustTitle', title: 'Título sello de confianza', type: 'string' },
                { name: 'trustSubtitle', title: 'Subtítulo sello de confianza', type: 'string' },
            ],
        },
        {
            name: 'sellContent',
            title: 'Contenido Vende tu Auto',
            type: 'object',
            fields: [
                { name: 'eyebrow', title: 'Bajada superior', type: 'string' },
                { name: 'title', title: 'Título principal', type: 'string' },
                {
                    name: 'steps',
                    title: 'Pasos / Cómo funciona',
                    type: 'array',
                    of: [
                        {
                            type: 'object',
                            fields: [
                                { name: 'title', title: 'Título', type: 'string' },
                                { name: 'description', title: 'Descripción', type: 'text', rows: 2 },
                            ],
                        },
                    ],
                },
                { name: 'trustTitle', title: 'Título bloque inferior', type: 'string' },
                { name: 'trustSubtitle', title: 'Subtítulo bloque inferior', type: 'string' },
            ],
        },
        {
            name: 'financeContent',
            title: 'Contenido Financiamiento',
            type: 'object',
            fields: [
                { name: 'eyebrow', title: 'Bajada superior', type: 'string' },
                { name: 'title', title: 'Título principal', type: 'string' },
                { name: 'requirementsTitle', title: 'Título requisitos', type: 'string' },
                { name: 'whatsappLabel', title: 'Texto CTA WhatsApp', type: 'string' },
                { name: 'digitalTitle', title: 'Texto evaluación digital', type: 'string' },
                { name: 'trustTitle', title: 'Título bloque inferior', type: 'string' },
                { name: 'trustSubtitle', title: 'Subtítulo bloque inferior', type: 'string' },
            ],
        },
        {
            name: 'maintenanceContent',
            title: 'Contenido Mantenimiento',
            type: 'object',
            fields: [
                { name: 'eyebrow', title: 'Bajada superior', type: 'string' },
                { name: 'title', title: 'Título principal', type: 'string' },
                { name: 'message', title: 'Mensaje principal', type: 'text', rows: 3 },
                { name: 'contactLabel', title: 'Etiqueta contacto', type: 'string' },
                { name: 'contactEmail', title: 'Correo mostrado', type: 'string' },
                { name: 'footerText', title: 'Texto pie de página', type: 'string' },
            ],
        },
        {
            name: 'branchesContent',
            title: 'Contenido Sucursales',
            type: 'object',
            fields: [
                { name: 'eyebrow', title: 'Bajada superior', type: 'string' },
                { name: 'title', title: 'Título principal', type: 'string' },
                { name: 'description', title: 'Descripción', type: 'text', rows: 3 },
            ],
        },
        {
            name: 'branches',
            title: 'Sucursales',
            type: 'array',
            of: [
                {
                    type: 'object',
                    fields: [
                        { name: 'name', title: 'Nombre de la sucursal', type: 'string' },
                        { name: 'address', title: 'Dirección', type: 'text', rows: 2 },
                        { name: 'phone', title: 'Teléfono', type: 'string' },
                        {
                            name: 'daySchedules',
                            title: 'Horarios por día',
                            type: 'array',
                            of: [
                                {
                                    type: 'object',
                                    fields: [
                                        {
                                            name: 'day',
                                            title: 'Día',
                                            type: 'string',
                                            options: {
                                                list: [
                                                    { title: 'Lunes', value: 'lun' },
                                                    { title: 'Martes', value: 'mar' },
                                                    { title: 'Miércoles', value: 'mie' },
                                                    { title: 'Jueves', value: 'jue' },
                                                    { title: 'Viernes', value: 'vie' },
                                                    { title: 'Sábado', value: 'sab' },
                                                    { title: 'Domingo', value: 'dom' },
                                                ],
                                            },
                                        },
                                        { name: 'openTime', title: 'Abre', type: 'string' },
                                        { name: 'closeTime', title: 'Cierra', type: 'string' },
                                    ],
                                },
                            ],
                        },
                        {
                            name: 'workDays',
                            title: 'Días de atención',
                            type: 'array',
                            of: [{ type: 'string' }],
                            options: {
                                list: [
                                    { title: 'Lunes', value: 'lun' },
                                    { title: 'Martes', value: 'mar' },
                                    { title: 'Miércoles', value: 'mie' },
                                    { title: 'Jueves', value: 'jue' },
                                    { title: 'Viernes', value: 'vie' },
                                    { title: 'Sábado', value: 'sab' },
                                    { title: 'Domingo', value: 'dom' },
                                ],
                            },
                        },
                        { name: 'openTime', title: 'Hora de apertura', type: 'string' },
                        { name: 'closeTime', title: 'Hora de cierre', type: 'string' },
                        { name: 'hours', title: 'Resumen de horario', type: 'string' },
                    ],
                },
            ],
        },
    ],
}
