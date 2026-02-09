import { Injectable, Inject, HttpException } from '@nestjs/common';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class UploadService {
  constructor(@Inject('UPLOAD_SERVICE') private readonly client: ClientProxy) {}

  async initiate(filename: string, contentType: string) {
    try {
      return await firstValueFrom(
        this.client.send({ cmd: 'initiate_upload' }, { filename, contentType }),
      );
    } catch (error: any) {
      console.error('API Gateway: Initiate upload failed', error);
      throw new HttpException('Upload Service Error: ' + (error.message || error), 500);
    }
  }

  async getSignedUrl(key: string, uploadId: string, partNumber: number) {
    try {
      return await firstValueFrom(
        this.client.send({ cmd: 'get_signed_url' }, { key, uploadId, partNumber }),
      );
    } catch (error: any) {
      console.error('API Gateway: Get signed URL failed', error);
      throw new HttpException('Upload Service Error: ' + (error.message || error), 500);
    }
  }

  async complete(key: string, uploadId: string, parts: any[]) {
    try {
      return await firstValueFrom(
        this.client.send({ cmd: 'complete_upload' }, { key, uploadId, parts }),
      );
    } catch (error: any) {
      console.error('API Gateway: Complete upload failed', error);
      throw new HttpException('Upload Service Error: ' + (error.message || error), 500);
    }
  }

  async abort(key: string, uploadId: string) {
    try {
      return await firstValueFrom(this.client.send({ cmd: 'abort_upload' }, { key, uploadId }));
    } catch (error: any) {
      console.error('API Gateway: Abort upload failed', error);
      throw new HttpException('Upload Service Error: ' + (error.message || error), 500);
    }
  }
}
