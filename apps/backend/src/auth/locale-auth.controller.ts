import { Controller, Get, UseGuards, Request } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Controller(':locale/auth')
export class LocaleAuthController {
  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {}
}
