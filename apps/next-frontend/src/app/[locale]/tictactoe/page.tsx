'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { GamepadIcon } from 'lucide-react';
import { ModeSelect } from '../components/tictactoe/ModeSelect';
import { AIGame } from '../components/tictactoe/AIGame';
import { OnlineGame } from '../components/tictactoe/OnlineGame';

type Mode = 'ai' | 'online' | null;

export default function TicTacToePage() {
  const t = useTranslations('tictactoe');
  const [mode, setMode] = useState<Mode>(null);

  return (
    <div className="flex min-h-[calc(100vh-80px)] flex-col items-center justify-center p-6">
      <div className="w-full max-w-xl">
        {/* Header */}
        <div className="mb-8 flex flex-col items-center gap-2 text-center">
          <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-primary/10 text-primary">
            <GamepadIcon className="h-7 w-7" />
          </div>
          <h1 className="text-3xl font-bold tracking-tight">{t('title')}</h1>
          <p className="text-muted-foreground">
            {mode === null ? t('chooseMode') : mode === 'ai' ? t('vsAI') : t('vsPlayer')}
          </p>
        </div>

        <div className="rounded-2xl border border-border/60 bg-card p-8 shadow-sm">
          {mode === null && <ModeSelect onSelect={setMode} />}
          {mode === 'ai' && <AIGame onBack={() => setMode(null)} />}
          {mode === 'online' && <OnlineGame onBack={() => setMode(null)} />}
        </div>
      </div>
    </div>
  );
}
