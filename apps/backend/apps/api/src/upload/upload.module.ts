import { Module } from '@nestjs/common';
import { ClientsModule, Transport } from '@nestjs/microservices';
import { UploadController } from './upload.controller';
import { UploadService } from './upload.service';

@Module({
  imports: [
    ClientsModule.register([
      {
        name: 'UPLOAD_SERVICE',
        transport: Transport.TCP,
        options: {
          host: '0.0.0.0',
          port: 3005,
        },
      },
    ]),
  ],
  controllers: [UploadController],
  providers: [UploadService],
})
export class UploadModule {}
