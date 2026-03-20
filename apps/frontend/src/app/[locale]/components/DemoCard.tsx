import Link from 'next/link';
import { ReactNode } from 'react';

interface DemoCardProps {
  href: string;
  title: ReactNode;
  description: ReactNode;
}

export function DemoCard({ href, title, description }: DemoCardProps) {
  return (
    <Link href={href} className="block rounded-lg border p-6 shadow transition hover:bg-accent">
      <h2 className="mb-2 text-2xl font-semibold">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </Link>
  );
}
