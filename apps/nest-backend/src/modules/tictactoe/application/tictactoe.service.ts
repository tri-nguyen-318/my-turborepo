import { Injectable, BadRequestException } from '@nestjs/common';
import Groq from 'groq-sdk';
import { Cell, getPromt, Mark } from '../utils/helper';

const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

function checkWinner(board: Cell[]): Mark | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Mark;
    }
  }
  return board.every(c => c !== null) ? 'draw' : null;
}

@Injectable()
export class TicTacToeService {
  private readonly client = new Groq({ apiKey: process.env.GROQ_API_KEY });

  async getBestMove(board: Cell[], mark: Mark): Promise<number> {
    if (checkWinner(board)) throw new BadRequestException('Game is already over');
    console.log('🚀 ~ TicTacToeService ~ process.env.GROQ_API_KEY:', process.env.GROQ_API_KEY);

    const empty = board.map((c, i) => (c === null ? i : -1)).filter(i => i !== -1);
    if (empty.length === 0) throw new BadRequestException('No moves available');
    if (empty.length === 1) return empty[0];

    const opponent: Mark = mark === 'X' ? 'O' : 'X';

    try {
      const response = await this.client.chat.completions.create({
        model: 'llama-3.1-8b-instant',
        max_tokens: 4,
        messages: [
          {
            role: 'user',
            content: getPromt({
              board,
              empty,
              mark,
              opponent,
            }),
          },
        ],
      });
      console.log('🚀 ~ TicTacToeService ~ getBestMove ~ response:', response);

      const text = response.choices[0]?.message?.content?.trim() ?? '';
      const move = parseInt(text, 10);
      if (!isNaN(move) && empty.includes(move)) return move;
    } catch (e) {
      console.error('Groq error:', e);
    }

    return empty[0];
  }
}
