import { Module } from '@nestjs/common';
import { ChatGateway } from './application/chat.gateway';
import { ChatController } from './presentation/chat.controller';

@Module({
  providers: [ChatGateway],
  controllers: [ChatController],
})
export class ChatModule {}
