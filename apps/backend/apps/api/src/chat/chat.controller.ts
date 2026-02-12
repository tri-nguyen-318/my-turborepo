import { Controller, Post, Body, HttpException, HttpStatus } from '@nestjs/common';
import { ChatAiService } from './chat-ai.service';

@Controller('chat')
export class ChatController {
  constructor(private readonly ai: ChatAiService) {}

  @Post('ai')
  async chatWithAi(
    @Body()
    body: {
      user: string;
      message: string;
    },
  ) {
    const { user, message } = body;
    try {
      const reply = await this.ai.reply(user, message);
      return { reply };
    } catch {
      throw new HttpException('Failed to generate AI response', HttpStatus.BAD_GATEWAY);
    }
  }
}
