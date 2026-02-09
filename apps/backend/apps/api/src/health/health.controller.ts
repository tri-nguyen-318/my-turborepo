import { Controller, Get, Inject } from '@nestjs/common';
import { 
  HealthCheck, 
  HealthCheckService, 
  PrismaHealthIndicator 
} from '@nestjs/terminus';
import { ClientProxy } from '@nestjs/microservices';
import { PrismaService } from '@repo/database';
import { firstValueFrom } from 'rxjs';
import { timeout } from 'rxjs/operators';

@Controller('health')
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prismaService: PrismaService,
    @Inject('UPLOAD_SERVICE') private readonly client: ClientProxy,
  ) {}

  @Get()
  @HealthCheck()
  check() {
    return this.health.check([
      // 1. Database Connectivity
      () => this.db.pingCheck('database', this.prismaService),
      
      // 2. Upload Service (TCP Command Check)
      async () => {
        try {
          const result = await firstValueFrom(
            this.client.send({ cmd: 'health_check' }, {}).pipe(timeout(5000))
          );
          return {
            'upload-service': {
              status: result?.status === 'ok' || result?.status === 'shutting_down' ? 'up' : 'down',
              details: result
            }
          };
        } catch (e) {
          throw new Error('Upload Service Unreachable');
        }
      }
    ]);
  }
}
