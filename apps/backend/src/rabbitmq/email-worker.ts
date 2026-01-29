import { EmailQueue } from '../rabbitmq/email-queue';
import { EmailService } from '../email/email.service';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const emailService = appContext.get(EmailService);
  const configService = appContext.get(ConfigService);
  const emailQueue = new EmailQueue(configService);
  await emailQueue.consumeSendEmailJobs(async email => {
    await emailService.sendEmail(email);
  });
  console.log('Email worker started and listening for jobs...');
}

bootstrap();
