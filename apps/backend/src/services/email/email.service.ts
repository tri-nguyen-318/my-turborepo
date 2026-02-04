import { Injectable } from '@nestjs/common';
import { SendEmailDto } from './dto/send-email.dto';

@Injectable()
export class EmailService {
  constructor() {}

  async sendEmail(dto: SendEmailDto) {
    const messageId = `${Date.now()}-${Math.random().toString(36).slice(2, 10)}`;
    return { success: true, messageId, queued: false };
  }
}
