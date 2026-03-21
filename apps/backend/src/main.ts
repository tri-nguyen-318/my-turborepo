import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { AppModule } from './app.module';
import cookieParser from 'cookie-parser';
import morgan from 'morgan';
import { WinstonModule } from 'nest-winston';
import { winstonConfig } from './shared/logger/winston.config';

export async function bootstrap() {
  const logger = WinstonModule.createLogger(winstonConfig);

  const app = await NestFactory.create(AppModule, { logger });

  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(
    morgan(':method :url :status :res[content-length] - :response-time ms', {
      stream: {
        write: (message: string) => logger.log(message.trim(), 'HTTP'),
      },
    }),
  );
  app.use(cookieParser());

  const frontendUrl = (process.env.FRONTEND_URL ?? '').replace(/\/$/, '');
  const allowedOrigins = [frontendUrl, frontendUrl.replace('://', '://www.')].filter(Boolean);

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  await app.listen(3001);
  logger.log('Backend running on port 3001', 'Bootstrap');
}
if (require.main === module) {
  bootstrap();
}
