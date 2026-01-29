// email.controller.ts
import { Body, Controller, Post } from '@nestjs/common';
import { EmailService } from './email.service';
import { SendEmailDto } from './dto/send-email.dto';

@Controller('api/email')
export class EmailController {
  constructor(private readonly emailService: EmailService) {}

  @Post('send')
  async sendEmail(@Body() sendEmailDto: SendEmailDto) {
    console.log('🚀 ~ EmailController ~ sendEmail ~ sendEmailDto:', sendEmailDto);
    await this.emailService.sendEmail(sendEmailDto);
    return { success: true };
  }
}
