import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from '../application/profile.service';
import { UpdatePersonalInfoDto } from './dto/update-personal-info.dto';

interface JwtRequest {
  user: { userId: number; email: string; role: string };
}

@Controller('info')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get()
  getPublicInfo() {
    return this.profileService.getPublicInfo();
  }

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyInfo(@Request() req: JwtRequest) {
    return this.profileService.getPersonalInfo(Number(req.user.userId));
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateMyInfo(@Request() req: JwtRequest, @Body() body: UpdatePersonalInfoDto) {
    return this.profileService.updatePersonalInfo(req.user.role, Number(req.user.userId), body);
  }
}
