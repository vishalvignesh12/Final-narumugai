import { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/my-account',
          '/checkout',
          '/cart',
          '/orders',
          '/profile',
        ],
      },
      {
        userAgent: 'Googlebot',
        allow: '/',
        disallow: [
          '/admin',
          '/api/',
          '/my-account',
          '/checkout',
          '/cart',
          '/orders',
          '/profile',
        ],
      },
    ],
    sitemap: 'https://narumugai.com/sitemap.xml',
  }
}