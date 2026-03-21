import { defineRouting } from 'next-intl/routing';

export const routing = defineRouting({
  locales: ['en', 'vi', 'jp'],
  defaultLocale: 'en',
});
