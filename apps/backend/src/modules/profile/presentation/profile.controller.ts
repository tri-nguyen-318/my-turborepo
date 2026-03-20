import { Controller, Get, Patch, Body, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ProfileService } from '../application/profile.service';

@Controller('info')
export class ProfileController {
  constructor(private readonly profileService: ProfileService) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  getMyInfo(@Request() req) {
    return this.profileService.getPersonalInfo(Number(req.user.userId));
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  updateMyInfo(@Request() req, @Body() body: any) {
    return this.profileService.updatePersonalInfo(req.user.email, Number(req.user.userId), body);
  }
}
