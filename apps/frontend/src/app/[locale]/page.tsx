'use client';
import { DemoCard } from './components/DemoCard';
import { Hero } from './components/Hero';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('main');

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-background px-8 pt-6">
      <div className="w-full max-w-5xl text-center">
        <Hero />
        <div className="mt-8 grid grid-cols-1 gap-6 pb-10 sm:grid-cols-2">
          <DemoCard href="/upload" title={t('uploadDemoTitle')} description={t('uploadDemoDesc')} />
          <DemoCard href="/chat" title={t('chatDemoTitle')} description={t('chatDemoDesc')} />
          <DemoCard href="/email" title={t('emailDemoTitle')} description={t('emailDemoDesc')} />
          <DemoCard
            href="/invoices"
            title={t('invoicesDemoTitle')}
            description={t('invoicesDemoDesc')}
          />
          <DemoCard
            href="/leaderboard"
            title={t('leaderboardDemoTitle')}
            description={t('leaderboardDemoDesc')}
          />
        </div>
      </div>
    </main>
  );
}
