import type { Metadata } from 'next';
import { NextIntlClientProvider } from 'next-intl';
import { getMessages } from 'next-intl/server';
import { Geist, Geist_Mono } from 'next/font/google';
import { ReactQueryProvider } from './providers/ReactQueryProvider';
import LayoutWithTheme from './providers/LayoutWithTheme';
import { AuthProvider } from './providers/AuthProvider';
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

export const metadata: Metadata = {
  title: {
    default: 'My TurboRepo App',
    template: '%s | My TurboRepo App',
  },
  description: 'A modern web application built with Next.js, TurboRepo, and NestJS.',
  keywords: ['Next.js', 'TurboRepo', 'NestJS', 'React', 'TypeScript', 'Email', 'Upload', 'Chat'],
  openGraph: {
    title: 'My TurboRepo App',
    description: 'A modern web application built with Next.js, TurboRepo, and NestJS.',
    type: 'website',
    locale: 'en_US',
    siteName: 'My TurboRepo App',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'My TurboRepo App',
    description: 'A modern web application built with Next.js, TurboRepo, and NestJS.',
  },
  metadataBase: new URL('https://yourdomain.com'),
  robots: {
    index: true,
    follow: true,
    nocache: false,
  },
};

export default async function RootLayout({
  children,
  params,
}: {
  children: React.ReactNode;
  params: Promise<{ locale: string }>;
}) {
  // ✅ DO NOT pass locale here
  const messages = await getMessages();

  const { locale } = await params;
  if (!hasLocale(routing.locales, locale)) {
    notFound();
  }

  return (
    <html lang={locale}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
        {/* Structured Data Example */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            '@context': 'https://schema.org',
            '@type': 'Organization',
            name: 'My TurboRepo App',
            url: 'https://yourdomain.com',
            logo: 'https://yourdomain.com/logo.png',
            sameAs: [
              'https://github.com/yourrepo',
            ],
          }),
        }} />
      </head>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased flex flex-col h-screen`}
      >
        <NextIntlClientProvider locale={locale} messages={messages}>
          <LayoutWithTheme>
            <ReactQueryProvider>
              <AuthProvider>
                {children}
                <Toaster richColors position="top-center" />
              </AuthProvider>
            </ReactQueryProvider>
          </LayoutWithTheme>
        </NextIntlClientProvider>
      </body>
    </html>
  );
}
