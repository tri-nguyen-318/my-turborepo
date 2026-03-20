import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  ConnectedSocket,
  MessageBody,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

type Mark = 'X' | 'O';
type Cell = Mark | null;

interface Room {
  id: string;
  players: { X?: string; O?: string };
  board: Cell[];
  currentPlayer: Mark;
  status: 'waiting' | 'playing' | 'finished';
  winner: Mark | 'draw' | null;
}

interface GameStatePayload {
  board: Cell[];
  currentPlayer: Mark;
  winner: Mark | 'draw' | null;
  status: Room['status'];
}

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

@WebSocketGateway({
  cors: { origin: '*', credentials: true },
  namespace: '/tictactoe',
})
export class TicTacToeGateway implements OnGatewayDisconnect {
  @WebSocketServer() server: Server;

  private rooms = new Map<string, Room>();
  private playerRoom = new Map<string, string>(); // socketId -> roomId

  private generateRoomId(): string {
    let id: string;
    do {
      id = Math.random().toString(36).substring(2, 8).toUpperCase();
    } while (this.rooms.has(id));
    return id;
  }

  private emitGameState(room: Room) {
    const payload: GameStatePayload = {
      board: room.board,
      currentPlayer: room.currentPlayer,
      winner: room.winner,
      status: room.status,
    };
    this.server.to(room.id).emit('gameState', payload);
  }

  @SubscribeMessage('createRoom')
  handleCreateRoom(@ConnectedSocket() client: Socket) {
    // Remove from old room first
    this.cleanupPlayer(client.id);

    const roomId = this.generateRoomId();
    const room: Room = {
      id: roomId,
      players: { X: client.id },
      board: Array(9).fill(null),
      currentPlayer: 'X',
      status: 'waiting',
      winner: null,
    };

    this.rooms.set(roomId, room);
    this.playerRoom.set(client.id, roomId);
    client.join(roomId);
    client.emit('roomCreated', { roomId, mark: 'X' });
  }

  @SubscribeMessage('joinRoom')
  handleJoinRoom(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const room = this.rooms.get(data.roomId?.toUpperCase());

    if (!room) {
      client.emit('error', { message: 'Room not found' });
      return;
    }
    if (room.status !== 'waiting') {
      client.emit('error', { message: 'Room is full or already started' });
      return;
    }
    if (room.players.X === client.id) {
      client.emit('error', { message: 'Cannot join your own room' });
      return;
    }

    this.cleanupPlayer(client.id);

    room.players.O = client.id;
    room.status = 'playing';
    this.playerRoom.set(client.id, room.id);
    client.join(room.id);

    client.emit('roomJoined', { roomId: room.id, mark: 'O' });
    this.emitGameState(room);
  }

  @SubscribeMessage('makeMove')
  handleMakeMove(
    @ConnectedSocket() client: Socket,
    @MessageBody() data: { roomId: string; index: number },
  ) {
    const room = this.rooms.get(data.roomId);
    if (!room || room.status !== 'playing') return;

    const mark: Mark | null =
      room.players.X === client.id ? 'X' : room.players.O === client.id ? 'O' : null;

    if (!mark || mark !== room.currentPlayer) return;
    if (data.index < 0 || data.index > 8 || room.board[data.index] !== null) return;

    room.board[data.index] = mark;
    const winner = checkWinner(room.board);

    if (winner) {
      room.status = 'finished';
      room.winner = winner;
    } else {
      room.currentPlayer = room.currentPlayer === 'X' ? 'O' : 'X';
    }

    this.emitGameState(room);
  }

  @SubscribeMessage('restartGame')
  handleRestart(@ConnectedSocket() client: Socket, @MessageBody() data: { roomId: string }) {
    const room = this.rooms.get(data.roomId);
    if (!room || room.status !== 'finished') return;
    if (room.players.X !== client.id && room.players.O !== client.id) return;

    room.board = Array(9).fill(null);
    room.currentPlayer = 'X';
    room.winner = null;
    room.status = 'playing';

    this.emitGameState(room);
  }

  handleDisconnect(client: Socket) {
    this.cleanupPlayer(client.id);
  }

  private cleanupPlayer(socketId: string) {
    const roomId = this.playerRoom.get(socketId);
    if (!roomId) return;

    const room = this.rooms.get(roomId);
    if (room) {
      this.server.to(roomId).emit('opponentLeft');
      this.rooms.delete(roomId);
    }

    this.playerRoom.delete(socketId);
  }
}
