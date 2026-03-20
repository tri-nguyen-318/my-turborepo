import {
  Controller,
  Post,
  Get,
  Body,
  UseGuards,
  Request,
  Res,
  Req,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';
import { AuthService } from '../application/auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(@Body() dto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.signup(dto);
    this.setRefreshTokenCookie(res, data.refresh_token);
    return { access_token: data.access_token, user: data.user };
  }

  @Post('signin')
  async signin(@Body() dto: SigninDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.signin(dto);
    this.setRefreshTokenCookie(res, data.refresh_token);
    return { access_token: data.access_token, user: data.user };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const data = await this.authService.validateGoogleUser(req.user);
    this.setRefreshTokenCookie(res, data.refresh_token);
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(
      `${frontendUrl}/en/signin?token=${data.access_token}&user=${encodeURIComponent(JSON.stringify(data.user))}`,
    );
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refresh(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No Refresh Token');

    const payload = JSON.parse(
      decodeURIComponent(
        atob(refreshToken.split('.')[1].replace(/-/g, '+').replace(/_/g, '/'))
          .split('')
          .map(c => '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2))
          .join(''),
      ),
    );

    const tokens = await this.authService.refreshTokens(payload.sub, refreshToken);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    return { access_token: tokens.access_token };
  }

  @Get('profile')
  @UseGuards(AuthGuard('jwt'))
  getProfile(@Request() req) {
    return this.authService.getProfile(req.user.sub ?? req.user.userId);
  }

  @Post('profile')
  @UseGuards(AuthGuard('jwt'))
  updateProfile(@Request() req, @Body() body: { name?: string; avatarUrl?: string }) {
    return this.authService.updateProfile(req.user.sub ?? req.user.userId, body);
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
  }
}
