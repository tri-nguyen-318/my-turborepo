import createNextIntlPlugin from 'next-intl/plugin';

const withNextIntl = createNextIntlPlugin();

const nextConfig = {
  // any other Next.js config
};

export default withNextIntl(nextConfig);
