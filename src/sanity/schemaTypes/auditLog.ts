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
        {
            name: 'metadata',
            title: 'Metadatos',
            type: 'object',
            fields: [
                { name: 'requestIdentifier', title: 'Identificador de solicitud', type: 'string' },
                { name: 'matched', title: 'Coincidencia encontrada', type: 'boolean' },
                { name: 'submittedIdentifier', title: 'Identificador enviado', type: 'string' },
                { name: 'fullName', title: 'Nombre completo', type: 'string' },
                { name: 'contactEmail', title: 'Correo de contacto', type: 'string' },
                { name: 'phone', title: 'Teléfono', type: 'string' },
                { name: 'role', title: 'Rol', type: 'string' },
                { name: 'deletedRole', title: 'Rol eliminado', type: 'string' },
                { name: 'deletedCount', title: 'Cantidad eliminada', type: 'number' },
                { name: 'updatedOwnProfile', title: 'Actualizó su propio perfil', type: 'boolean' },
            ],
        },
    ],
    orderings: [
        {
            title: 'Más reciente',
            name: 'eventAtDesc',
            by: [{ field: 'eventAt', direction: 'desc' }],
        },
    ],
}
