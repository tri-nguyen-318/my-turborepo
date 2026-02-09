import { Injectable, ConflictException, UnauthorizedException, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '@repo/database';
import { SignupDto } from './dto/signup.dto';
import { SigninDto } from './dto/signin.dto';
import * as bcrypt from 'bcrypt';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  constructor(
    private prisma: PrismaService,
    private jwtService: JwtService,
  ) {}

  async signup(dto: SignupDto) {
    const existingUser = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: {
        email: dto.email,
        password: hashedPassword,
        name: dto.name,
      },
    });

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    
    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({
      where: { email: dto.email },
    });
    if (!user || !user.password) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(dto.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    };
  }

  async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string; googleId: string }) {
    let user = await this.prisma.user.findUnique({
      where: { email: details.email },
    });

    if (user) {
      let updatedName = user.name;
      let updatedAvatar = user.avatarUrl;
      
      if (!user.googleId || !user.name || !user.avatarUrl) {
          const updateData: any = {};
          if (!user.googleId) updateData.googleId = details.googleId;
          if (!user.name) {
            updateData.name = `${details.firstName} ${details.lastName}`;
            updatedName = updateData.name;
          }
          if (!user.avatarUrl) {
            updateData.avatarUrl = details.picture;
            updatedAvatar = details.picture;
          }
          user = await this.prisma.user.update({
              where: { id: user.id },
              data: updateData
          });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: details.email,
          name: `${details.firstName} ${details.lastName}`,
          googleId: details.googleId,
          avatarUrl: details.picture
        },
      });
    }

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);

    return {
      ...tokens,
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        avatarUrl: user.avatarUrl
      }
    };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    
    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    };
  }

  async updateProfile(userId: number, data: { name?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.update({
      where: { id: userId },
      data: {
        ...data
      }
    });

    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl
    };
  }

  async logout(userId: number) {
    return this.prisma.user.updateMany({
      where: {
        id: userId,
        hashedRefreshToken: {
          not: null,
        },
      },
      data: {
        hashedRefreshToken: null,
      },
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({
      where: { id: userId },
    });
    if (!user || !user.hashedRefreshToken)
      throw new ForbiddenException('Access Denied');

    const refreshTokenMatches = await bcrypt.compare(
      refreshToken,
      user.hashedRefreshToken,
    );
    if (!refreshTokenMatches) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(user.id, user.email);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({
      where: { id: userId },
      data: {
        hashedRefreshToken: hash,
      },
    });
  }

  async generateTokens(userId: number, email: string) {
    const [at, rt] = await Promise.all([
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '15m' },
      ),
      this.jwtService.signAsync(
        { sub: userId, email },
        { expiresIn: '7d' },
      ),
    ]);

    return {
      access_token: at,
      refresh_token: rt,
    };
  }
}
