import { Injectable } from '@nestjs/common';
import OpenAI from 'openai';

@Injectable()
export class ChatAiService {
  private client: OpenAI | null;

  constructor() {
    const key = process.env.OPENAI_API_KEY;
    this.client = key ? new OpenAI({ apiKey: key }) : null;
  }

  async reply(user: string, message: string) {
    if (!message?.trim()) {
      return 'Please enter a message.';
    }
    if (!this.client) {
      return `Hi ${user || 'friend'}, you said: "${message}". AI provider is not configured.`;
    }
    try {
      const completion = await this.client.chat.completions.create({
        model: 'gpt-4o-mini',
        messages: [
          { role: 'system', content: 'You are a concise helpful assistant in a chat room.' },
          { role: 'user', content: message },
        ],
        temperature: 0.7,
      });
      const content =
        completion.choices?.[0]?.message?.content?.toString() || 'No response generated.';
      return content;
    } catch (e) {
      return 'Error generating AI response.';
      throw new Error('Error generating AI response.');
    }
  }
}
