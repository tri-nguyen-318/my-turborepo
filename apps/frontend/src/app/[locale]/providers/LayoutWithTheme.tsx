'use client';
import React, { useEffect } from 'react';
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
import { useAuth } from '@/hooks/useAuth';
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { LogOut } from 'lucide-react';
import { useDispatch } from 'react-redux';
import { setCredentials, setAccessToken, clearCredentials } from '@/store/authSlice';
import { useRefreshTokenMutation, useLazyGetProfileQuery } from '@/store/api/authApi';

function LayoutWithTheme({ children }: { children: React.ReactNode }) {
  const { darkMode, toggleDarkMode } = useDarkMode();
  const t = useTranslations('main');
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();
  const { user, isAuthenticated, logout, loading } = useAuth();
  const dispatch = useDispatch();
  const [refreshToken] = useRefreshTokenMutation();
  const [getProfile] = useLazyGetProfileQuery();

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const { access_token } = await refreshToken().unwrap();
        dispatch(setAccessToken(access_token));
        const userData = await getProfile(undefined, true).unwrap();
        dispatch(setCredentials({ user: userData, accessToken: access_token }));
      } catch {
        dispatch(clearCredentials());
      }
    };
    checkAuth();
  }, []);

  const handleLangChange = React.useCallback(
    (nextLocale: string) => {
      const path = pathname.replace(/^\/[a-zA-Z-]+/, '');
      router.replace(`/${nextLocale}${path}`);
    },
    [pathname, router],
  );
  return (
    <>
      <header className="sticky top-0 z-10 w-full border-b bg-background/95 backdrop-blur">
        <nav className="mx-auto flex max-w-5xl items-center justify-between p-4">
          <Link href="/" className="text-xl font-bold text-primary hover:underline">
            {t('title')}
          </Link>

          <div className="flex items-center gap-2">
            <Select value={locale} onValueChange={handleLangChange}>
              <SelectTrigger className="w-32" aria-label={t('selectLanguage')}>
                <SelectValue placeholder={t('selectLanguage')} />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="en">{t('langEn')}</SelectItem>
                <SelectItem value="vi">{t('langVi')}</SelectItem>
              </SelectContent>
            </Select>

            <DarkModeToggle darkMode={darkMode} onToggle={toggleDarkMode} />

            {loading ? (
              <div className="h-8 w-8 animate-pulse rounded-full bg-muted" />
            ) : isAuthenticated ? (
              <Popover>
                <PopoverTrigger asChild>
                  <button className="rounded-full focus:outline-none focus-visible:ring-2 focus-visible:ring-ring">
                    <Avatar className="h-8 w-8 cursor-pointer">
                      <AvatarImage
                        src={user?.avatarUrl || ''}
                        alt={user?.name || user?.email || 'User'}
                      />
                      <AvatarFallback>
                        {(user?.name || user?.email || 'U').charAt(0).toUpperCase()}
                      </AvatarFallback>
                    </Avatar>
                  </button>
                </PopoverTrigger>
                <PopoverContent className="w-52 p-2" align="end">
                  <div className="mb-1 px-2 py-1.5">
                    {user?.name && <p className="truncate text-sm font-medium">{user.name}</p>}
                    <p className="truncate text-xs text-muted-foreground">{user?.email}</p>
                  </div>
                  <div className="my-1 border-t" />
                  <Button
                    variant="ghost"
                    size="sm"
                    className="w-full justify-start gap-2 text-destructive hover:text-destructive"
                    onClick={logout}
                  >
                    <LogOut className="h-4 w-4" />
                    {t('logout')}
                  </Button>
                </PopoverContent>
              </Popover>
            ) : (
              <div className="ml-2 flex items-center gap-2">
                <Button variant="ghost" size="sm" asChild>
                  <Link href="/signin">{t('signIn')}</Link>
                </Button>
                <Button size="sm" asChild>
                  <Link href="/signup">{t('signUp')}</Link>
                </Button>
              </div>
            )}
          </div>
        </nav>
      </header>
      {children}
    </>
  );
}

export default LayoutWithTheme;
