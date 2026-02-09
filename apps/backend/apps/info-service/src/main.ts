import { NestFactory } from '@nestjs/core';
import { InfoServiceModule } from './info-service.module';
import { Transport, MicroserviceOptions } from '@nestjs/microservices';
import { GlobalRpcExceptionsFilter } from './filters/rpc-exception.filter';

async function bootstrap() {
  const app = await NestFactory.createMicroservice<MicroserviceOptions>(InfoServiceModule, {
    transport: Transport.TCP,
    options: {
      host: '0.0.0.0',
      port: 3004,
    },
  });
  app.useGlobalFilters(new GlobalRpcExceptionsFilter());
  await app.listen();
  console.log('Info Service running via TCP on port 3004');
}
bootstrap();
