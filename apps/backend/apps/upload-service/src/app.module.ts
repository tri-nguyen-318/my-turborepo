import { Module } from '@nestjs/common';
import { UploadModule } from './upload/upload.module';
import { ConfigModule } from '@nestjs/config';
import { TerminusModule } from '@nestjs/terminus';
import { PrismaModule } from '@repo/database';
import { HealthController } from './health/health.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    TerminusModule,
    PrismaModule,
    UploadModule,
  ],
  controllers: [HealthController],
})
export class AppModule {}
