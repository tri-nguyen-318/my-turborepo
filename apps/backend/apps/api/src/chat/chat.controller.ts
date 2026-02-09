import { Controller, Post, Body } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Post('ai')
  async chatWithAi(
    @Body()
    body: {
      user: string;
      message: string;
    },
  ) {
    const { user, message } = body;
    return {
      reply: `Hi ${user || 'friend'}, you said: "${message}". AI backend is not wired yet, this is a placeholder.`,
    };
  }
}
