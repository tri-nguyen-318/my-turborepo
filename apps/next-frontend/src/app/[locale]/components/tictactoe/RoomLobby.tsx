'use client';

import { useState } from 'react';
import { useTranslations } from 'next-intl';
import { Copy, Check, LogIn, Plus } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface RoomLobbyProps {
  onCreateRoom: () => void;
  onJoinRoom: (roomId: string) => void;
  waitingRoomId?: string | null; // set when we created a room and waiting
  onBack: () => void;
  error?: string | null;
}

export function RoomLobby({
  onCreateRoom,
  onJoinRoom,
  waitingRoomId,
  onBack,
  error,
}: RoomLobbyProps) {
  const t = useTranslations('tictactoe');
  const [joinId, setJoinId] = useState('');
  const [copied, setCopied] = useState(false);

  const copy = async () => {
    if (!waitingRoomId) return;
    await navigator.clipboard.writeText(waitingRoomId);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (waitingRoomId) {
    return (
      <div className="flex flex-col items-center gap-6 text-center">
        <p className="text-muted-foreground">{t('shareRoom')}</p>
        <div className="flex items-center gap-2 rounded-xl border border-border bg-muted px-6 py-4">
          <span className="font-mono text-3xl font-bold tracking-widest">{waitingRoomId}</span>
          <button
            onClick={copy}
            className="ml-2 text-muted-foreground transition-colors hover:text-foreground"
          >
            {copied ? <Check className="h-5 w-5 text-green-500" /> : <Copy className="h-5 w-5" />}
          </button>
        </div>
        <p className="flex animate-pulse items-center gap-2 text-sm text-muted-foreground">
          <span className="inline-block h-2 w-2 rounded-full bg-yellow-500" />
          {t('waitingForOpponent')}
        </p>
        <Button variant="ghost" onClick={onBack}>
          {t('cancel')}
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-8">
      <div className="flex w-full max-w-xs flex-col gap-3">
        <Button className="gap-2" onClick={onCreateRoom}>
          <Plus className="h-4 w-4" /> {t('createRoom')}
        </Button>
      </div>

      <div className="flex w-full max-w-xs flex-col gap-3">
        <p className="text-center text-sm text-muted-foreground">{t('or')}</p>
        <div className="flex gap-2">
          <Input
            placeholder={t('enterRoomId')}
            value={joinId}
            onChange={e => setJoinId(e.target.value.toUpperCase())}
            onKeyDown={e => e.key === 'Enter' && joinId.trim() && onJoinRoom(joinId.trim())}
            className="font-mono tracking-wider uppercase"
            maxLength={6}
          />
          <Button
            variant="outline"
            className="gap-2"
            onClick={() => onJoinRoom(joinId.trim())}
            disabled={!joinId.trim()}
          >
            <LogIn className="h-4 w-4" /> {t('join')}
          </Button>
        </div>
        {error && <p className="text-center text-sm text-destructive">{error}</p>}
      </div>

      <Button variant="ghost" onClick={onBack}>
        {t('back')}
      </Button>
    </div>
  );
}
