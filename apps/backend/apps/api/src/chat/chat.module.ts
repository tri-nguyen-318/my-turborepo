import { Module } from '@nestjs/common';
import { ChatGateway } from './chat.gateway';
import { ChatController } from './chat.controller';
import { ChatAiService } from './chat-ai.service';

@Module({
  providers: [ChatGateway, ChatAiService],
  controllers: [ChatController],
})
export class ChatModule {}
