import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());

  const frontendUrl = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');
  const allowedOrigins = [frontendUrl, frontendUrl.replace('://', '://www.')].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(3001);
  console.log('Backend running on port 3001');
}
bootstrap();
