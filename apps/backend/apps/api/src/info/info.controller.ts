import { Controller, Get, Put, Patch, Body, UseGuards, Request, Inject, ForbiddenException } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ClientProxy } from '@nestjs/microservices';
import { firstValueFrom } from 'rxjs';

@Controller('info')
export class InfoController {
  constructor(@Inject('INFO_SERVICE') private readonly infoService: ClientProxy) {}

  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  async getMyInfo(@Request() req) {
    try {
      console.log('API Gateway: getMyInfo', req.user);
      const userId = Number(req.user.userId); // Ensure it's a number
      const info = await firstValueFrom(this.infoService.send('get_personal_info', userId));
      // Return empty object instead of null to ensure valid JSON response
      return info || {};
    } catch (error) {
      console.error('API Gateway: getMyInfo failed', error);
      throw error;
    }
  }

  @Patch('me')
  @UseGuards(AuthGuard('jwt'))
  async updateMyInfo(@Request() req, @Body() body: any) {
    try {
      console.log('API Gateway: updateMyInfo', req.user, body);
      
      // Permission check: Only specific email allowed to update
      const userEmail = req.user.email;
      const ALLOWED_EMAIL = 'nguyenhuutri31081999nht@gmail.com';
      
      if (userEmail !== ALLOWED_EMAIL) {
        console.warn(`Blocked unauthorized update attempt from ${userEmail}`);
        throw new ForbiddenException('You do not have permission to update personal info.');
      }

      const userId = Number(req.user.userId); // Ensure it's a number
      return await firstValueFrom(
        this.infoService.send('update_personal_info', { userId: userId, info: body }),
      );
    } catch (error) {
      console.error('API Gateway: updateMyInfo failed', error);
      throw error;
    }
  }
}
