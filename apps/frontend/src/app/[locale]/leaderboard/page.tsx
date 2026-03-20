'use client';
import { Leaderboard } from '../components/leaderboard/Leaderboard';

export default function LeaderboardPage() {
  return (
    <div className="container mx-auto py-10">
      <h1 className="text-3xl font-bold mb-6 text-center">Global Leaderboard</h1>
      <Leaderboard />
    </div>
  );
}
