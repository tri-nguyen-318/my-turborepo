import { NestFactory, HttpAdapterHost } from '@nestjs/core';
import { AppModule } from './app.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import cookieParser from 'cookie-parser';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const httpAdapter = app.get(HttpAdapterHost);
  app.useGlobalFilters(new AllExceptionsFilter(httpAdapter));

  app.use(cookieParser());

  app.enableCors({
    origin: process.env.FRONTEND_URL,
    credentials: true,
  });

  app.connectMicroservice<MicroserviceOptions>({
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3003,
    },
  });

  await app.startAllMicroservices();
  await app.listen(3003);
  console.log('API Gateway running on port 3003');
}
bootstrap();
