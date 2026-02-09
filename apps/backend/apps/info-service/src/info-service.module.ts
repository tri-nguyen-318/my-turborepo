import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { InfoServiceController } from './info-service.controller';
import { InfoServiceService } from './info-service.service';
import { PersonalInfo, PersonalInfoSchema } from './schemas/personal-info.schema';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      envFilePath: ['.env'],
    }),
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGO_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([{ name: PersonalInfo.name, schema: PersonalInfoSchema }]),
  ],
  controllers: [InfoServiceController],
  providers: [InfoServiceService],
})
export class InfoServiceModule {}
