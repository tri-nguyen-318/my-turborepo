'use client';
import { Upload, Mail, FileText, Gamepad2 } from 'lucide-react';
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
            href="/tictactoe"
            title={t('tictactoeDemoTitle')}
            description={t('tictactoeDemoDesc')}
            icon={Gamepad2}
            accent="bg-pink-500/10"
            iconColor="text-pink-500"
          />
          <DemoCard
            href="/upload"
            title={t('uploadDemoTitle')}
            description={t('uploadDemoDesc')}
            icon={Upload}
            accent="bg-blue-500/10"
            iconColor="text-blue-500"
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
        </div>
      </div>
    </main>
  );
}
