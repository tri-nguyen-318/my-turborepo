'use client';
import { Upload, MessageCircle, Mail, FileText, Trophy } from 'lucide-react';
import { DemoCard } from './components/DemoCard';
import { Hero } from './components/Hero';
import { useTranslations } from 'next-intl';

export default function Home() {
  const t = useTranslations('main');

  return (
    <main className="flex min-h-screen flex-col items-center justify-start bg-background px-8 pt-6">
      <div className="w-full max-w-5xl text-center">
        <Hero />
        <div className="mt-8 grid grid-cols-1 gap-4 pb-10 sm:grid-cols-2 lg:grid-cols-3">
          <DemoCard
            href="/upload"
            title={t('uploadDemoTitle')}
            description={t('uploadDemoDesc')}
            icon={Upload}
            accent="bg-blue-500/10"
            iconColor="text-blue-500"
          />
          <DemoCard
            href="/chat"
            title={t('chatDemoTitle')}
            description={t('chatDemoDesc')}
            icon={MessageCircle}
            accent="bg-green-500/10"
            iconColor="text-green-500"
          />
          <DemoCard
            href="/email"
            title={t('emailDemoTitle')}
            description={t('emailDemoDesc')}
            icon={Mail}
            accent="bg-purple-500/10"
            iconColor="text-purple-500"
          />
          <DemoCard
            href="/invoices"
            title={t('invoicesDemoTitle')}
            description={t('invoicesDemoDesc')}
            icon={FileText}
            accent="bg-orange-500/10"
            iconColor="text-orange-500"
          />
          <DemoCard
            href="/leaderboard"
            title={t('leaderboardDemoTitle')}
            description={t('leaderboardDemoDesc')}
            icon={Trophy}
            accent="bg-yellow-500/10"
            iconColor="text-yellow-500"
          />
        </div>
      </div>
    </main>
  );
}
