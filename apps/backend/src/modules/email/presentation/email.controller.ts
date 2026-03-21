import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from '../application/email.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  send(@Body() dto: SendEmailDto) {
    return this.emailService.sendMail({ to: dto.to, subject: dto.subject, text: dto.text });
  }
}
