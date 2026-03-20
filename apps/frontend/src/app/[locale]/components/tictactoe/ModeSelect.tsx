import { useTranslations } from 'next-intl';
import { Bot, Users } from 'lucide-react';

type Mode = 'ai' | 'online';

interface ModeSelectProps {
  onSelect: (mode: Mode) => void;
}

export function ModeSelect({ onSelect }: ModeSelectProps) {
  const t = useTranslations('tictactoe');

  const modes: { key: Mode; icon: React.ReactNode; label: string; desc: string }[] = [
    {
      key: 'ai',
      icon: <Bot className="h-8 w-8" />,
      label: t('vsAI'),
      desc: t('vsAIDesc'),
    },
    {
      key: 'online',
      icon: <Users className="h-8 w-8" />,
      label: t('vsPlayer'),
      desc: t('vsPlayerDesc'),
    },
  ];

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        {modes.map(({ key, icon, label, desc }) => (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className="group flex flex-col items-center gap-3 rounded-xl border-2 border-border bg-card p-8 text-center transition-all duration-150 hover:-translate-y-0.5 hover:border-primary hover:shadow-md"
          >
            <span className="flex h-16 w-16 items-center justify-center rounded-full bg-primary/10 text-primary transition-colors group-hover:bg-primary group-hover:text-primary-foreground">
              {icon}
            </span>
            <span className="text-lg font-semibold">{label}</span>
            <span className="text-sm text-muted-foreground">{desc}</span>
          </button>
        ))}
      </div>
    </div>
  );
}
