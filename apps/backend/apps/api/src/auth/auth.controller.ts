import { Controller, Post, Body, Get, UseGuards, Request, Res, Req, UnauthorizedException } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import { AuthGuard } from '@nestjs/passport';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Post('signup')
  async signup(@Body() signupDto: SignupDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.signup(signupDto);
    this.setRefreshTokenCookie(res, data.refresh_token);
    return {
      access_token: data.access_token,
      user: data.user,
    };
  }

  @Post('signin')
  async signin(@Body() signinDto: SigninDto, @Res({ passthrough: true }) res: Response) {
    const data = await this.authService.signin(signinDto);
    this.setRefreshTokenCookie(res, data.refresh_token);
    return {
      access_token: data.access_token,
      user: data.user,
    };
  }

  @Get('google')
  @UseGuards(AuthGuard('google'))
  async googleAuth(@Request() req) {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleAuthRedirect(@Request() req, @Res() res: Response) {
    const data = await this.authService.validateGoogleUser(req.user);
    this.setRefreshTokenCookie(res, data.refresh_token);
    const frontendUrl = this.configService.get('FRONTEND_URL') || 'http://localhost:3000';
    res.redirect(`${frontendUrl}/en/signin?token=${data.access_token}&user=${encodeURIComponent(JSON.stringify(data.user))}`);
  }

  @Post('logout')
  @UseGuards(AuthGuard('jwt'))
  async logout(@Request() req, @Res({ passthrough: true }) res: Response) {
    await this.authService.logout(req.user.sub);
    res.clearCookie('refresh_token');
    return { message: 'Logged out' };
  }

  @Post('refresh')
  async refreshTokens(@Req() req, @Res({ passthrough: true }) res: Response) {
    const refreshToken = req.cookies['refresh_token'];
    if (!refreshToken) throw new UnauthorizedException('No Refresh Token');

    // Decode the token to get userId (in a real app, use a dedicated strategy or verify signature first)
    // Here we rely on the service to verify the token signature and hash against DB.
    // However, we need the userId to look up the user. 
    // The service `refreshTokens` takes userId.
    // We can extract userId from the JWT payload without verifying signature first (service does that),
    // OR we can use the JwtService to decode it.
    // For simplicity, let's assume the payload has 'sub'.
    // Better approach: Create a RefreshTokenGuard. 
    // BUT for this task, I'll just decode it manually using a helper or just try/catch the service.
    // Wait, the service needs userId.
    
    // I'll assume the payload is standard.
    const base64Url = refreshToken.split('.')[1];
    const base64 = base64Url.replace(/-/g, '+').replace(/_/g, '/');
    const jsonPayload = decodeURIComponent(atob(base64).split('').map(function(c) {
        return '%' + ('00' + c.charCodeAt(0).toString(16)).slice(-2);
    }).join(''));
    const payload = JSON.parse(jsonPayload);
    
    const tokens = await this.authService.refreshTokens(payload.sub, refreshToken);
    this.setRefreshTokenCookie(res, tokens.refresh_token);
    
    return { access_token: tokens.access_token };
  }

  @UseGuards(AuthGuard('jwt'))
  @Get('profile')
  async getProfile(@Request() req) {
    const userId = req.user.sub || req.user.userId;
    return this.authService.getProfile(userId);
  }

  @UseGuards(AuthGuard('jwt'))
  @Post('profile')
  updateProfile(@Request() req, @Body() body: { name?: string; avatarUrl?: string }) {
    const userId = req.user.sub || req.user.userId;
    return this.authService.updateProfile(userId, body);
  }

  private setRefreshTokenCookie(res: Response, token: string) {
    res.cookie('refresh_token', token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'lax', // or 'strict'
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
  }
}
