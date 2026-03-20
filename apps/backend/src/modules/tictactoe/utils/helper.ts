export type Cell = 'X' | 'O' | null;
export type Mark = 'X' | 'O';

function formatBoard(board: Cell[]): string {
  const s = (c: Cell) => (c === null ? '.' : c);
  return [
    `${s(board[0])} | ${s(board[1])} | ${s(board[2])}`,
    `---------`,
    `${s(board[3])} | ${s(board[4])} | ${s(board[5])}`,
    `---------`,
    `${s(board[6])} | ${s(board[7])} | ${s(board[8])}`,
  ].join('\n');
}

export const getPromt = ({
  board,
  empty,
  mark,
  opponent,
}: {
  board: Cell[];
  empty: number[];
  mark: Mark;
  opponent: Mark;
}) => `You are playing Tic-Tac-Toe as "${mark}". Your opponent is "${opponent}".

Board positions are numbered 0–8, left-to-right, top-to-bottom:
0 | 1 | 2
---------
3 | 4 | 5
---------
6 | 7 | 8

Current board ("." = empty):
${formatBoard(board)}

Available positions: ${empty.join(', ')}

Reply with ONLY the single best position number. No explanation, no punctuation — just the digit.`;
