'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useTranslations } from 'next-intl';
import { RefreshCw } from 'lucide-react';
import { io, Socket } from 'socket.io-client';
import { Button } from '@/components/ui/button';
import { GameBoard } from './GameBoard';
import { RoomLobby } from './RoomLobby';
import type { Cell, Mark } from './gameLogic';

type GameStatus = 'waiting' | 'playing' | 'finished';

interface GameState {
  board: Cell[];
  currentPlayer: Mark;
  winner: Mark | 'draw' | null;
  status: GameStatus;
}

interface OnlineGameProps {
  onBack: () => void;
}

export function OnlineGame({ onBack }: OnlineGameProps) {
  const t = useTranslations('tictactoe');
  const socketRef = useRef<Socket | null>(null);

  const [roomId, setRoomId] = useState<string | null>(null);
  const [myMark, setMyMark] = useState<Mark | null>(null);
  const [waitingRoomId, setWaitingRoomId] = useState<string | null>(null);
  const [game, setGame] = useState<GameState | null>(null);
  const [lobbyError, setLobbyError] = useState<string | null>(null);
  const [opponentLeft, setOpponentLeft] = useState(false);

  // Connect socket on mount
  useEffect(() => {
    const socket = io(`${process.env.NEXT_PUBLIC_API_URL}/tictactoe`, {
      transports: ['websocket'],
    });
    socketRef.current = socket;

    socket.on('roomCreated', ({ roomId, mark }: { roomId: string; mark: Mark }) => {
      setWaitingRoomId(roomId);
      setRoomId(roomId);
      setMyMark(mark);
      setLobbyError(null);
    });

    socket.on('roomJoined', ({ roomId, mark }: { roomId: string; mark: Mark }) => {
      setRoomId(roomId);
      setMyMark(mark);
      setWaitingRoomId(null);
      setLobbyError(null);
    });

    socket.on('gameState', (state: GameState) => {
      setGame(state);
      setWaitingRoomId(null);
      setOpponentLeft(false);
    });

    socket.on('opponentLeft', () => {
      setOpponentLeft(true);
      setGame(null);
      setRoomId(null);
      setMyMark(null);
      setWaitingRoomId(null);
    });

    socket.on('error', ({ message }: { message: string }) => {
      setLobbyError(message);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const handleCreateRoom = useCallback(() => {
    setLobbyError(null);
    socketRef.current?.emit('createRoom');
  }, []);

  const handleJoinRoom = useCallback((id: string) => {
    setLobbyError(null);
    socketRef.current?.emit('joinRoom', { roomId: id });
  }, []);

  const handleMove = useCallback(
    (index: number) => {
      if (!roomId) return;
      socketRef.current?.emit('makeMove', { roomId, index });
    },
    [roomId],
  );

  const handleRestart = useCallback(() => {
    if (!roomId) return;
    socketRef.current?.emit('restartGame', { roomId });
  }, [roomId]);

  const handleBack = useCallback(() => {
    socketRef.current?.disconnect();
    onBack();
  }, [onBack]);

  const isMyTurn = game?.currentPlayer === myMark && game?.status === 'playing';

  const statusText = opponentLeft
    ? t('opponentLeft')
    : !game
      ? null
      : game.winner
        ? game.winner === 'draw'
          ? t('draw')
          : game.winner === myMark
            ? t('youWin')
            : t('youLose')
        : isMyTurn
          ? t('yourTurn')
          : t('opponentTurn');

  // Lobby (no roomId yet or waiting)
  if (!game) {
    return (
      <div className="flex flex-col items-center gap-6">
        {opponentLeft && (
          <p className="rounded-lg bg-destructive/10 px-4 py-2 text-sm text-destructive">
            {t('opponentLeft')}
          </p>
        )}
        <RoomLobby
          onCreateRoom={handleCreateRoom}
          onJoinRoom={handleJoinRoom}
          waitingRoomId={waitingRoomId}
          onBack={handleBack}
          error={lobbyError}
        />
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center gap-6">
      {/* room id badge */}
      <div className="flex items-center gap-2 text-xs text-muted-foreground">
        <span>Room:</span>
        <span className="font-mono font-bold tracking-wider">{roomId}</span>
        <span className="rounded-full bg-primary/10 px-2 py-0.5 text-xs font-semibold text-primary">
          {t('youAre', { mark: myMark ?? '' })}
        </span>
      </div>

      <GameBoard board={game.board} onMove={handleMove} disabled={!isMyTurn || !!game.winner} />

      <p
        className={`text-base font-semibold ${game.winner === myMark ? 'text-green-500' : game.winner && game.winner !== 'draw' ? 'text-rose-500' : 'text-foreground'}`}
      >
        {statusText}
      </p>

      <div className="flex gap-3">
        {game.status === 'finished' && (
          <Button variant="outline" onClick={handleRestart}>
            <RefreshCw className="mr-2 h-4 w-4" /> {t('restart')}
          </Button>
        )}
        <Button variant="ghost" onClick={handleBack}>
          {t('back')}
        </Button>
      </div>
    </div>
  );
}
