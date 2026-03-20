import { Controller, Post, Body } from '@nestjs/common';

@Controller('chat')
export class ChatController {
  @Post('ai')
  chatWithAi(@Body() body: { user: string; message: string }) {
    return {
      reply: `Hi ${body.user || 'friend'}, you said: "${body.message}". AI is not wired yet.`,
    };
  }
}
