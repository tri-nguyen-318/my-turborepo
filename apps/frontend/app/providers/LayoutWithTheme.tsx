'use client';
import React from 'react';
import Link from 'next/link';
import { DarkModeToggle } from '@/components/ui/DarkModeToggle';
import { useDarkMode } from '@/components/ui/useDarkMode';
import { useTranslations } from 'next-intl';

function LayoutWithTheme({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const t = useTranslations('main');
  return (
    <>
      <header className="w-full border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold hover:underline text-primary">
            {t('title')}
          </Link>
          <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />
        </nav>
      </header>
      {children}
    </>
  );
}

export default LayoutWithTheme;
