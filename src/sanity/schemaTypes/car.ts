import {defineField, defineType} from 'sanity'

export const car = defineType({
  name: 'car',
  title: 'Auto',
  type: 'document',
  fields: [
    defineField({name: 'make', title: 'Marca', type: 'string'}),
    defineField({name: 'model', title: 'Modelo', type: 'string'}),
    defineField({name: 'year', title: 'Año', type: 'number'}),
    defineField({name: 'price', title: 'Precio', type: 'number'}),
    defineField({
      name: 'images',
      title: 'Imágenes',
      type: 'array',
      of: [{type: 'image'}],
    }),
    defineField({
      name: 'description',
      title: 'Descripción',
      type: 'text',
    }),
    defineField({
      name: 'slug',
      title: 'Slug',
      type: 'slug',
      options: {source: (doc: any) => `${doc.make}-${doc.model}-${doc.year}`},
    }),
  ],
  preview: {
    select: {
      title: 'make',
      subtitle: 'model',
      media: 'images.0',
    },
  },
})
