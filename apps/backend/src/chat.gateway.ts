import {
  WebSocketGateway,
  WebSocketServer,
  SubscribeMessage,
  MessageBody,
  ConnectedSocket,
  OnGatewayConnection,
  OnGatewayDisconnect,
} from '@nestjs/websockets';
import { Server, Socket } from 'socket.io';

interface ChatMessage {
  channel: string;
  user: string;
  message: string;
  timestamp: number;
}

@WebSocketGateway({ cors: { origin: '*', credentials: true } })
export class ChatGateway implements OnGatewayConnection, OnGatewayDisconnect {
  @WebSocketServer()
  server: Server;

  private userChannels = new Map<string, string>();

  handleConnection(client: Socket) {
    // Optionally handle new connection
  }

  handleDisconnect(client: Socket) {
    // Optionally handle disconnect
    this.userChannels.delete(client.id);
  }

  @SubscribeMessage('joinChannel')
  handleJoinChannel(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    const prevChannel = this.userChannels.get(client.id);
    if (prevChannel) {
      client.leave(prevChannel);
    }
    client.join(channel);
    this.userChannels.set(client.id, channel);
  }

  @SubscribeMessage('leaveChannel')
  handleLeaveChannel(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    client.leave(channel);
    this.userChannels.delete(client.id);
  }

  @SubscribeMessage('sendMessage')
  handleSendMessage(@MessageBody() msg: ChatMessage, @ConnectedSocket() client: Socket) {
    this.server.to(msg.channel).emit('newMessage', msg);
  }

  @SubscribeMessage('createChannel')
  handleCreateChannel(@MessageBody() channel: string, @ConnectedSocket() client: Socket) {
    // In-memory only; just acknowledge creation
    client.emit('createChannel', { event: 'channelCreated', channel });
  }
}
