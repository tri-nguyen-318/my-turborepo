import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Books',
  description: 'Manage and browse your book collection. Create, edit, and delete books.',
  robots: { index: false, follow: false },
};

export default function BooksLayout({ children }: { children: React.ReactNode }) {
  return children;
}
