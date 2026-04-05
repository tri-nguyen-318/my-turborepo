import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Sign In',
  description: 'Sign in to your account with email and password or Google.',
  robots: { index: false, follow: false },
};

export default function SigninLayout({ children }: { children: React.ReactNode }) {
  return children;
}
