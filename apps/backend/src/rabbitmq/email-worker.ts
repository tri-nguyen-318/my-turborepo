import { EmailQueue } from '../rabbitmq/email-queue';
import { EmailService } from '../email/email.service';
import { NestFactory } from '@nestjs/core';
import { AppModule } from '../app.module';

async function bootstrap() {
  const appContext = await NestFactory.createApplicationContext(AppModule);
  const emailService = appContext.get(EmailService);
  const emailQueue = appContext.get(EmailQueue);
  await emailQueue.consumeSendEmailJobs(async email => {
    await emailService.sendEmail(email);
  });
  console.log('Email worker started and listening for jobs...');
}

bootstrap();
