import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { EmailService } from './email.service';
import { EmailController } from './email.controller';
import { EmailQueue } from '../rabbitmq/email-queue';

@Module({
  imports: [ConfigModule],
  controllers: [EmailController],
  providers: [EmailService, EmailQueue],
  exports: [EmailService, EmailQueue],
})
export class EmailModule {}
