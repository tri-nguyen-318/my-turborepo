import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Get the ConfigService instance
  const configService = app.get(ConfigService);

  // Enable CORS for frontend
  app.enableCors({
    origin: (configService.get('FRONTEND_URL') as string) || 'http://localhost:3000',
    credentials: true,
  });

  // Get the PORT value from the .env file (defaults to 3000 if not found)
  const port = configService.get<number>('PORT') || 3000;

  await app.listen(port);
  console.log(`Application is running on: ${await app.getUrl()}`);
}

void bootstrap();
