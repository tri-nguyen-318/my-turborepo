import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Invoices',
  description: 'Manage, create, and pay invoices. Export to CSV and track payment status.',
  robots: { index: false, follow: false },
};

export default function InvoicesLayout({ children }: { children: React.ReactNode }) {
  return children;
}
