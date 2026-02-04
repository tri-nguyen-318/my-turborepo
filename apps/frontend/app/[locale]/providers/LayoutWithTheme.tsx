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

import { Button } from '@/components/ui/button';
import { useAuth } from './AuthProvider';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';

function LayoutWithTheme({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const t = useTranslations('main');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout } = useAuth();
  console.log("🚀 ~ LayoutWithTheme ~ user:", user)
  
  const handleLangChange = React.useCallback((nextLocale: string) => {
    const path = pathname.replace(/^\/[a-zA-Z-]+/, '');
    router.replace(`/${nextLocale}${path}`);
  }, [pathname, router]);
  return (
    <>
      <header className="w-full border-b bg-background/95 backdrop-blur sticky top-0 z-10">
        <nav className="max-w-4xl mx-auto flex items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold hover:underline text-primary">
            {t('title')}
          </Link>
          <div className="flex items-center gap-4">
            {isAuthenticated ? (

               <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <Avatar className="h-8 w-8">
                      <AvatarImage src={user?.avatarUrl || ''} alt={user?.name || user?.email || 'User'} />
                      <AvatarFallback>{(user?.name || user?.email || 'U').charAt(0).toUpperCase()}</AvatarFallback>
                    </Avatar>
                    <span className="text-sm font-medium hidden sm:inline-block">{user?.name || user?.email}</span>
                  </div>
                  <Button variant="outline" size="sm" onClick={logout}>
                    Logout
                  </Button>
               </div>
            ) : (
              <div className="flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/signin">Sign In</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">Sign Up</Link>
                </Button>
              </div>
            )}
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
