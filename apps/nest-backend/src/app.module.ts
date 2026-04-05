import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { PrismaModule } from './shared/database/prisma.module';
import { AuthModule } from './modules/auth/auth.module';
import { ProfileModule } from './modules/profile/profile.module';
import { UploadModule } from './modules/upload/upload.module';
import { TicTacToeModule } from './modules/tictactoe/tictactoe.module';
import { EmailModule } from './modules/email/email.module';
import { InvoiceModule } from './modules/invoice/invoice.module';
import { ImagePostModule } from './modules/image-post/image-post.module';
import { AdminModule } from './modules/admin/admin.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    ConfigModule.forRoot({ isGlobal: true, envFilePath: ['.env'] }),
    PrismaModule,
    AuthModule,
    ProfileModule,
    UploadModule,
    TicTacToeModule,
    EmailModule,
    InvoiceModule,
    ImagePostModule,
    AdminModule,
  ],
})
export class AppModule {}
