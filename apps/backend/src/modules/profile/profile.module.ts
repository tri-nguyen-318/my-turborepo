import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ProfileController } from './presentation/profile.controller';
import { ProfileService } from './application/profile.service';
import { PersonalInfo, PersonalInfoSchema } from './domain/schemas/personal-info.schema';

@Module({
  imports: [MongooseModule.forFeature([{ name: PersonalInfo.name, schema: PersonalInfoSchema }])],
  controllers: [ProfileController],
  providers: [ProfileService],
})
export class ProfileModule {}
