export type Mark = 'X' | 'O';
export type Cell = Mark | null;

export const WINNING_LINES = [
  [0, 1, 2],
  [3, 4, 5],
  [6, 7, 8],
  [0, 3, 6],
  [1, 4, 7],
  [2, 5, 8],
  [0, 4, 8],
  [2, 4, 6],
];

export function checkWinner(board: Cell[]): Mark | 'draw' | null {
  for (const [a, b, c] of WINNING_LINES) {
    if (board[a] && board[a] === board[b] && board[a] === board[c]) {
      return board[a] as Mark;
    }
  }
  return board.every(c => c !== null) ? 'draw' : null;
}

export function getWinningLine(board: Cell[]): number[] | null {
  for (const line of WINNING_LINES) {
    const [a, b, c] = line;
    if (board[a] && board[a] === board[b] && board[a] === board[c]) return line;
  }
  return null;
}

// Minimax — returns best move index for aiMark
function minimax(board: Cell[], isMaximizing: boolean, aiMark: Mark, humanMark: Mark): number {
  const winner = checkWinner(board);
  if (winner === aiMark) return 10;
  if (winner === humanMark) return -10;
  if (winner === 'draw') return 0;

  if (isMaximizing) {
    let best = -Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = aiMark;
        best = Math.max(best, minimax(board, false, aiMark, humanMark));
        board[i] = null;
      }
    }
    return best;
  } else {
    let best = Infinity;
    for (let i = 0; i < 9; i++) {
      if (!board[i]) {
        board[i] = humanMark;
        best = Math.min(best, minimax(board, true, aiMark, humanMark));
        board[i] = null;
      }
    }
    return best;
  }
}

export function getBestMove(board: Cell[], aiMark: Mark): number {
  const humanMark: Mark = aiMark === 'X' ? 'O' : 'X';
  let bestScore = -Infinity;
  let bestMove = -1;
  for (let i = 0; i < 9; i++) {
    if (!board[i]) {
      board[i] = aiMark;
      const score = minimax(board, false, aiMark, humanMark);
      board[i] = null;
      if (score > bestScore) {
        bestScore = score;
        bestMove = i;
      }
    }
  }
  return bestMove;
}

export function getRandomMove(board: Cell[]): number {
  const empty = board.map((c, i) => (c === null ? i : -1)).filter(i => i !== -1);
  return empty[Math.floor(Math.random() * empty.length)];
}
