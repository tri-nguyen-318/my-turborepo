'use client';

import { cn } from '@/lib/utils';
import type { Cell, Mark } from './gameLogic';
import { getWinningLine } from './gameLogic';

interface GameBoardProps {
  board: Cell[];
  onMove: (index: number) => void;
  disabled?: boolean;
  winningLine?: number[] | null;
}

const markColors: Record<Mark, string> = {
  X: 'text-blue-500',
  O: 'text-rose-500',
};

export function GameBoard({ board, onMove, disabled, winningLine }: GameBoardProps) {
  const line = winningLine ?? getWinningLine(board);

  return (
    <div className="grid grid-cols-3 gap-2">
      {board.map((cell, i) => {
        const isWinning = line?.includes(i);
        return (
          <button
            key={i}
            onClick={() => onMove(i)}
            disabled={disabled || cell !== null}
            className={cn(
              'flex h-24 w-24 items-center justify-center rounded-xl border-2 text-4xl font-bold transition-all duration-150',
              'border-border bg-card shadow-sm',
              !cell && !disabled && 'cursor-pointer hover:bg-muted',
              cell && 'cursor-default',
              isWinning && 'border-primary bg-primary/10',
            )}
          >
            {cell && <span className={cn('select-none', markColors[cell])}>{cell}</span>}
          </button>
        );
      })}
    </div>
  );
}
