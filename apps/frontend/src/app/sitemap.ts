import type { MetadataRoute } from 'next';

const BASE_URL = 'https://yourdomain.com';
const locales = ['en', 'vi'];

const publicRoutes = [
  { path: '', priority: 1.0, changeFrequency: 'weekly' as const },
  { path: '/tictactoe', priority: 0.8, changeFrequency: 'monthly' as const },
  { path: '/upload', priority: 0.7, changeFrequency: 'monthly' as const },
  { path: '/invoices', priority: 0.7, changeFrequency: 'monthly' as const },
];

export default function sitemap(): MetadataRoute.Sitemap {
  return publicRoutes.flatMap(({ path, priority, changeFrequency }) =>
    locales.map(locale => ({
      url: `${BASE_URL}/${locale}${path}`,
      lastModified: new Date(),
      changeFrequency,
      priority,
    })),
  );
}
