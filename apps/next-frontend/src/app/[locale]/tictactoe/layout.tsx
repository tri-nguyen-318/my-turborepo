import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Tic-Tac-Toe',
  description: 'Play Tic-Tac-Toe against an AI or challenge a friend online in real time.',
};

export default function TicTacToeLayout({ children }: { children: React.ReactNode }) {
  return children;
}
