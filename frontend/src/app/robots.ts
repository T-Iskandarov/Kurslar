import { MetadataRoute } from 'next';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: {
      userAgent: '*',
      allow: '/',
      disallow: ['/admin/', '/profile/', '/lessons/'], // We don't want bots to index internal restricted pages
    },
    sitemap: 'https://kurslarim.uz/sitemap.xml',
  };
}
