'use client';
import React from 'react';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useDarkMode } from '@/components/ui/useDarkMode';
import { useTranslations, useLocale } from 'next-intl';
import { useRouter, usePathname } from 'next/navigation';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

function LayoutWithTheme({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const t = useTranslations('main');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const handleLangChange = (nextLocale: string) => {
    const path = pathname.replace(/^\/[a-zA-Z-]+/, '');
    router.replace(`/${nextLocale}${path}`);
  };
  return (
    <>
      <header className="w-full border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold hover:underline text-primary">
            {t('title')}
          </Link>
          <div className="flex items-center gap-4">
            <Select value={locale} onValueChange={handleLangChange}>
              <SelectTrigger className="w-[120px]" aria-label={t('selectLanguage')}>
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('langEn')}</SelectItem>
                <SelectItem value="vi">{t('langVi')}</SelectItem>
              </SelectContent>
            </Select>
            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}

export default LayoutWithTheme;
