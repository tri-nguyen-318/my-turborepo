import { Controller } from '@nestjs/common';
import { MessagePattern, Payload } from '@nestjs/microservices';
import { InfoServiceService } from './info-service.service';

@Controller()
export class InfoServiceController {
  constructor(private readonly infoService: InfoServiceService) {}

  @MessagePattern('get_personal_info')
  getPersonalInfo(@Payload() userId: number) {
    return this.infoService.getPersonalInfo(userId);
  }

  @MessagePattern('update_personal_info')
  updatePersonalInfo(@Payload() data: { userId: number; info: any }) {
    return this.infoService.updatePersonalInfo(data.userId, data.info);
  }
}
