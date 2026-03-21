import { Module } from '@nestjs/common';
import { PrismaModule } from '../../shared/database/prisma.module';
import { ImagePostService } from './application/image-post.service';
import { ImagePostController } from './presentation/image-post.controller';

@Module({
  imports: [PrismaModule],
  providers: [ImagePostService],
  controllers: [ImagePostController],
})
export class ImagePostModule {}
