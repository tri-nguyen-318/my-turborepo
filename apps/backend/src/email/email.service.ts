import { Injectable, Logger } from '@nestjs/common';
import * as nodemailer from 'nodemailer';
import { ConfigService } from '@nestjs/config';
import { SendEmailDto } from './dto/send-email.dto';
import { MessagePattern } from '@nestjs/microservices';
import { EmailQueue } from 'src/rabbitmq/email-queue';

@Injectable()
export class EmailService {
  private transporter: nodemailer.Transporter;
  private readonly logger = new Logger(EmailService.name);
  constructor(
    private readonly configService: ConfigService,
    private readonly emailQueue: EmailQueue,
  ) {
    this.createTransporter();
  }

  private createTransporter() {
    // Use Gmail SMTP for real email delivery
    this.transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: this.configService.get<string>('GMAIL_USER'),
        pass: this.configService.get<string>('GMAIL_PASS'),
      },
    });
  }

  async sendEmail(sendEmailDto: SendEmailDto) {
    const { to, subject, text } = sendEmailDto;
    this.logger.log(`Attempting to send email to ${to} with subject "${subject}"`);
    try {
      const info = await this.transporter.sendMail({
        from: this.configService.get<string>('GMAIL_USER'),
        to,
        subject,
        text,
      });
      this.logger.log(`Message sent: ${info.messageId}`);
      return { success: true, messageId: info.messageId };
    } catch (error) {
      this.logger.error('Failed to send email', error);
      throw error;
    }
  }
}
