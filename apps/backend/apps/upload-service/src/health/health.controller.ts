import { Controller } from '@nestjs/common';
import { MessagePattern } from '@nestjs/microservices';
import { 
  HealthCheck, 
  HealthCheckService, 
  PrismaHealthIndicator
} from '@nestjs/terminus';
import { PrismaService } from '@repo/database';

@Controller()
export class HealthController {
  constructor(
    private health: HealthCheckService,
    private db: PrismaHealthIndicator,
    private prismaService: PrismaService,
  ) {}

  @MessagePattern({ cmd: 'health_check' })
  @HealthCheck()
  check() {
    return this.health.check([
      () => this.db.pingCheck('database', this.prismaService),
    ]);
  }
}
