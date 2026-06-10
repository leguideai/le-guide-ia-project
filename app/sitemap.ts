import { type MetadataRoute } from 'next'

export default function sitemap(): MetadataRoute.Sitemap {
  return [
    {
      url: 'https://leguideai.com',
      lastModified: new Date(),
    },
  ]
}
