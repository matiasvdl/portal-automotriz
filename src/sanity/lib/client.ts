import { createClient } from 'next-sanity'
import { apiVersion, dataset, projectId } from '../env'

// Cliente para LEER datos (Público y Seguro)
export const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-12',
  useCdn: false,
})

// Cliente para ESCRIBIR datos (Privado y Protegido)
// ⚠️ Este cliente ahora solo funcionará en archivos que corran en el servidor
export const writeClient = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID,
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET,
  apiVersion: '2024-03-12',
  useCdn: false,
  token: process.env.SANITY_WRITE_TOKEN,
})