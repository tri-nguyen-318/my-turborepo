import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

@WebSocketGateway({
  cors: {
    origin: process.env.FRONTEND_URL || 'http://localhost:3000',
    credentials: true,
  },
})
export class ChatGateway {
  @WebSocketServer()
  server: Server;

  handleConnection(client: Socket) {}
  handleDisconnect(client: Socket) {}

  @SubscribeMessage('joinRoom')
  onJoinRoom(@MessageBody() roomId: string, @ConnectedSocket() client: Socket) {
    if (!roomId) return;
    client.join(roomId);
    this.server.to(roomId).emit('system', {
      message: 'A user joined the room',
      timestamp: Date.now(),
    });
  }

  @SubscribeMessage('sendMessage')
  onSendMessage(
    @MessageBody()
    payload: {
      roomId: string;
      user: string;
      message: string;
      timestamp: number;
    },
    @ConnectedSocket() client: Socket,
  ) {
    const { roomId, user, message, timestamp } = payload || {};
    if (!roomId || !message) {
      client.emit('newMessage', {
        roomId,
      });
      return;
    }
    this.server.to(roomId).emit('newMessage', {
      channel: roomId,
      user,
      message,
      timestamp: timestamp || Date.now(),
    });
    return { success: true };
  }
}
