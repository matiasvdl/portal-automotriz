// src/sanity/schemaTypes/adminProfile.ts
export default {
    name: 'adminProfile',
    title: 'Usuario Administrador',
    type: 'document',
    fields: [
        { name: 'firstName', title: 'Nombre', type: 'string' },
        { name: 'lastName', title: 'Apellido', type: 'string' },
        { name: 'username', title: 'Nombre de Usuario', type: 'string' },
        { name: 'email', title: 'Correo electrónico', type: 'string' },
        { name: 'phone', title: 'Teléfono', type: 'string' },
        {
            name: 'role',
            title: 'Cargo / Rol',
            type: 'string',
            options: {
                list: [
                    { title: 'Administrador Principal', value: 'Administrador Principal' },
                    { title: 'Administrador', value: 'Administrador' },
                    { title: 'Ventas', value: 'Ventas' } // Añadido aquí
                ],
                layout: 'dropdown'
            },
            initialValue: 'Administrador'
        },
        { name: 'password', title: 'Contraseña (Encriptada)', type: 'string', readOnly: true, hidden: true },
        { name: 'image', title: 'Foto de Perfil', type: 'image', options: { hotspot: true } },
        { name: 'lastLogin', title: 'Última Sesión', type: 'datetime' },
    ]
}