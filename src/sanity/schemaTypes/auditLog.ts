export const auditLog = {
    name: 'auditLog',
    title: 'Registro de Actividad',
    type: 'document',
    fields: [
        {
            name: 'admin',
            title: 'Usuario',
            type: 'reference',
            to: [{ type: 'adminProfile' }],
        },
        { name: 'adminName', title: 'Nombre de usuario', type: 'string' },
        { name: 'adminEmail', title: 'Correo', type: 'string' },
        { name: 'action', title: 'Acción', type: 'string' },
        {
            name: 'entityType',
            title: 'Tipo de entidad',
            type: 'string',
            options: {
                list: [
                    { title: 'Autenticación', value: 'auth' },
                    { title: 'Usuario', value: 'usuario' },
                    { title: 'Vehículo', value: 'vehiculo' },
                    { title: 'Preferencias', value: 'preferencias' },
                    { title: 'Contenido', value: 'contenido' },
                    { title: 'Marca', value: 'marca' },
                ],
            },
        },
        { name: 'entityId', title: 'ID entidad', type: 'string' },
        { name: 'entityTitle', title: 'Título entidad', type: 'string' },
        { name: 'message', title: 'Descripción', type: 'text', rows: 3 },
        { name: 'eventAt', title: 'Fecha del evento', type: 'datetime' },
        { name: 'metadata', title: 'Metadatos', type: 'object' },
    ],
    orderings: [
        {
            title: 'Más reciente',
            name: 'eventAtDesc',
            by: [{ field: 'eventAt', direction: 'desc' }],
        },
    ],
}
