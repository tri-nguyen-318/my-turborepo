import Link from 'next/link';
import { ArrowRight, type LucideIcon } from 'lucide-react';

interface DemoCardProps {
  href: string;
  title: string;
  description: string;
  icon: LucideIcon;
  accent: string; // tailwind bg color class for icon bg, e.g. "bg-blue-500/10"
  iconColor: string; // tailwind text color class, e.g. "text-blue-500"
}

export function DemoCard({
  href,
  title,
  description,
  icon: Icon,
  accent,
  iconColor,
}: DemoCardProps) {
  return (
    <Link
      href={href}
      className="group relative flex flex-col gap-4 overflow-hidden rounded-xl border border-border/60 bg-card p-6 shadow-sm transition-all duration-200 hover:-translate-y-0.5 hover:border-border hover:shadow-md"
    >
      {/* icon badge */}
      <div className={`flex h-11 w-11 items-center justify-center rounded-lg ${accent}`}>
        <Icon className={`h-5 w-5 ${iconColor}`} />
      </div>

      <div className="flex-1 space-y-1.5">
        <h2 className="text-base font-semibold tracking-tight">{title}</h2>
        <p className="text-sm leading-relaxed text-muted-foreground">{description}</p>
      </div>

      <div
        className={`flex items-center gap-1 text-xs font-medium ${iconColor} opacity-0 transition-opacity duration-200 group-hover:opacity-100`}
      >
        Explore
        <ArrowRight className="h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5" />
      </div>

      {/* subtle top accent line */}
      <span className={`absolute inset-x-0 top-0 h-px ${accent.replace('/10', '/60')}`} />
    </Link>
  );
}
