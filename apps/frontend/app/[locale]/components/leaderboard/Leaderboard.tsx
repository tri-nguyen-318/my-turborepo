'use client';

import { useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Trophy } from 'lucide-react';

const BACKEND_URL = process.env.NEXT_PUBLIC_API_URL;

interface LeaderboardEntry {
  username: string;
  score: number;
}

export const Leaderboard = () => {
  const [leaderboard, setLeaderboard] = useState<LeaderboardEntry[]>([]);
  const [socket, setSocket] = useState<Socket | null>(null);

  useEffect(() => {
    if (!BACKEND_URL) return;

    const s = io(BACKEND_URL, { transports: ['websocket'] });
    setSocket(s);

    s.on('connect', () => {
      console.log('Connected to socket for leaderboard');
      s.emit('joinLeaderboard');
    });

    s.on('leaderboardUpdate', (data: LeaderboardEntry[]) => {
      console.log('Leaderboard update:', data);
      setLeaderboard(data);
    });

    return () => {
      s.disconnect();
    };
  }, []);

  return (
    <Card className="w-full max-w-md mx-auto mt-8">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Trophy className="w-6 h-6 text-yellow-500" />
          Real-time Leaderboard
        </CardTitle>
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-[100px]">Rank</TableHead>
              <TableHead>User</TableHead>
              <TableHead className="text-right">Score</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {leaderboard.length === 0 ? (
              <TableRow>
                <TableCell colSpan={3} className="text-center text-muted-foreground">
                  No scores yet
                </TableCell>
              </TableRow>
            ) : (
              leaderboard.map((entry, index) => (
                <TableRow key={entry.username}>
                  <TableCell className="font-medium">
                    {index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : index + 1}
                  </TableCell>
                  <TableCell>{entry.username}</TableCell>
                  <TableCell className="text-right">{entry.score}</TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  );
};
