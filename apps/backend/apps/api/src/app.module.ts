import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { AuthModule } from './auth/auth.module';
import { UploadModule } from './upload/upload.module';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { HealthController } from './health/health.controller';
import { InfoController } from './info/info.controller';
import { PrismaModule } from '@repo/database';
import { ChatModule } from './chat/chat.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TerminusModule,
    PrismaModule,
    ClientsModule.register([
      {
        name: 'UPLOAD_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost', // Changed from 0.0.0.0 to localhost for better compatibility
          port: 3005,
        },
      },
      {
        name: 'INFO_SERVICE',
        transport: Transport.TCP,
        options: {
          host: 'localhost', // Changed from 0.0.0.0 to localhost for better compatibility
          port: 3004,
        },
      },
    ]),
    AuthModule,
    UploadModule,
    ChatModule,
  ],
  controllers: [AppController, HealthController, InfoController],
  providers: [AppService],
})
export class AppModule {}
