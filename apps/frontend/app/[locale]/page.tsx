'use client';
import { DemoCard } from './components/DemoCard';
import { useTranslations } from 'next-intl';
import { useAuth } from './providers/AuthProvider';

export default function Home() {
  const t = useTranslations('main');
  const { isAuthenticated } = useAuth();

  return (
    <main className="min-h-screen flex flex-col items-center justify-center bg-background p-8">
      <div className="max-w-2xl w-full text-center">
        <h1 className="text-4xl font-bold mb-4">{t('title')}</h1>
        <p className="mb-8 text-muted-foreground">{t('welcome')}</p>
        
        {isAuthenticated ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
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
        ) : (
          <div className="p-6 border rounded-lg bg-card text-card-foreground shadow-sm">
            <p className="text-lg mb-4">Please sign in to access the features.</p>
          </div>
        )}
      </div>
    </main>
  );
}
