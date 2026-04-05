import { Module } from '@nestjs/common';
import { ProfileController } from './presentation/profile.controller';
import { ProfileService } from './application/profile.service';
import { PrismaModule } from '../../shared/database/prisma.module';

@Module({
  imports: [PrismaModule],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
