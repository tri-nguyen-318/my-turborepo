import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { UploadService } from './upload.service';

@Controller()
export class UploadController {
  constructor(private readonly service: UploadService) {}

  @MessagePattern({ cmd: 'initiate_upload' })
  initiate(@Payload() data: { filename: string; contentType: string }) {
    return this.service.initiate(data.filename, data.contentType);
  }

  @MessagePattern({ cmd: 'get_signed_url' })
  url(@Payload() data: { key: string; uploadId: string; partNumber: number }) {
    return this.service.getSignedUrl(data.key, data.uploadId, data.partNumber);
  }

  @MessagePattern({ cmd: 'complete_upload' })
  complete(@Payload() data: { key: string; uploadId: string; parts: { PartNumber: number; ETag: string }[] }) {
    return this.service.complete(data.key, data.uploadId, data.parts);
  }

  @MessagePattern({ cmd: 'abort_upload' })
  abort(@Payload() data: { key: string; uploadId: string }) {
    return this.service.abort(data.key, data.uploadId);
  }
}
