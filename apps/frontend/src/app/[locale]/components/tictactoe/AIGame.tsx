'use client';

import { useState, useEffect, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { Bot, User, RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { GameBoard } from './GameBoard';
import { checkWinner, getRandomMove } from './gameLogic';
import type { Cell, Mark } from './gameLogic';

interface AIGameProps {
  onBack: () => void;
}

async function fetchAIMove(board: Cell[], mark: Mark): Promise<number> {
  const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/tictactoe/move`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ board, mark }),
  });
  if (!res.ok) throw new Error('Failed to get move');
  const data = await res.json();
  return data.move as number;
}

export function AIGame({ onBack }: AIGameProps) {
  const t = useTranslations('tictactoe');
  const [board, setBoard] = useState<Cell[]>(Array(9).fill(null));
  const [playerMark] = useState<Mark>('X');
  const aiMark: Mark = 'O';
  const [currentPlayer, setCurrentPlayer] = useState<Mark>('X');
  const [winner, setWinner] = useState<Mark | 'draw' | null>(null);
  const [isThinking, setIsThinking] = useState(false);

  const reset = useCallback(() => {
    setBoard(Array(9).fill(null));
    setCurrentPlayer('X');
    setWinner(null);
  }, []);

  useEffect(() => {
    if (currentPlayer !== aiMark || winner) return;

    setIsThinking(true);

    const run = async (currentBoard: Cell[]) => {
      let move = -1;
      try {
        move = await fetchAIMove(currentBoard, aiMark);
      } catch {
        move = getRandomMove(currentBoard);
      } finally {
        setIsThinking(false);
      }

      if (move === -1) return;
      setBoard(prev => {
        if (prev[move] !== null) return prev;
        const next = [...prev];
        next[move] = aiMark;
        const w = checkWinner(next);
        if (w) setWinner(w);
        else setCurrentPlayer(playerMark);
        return next;
      });
    };

    run([...board]);
  }, [currentPlayer, winner]);

  const handleMove = (index: number) => {
    if (board[index] || winner || currentPlayer !== playerMark || isThinking) return;

    const next = [...board];
    next[index] = playerMark;
    const w = checkWinner(next);
    setBoard(next);
    if (w) setWinner(w);
    else setCurrentPlayer(aiMark);
  };

  const statusText = winner
    ? winner === 'draw'
      ? t('draw')
      : winner === playerMark
        ? t('youWin')
        : t('aiWins')
    : isThinking
      ? t('aiThinking')
      : t('yourTurn');

  return (
    <div className="flex flex-col items-center gap-6">
      <div className="flex w-full max-w-xs items-center justify-between text-sm">
        <div
          className={`flex items-center gap-2 font-semibold ${currentPlayer === playerMark && !winner ? 'text-blue-500' : 'text-muted-foreground'}`}
        >
          <User className="h-4 w-4" /> {t('you')} (X)
        </div>
        <div
          className={`flex items-center gap-2 font-semibold ${currentPlayer === aiMark && !winner ? 'text-rose-500' : 'text-muted-foreground'}`}
        >
          <Bot className="h-4 w-4" /> {t('ai')} (O)
        </div>
      </div>

      <GameBoard
        board={board}
        onMove={handleMove}
        disabled={currentPlayer !== playerMark || !!winner || isThinking}
      />

      <p
        className={`text-base font-semibold ${winner === playerMark ? 'text-green-500' : winner && winner !== 'draw' ? 'text-rose-500' : 'text-foreground'}`}
      >
        {statusText}
      </p>

      <div className="flex gap-3">
        <Button variant="outline" onClick={reset}>
          <RefreshCw className="mr-2 h-4 w-4" /> {t('restart')}
        </Button>
        <Button variant="ghost" onClick={onBack}>
          {t('back')}
        </Button>
      </div>
    </div>
  );
}
