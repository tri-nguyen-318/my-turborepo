import type { MetadataRoute } from 'next';

const BASE_URL = 'https://yourdomain.com';

export default function robots(): MetadataRoute.Robots {
  return {
    rules: [
      {
        userAgent: '*',
        allow: '/',
        disallow: ['/en/signin', '/vi/signin', '/en/signup', '/vi/signup'],
      },
    ],
    sitemap: `${BASE_URL}/sitemap.xml`,
  };
}
