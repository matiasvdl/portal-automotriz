import { type SchemaTypeDefinition } from 'sanity' // Importamos el tipo SchemaTypeDefinition para tipar nuestro esquema
import { car } from './car' // Importamos el esquema de car
import { review } from './review' // Importamos los esquemas de car y review
import { siteConfig } from './siteConfig' // Agregamos el nuevo esquema de configuración del sitio
import { contact } from './contact' // Agregamos el nuevo esquema de configuración de contacto
import { faq } from './faq' // Agregamos el nuevo esquema de FAQ
import { appearance } from './appearance' // Importamos el nuevo esquema de apariencia
import adminProfile from './adminProfile' // Importamos el nuevo esquema de adminProfile
import { brand } from './brand' // Importamos el nuevo esquema de base de datos de marcas y modelos
import { auditLog } from './auditLog'

export const schema: { types: SchemaTypeDefinition[] } = { // Exportamos un objeto con la propiedad types, que es un arreglo de SchemaTypeDefinition
  types: [
    car, // Agregamos car al arreglo de tipos
    review, // Agregamos review al arreglo de tipos
    brand, // Agregamos brand al arreglo de tipos
    siteConfig, // Agregamos siteConfig al arreglo de tipos
    contact, // Agregamos contact al arreglo de tipos
    faq, // Agregamos faq al arreglo de tipos
    appearance, // Agregamos appearance al arreglo de tipos
    adminProfile, // Agregamos adminProfile al arreglo de tipos
    auditLog
  ],
}
