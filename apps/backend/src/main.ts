import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { MicroserviceOptions, Transport } from '@nestjs/microservices';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService instance
  const configService = app.get(ConfigService);

  // Enable CORS for frontend
  app.enableCors({
    origin: configService.get('FRONTEND_URL') as string,
    credentials: true,
  });

  const rabbitUrl = configService.get<string>('RABBITMQ_URL');
  if (rabbitUrl) {
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'send_email',
        queueOptions: { durable: true },
      },
    });
    app.connectMicroservice<MicroserviceOptions>({
      transport: Transport.RMQ,
      options: {
        urls: [rabbitUrl],
        queue: 'leaderboard_queue',
        queueOptions: { durable: true },
      },
    });
    await app.startAllMicroservices();
  }

  // Get the PORT value from the .env file
  const port = configService.get<number>('PORT');
  if (!port) {
    throw new Error('PORT is required');
  }

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
