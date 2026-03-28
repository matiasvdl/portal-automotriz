import { type SchemaTypeDefinition } from 'sanity'
import { car } from './car'
import { review } from './review'
import { siteConfig } from './siteConfig'
import { contact } from './contact'
import { faq } from './faq'

export const schema: { types: SchemaTypeDefinition[] } = {
  types: [car, review, siteConfig, contact, faq],
}