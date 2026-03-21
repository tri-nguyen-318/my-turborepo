import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import LayoutWithTheme from './providers/LayoutWithTheme';
import { ReduxProvider } from './providers/ReduxProvider';
import { hasLocale } from 'next-intl';
import { notFound } from 'next/navigation';
import { routing } from '@/i18n/routing';
import { Toaster } from 'sonner';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

const BASE_URL = 'https://yourdomain.com';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const ogLocale = locale === 'vi' ? 'vi_VN' : 'en_US';

  return {
    metadataBase: new URL(BASE_URL),
    title: {
      default: "Tri's Portfolio",
      template: "%s | Tri's Portfolio",
    },
    description: 'A modern web application built with Next.js, TurboRepo, and NestJS.',
    keywords: ['Next.js', 'TurboRepo', 'NestJS', 'React', 'TypeScript', 'Upload', 'Invoices'],
    alternates: {
      canonical: `${BASE_URL}/${locale}`,
      languages: {
        en: `${BASE_URL}/en`,
        vi: `${BASE_URL}/vi`,
      },
    },
    openGraph: {
      title: "Tri's Portfolio",
      description: 'A modern web application built with Next.js, TurboRepo, and NestJS.',
      type: 'website',
      locale: ogLocale,
      alternateLocale: locale === 'vi' ? 'en_US' : 'vi_VN',
      siteName: "Tri's Portfolio",
      url: `${BASE_URL}/${locale}`,
    },
    twitter: {
      card: 'summary_large_image',
      title: "Tri's Portfolio",
      description: 'A modern web application built with Next.js, TurboRepo, and NestJS.',
    },
    icons: {
      icon: '/favicon.ico',
    },
    robots: {
      index: true,
      follow: true,
    },
  };
}

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  const messages = await getMessages();

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{
            __html: JSON.stringify({
              '@context': 'https://schema.org',
              '@type': 'Organization',
              name: "Tri's Portfolio",
              url: BASE_URL,
              logo: `${BASE_URL}/logo.png`,
              sameAs: ['https://github.com/yourrepo'],
            }),
          }}
        />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} flex h-screen flex-col antialiased`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <ReduxProvider>
            <LayoutWithTheme>
              <ReactQueryProvider>
                {children}
                <Toaster richColors position="top-center" />
              </ReactQueryProvider>
            </LayoutWithTheme>
          </ReduxProvider>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
