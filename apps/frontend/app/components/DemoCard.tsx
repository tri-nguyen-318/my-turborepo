import Link from 'next/link';
import { ReactNode } from 'react';

interface DemoCardProps {
  href: string;
  title: ReactNode;
  description: ReactNode;
}

export function DemoCard({ href, title, description }: DemoCardProps) {
  return (
    <Link href={href} className="block p-6 rounded-lg border shadow hover:bg-accent transition">
      <h2 className="text-2xl font-semibold mb-2">{title}</h2>
      <p className="text-muted-foreground">{description}</p>
    </Link>
  );
}
