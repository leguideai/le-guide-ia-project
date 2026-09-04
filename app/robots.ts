import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/superadmin/', '/dashboard/', '/api/', '/checkout/success/'],
    },
    sitemap: 'https://leguideai.com/sitemap.xml',
  }
}
