import { Test } from '@nestjs/testing';
import { ValidationPipe } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import cookieParser from 'cookie-parser';
import { PrismaModule } from '../../src/shared/database/prisma.module';
import { AuthModule } from '../../src/modules/auth/auth.module';
import { ImagePostModule } from '../../src/modules/image-post/image-post.module';
import type { INestApplication } from '@nestjs/common';

export async function createTestApp(): Promise<INestApplication> {
  const moduleRef = await Test.createTestingModule({
    imports: [ConfigModule.forRoot({ isGlobal: true }), PrismaModule, AuthModule, ImagePostModule],
  }).compile();

  const app = moduleRef.createNestApplication();
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));
  app.use(cookieParser());
  await app.init();
  return app;
}
