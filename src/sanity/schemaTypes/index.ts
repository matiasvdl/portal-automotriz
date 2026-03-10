import { type SchemaTypeDefinition } from 'sanity'
import { car } from './car'
import { review } from './review'
import { siteConfig } from './siteConfig'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [car, review, siteConfig],
}