import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { publishSendEmailJob } from '../rabbitmq/email-queue';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    await publishSendEmailJob(sendEmailDto);
    return { success: true, queued: true };
  }
}
