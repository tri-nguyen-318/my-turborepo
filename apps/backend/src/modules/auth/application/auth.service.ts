import {
  Injectable,
  ConflictException,
  UnauthorizedException,
  ForbiddenException,
} from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import * as bcrypt from 'bcryptjs';
import { SignupDto } from '../presentation/dto/signup.dto';
import { SigninDto } from '../presentation/dto/signin.dto';
import { ACCESS_TOKEN_TTL, REFRESH_TOKEN_TTL } from '../auth.constants';
import { UserRole } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly jwtService: JwtService,
    private readonly config: ConfigService,
  ) {}

  async signup(dto: SignupDto) {
    const existing = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (existing) throw new ConflictException('User already exists');

    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const user = await this.prisma.user.create({
      data: { email: dto.email, password: hashedPassword, name: dto.name },
    });

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    const tokens = await this.generateTokens(user.id, user.email, role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return { ...tokens, user: this.toUserDto({ ...user, role }) };
  }

  async signin(dto: SigninDto) {
    const user = await this.prisma.user.findUnique({ where: { email: dto.email } });
    if (!user || !user.password) throw new UnauthorizedException('Invalid credentials');

    const valid = await bcrypt.compare(dto.password, user.password);
    if (!valid) throw new UnauthorizedException('Invalid credentials');

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    const tokens = await this.generateTokens(user.id, user.email, role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return { ...tokens, user: this.toUserDto({ ...user, role }) };
  }

  async validateGoogleUser(details: {
    email: string;
    firstName: string;
    lastName: string;
    picture: string;
    googleId: string;
  }) {
    let user = await this.prisma.user.findUnique({ where: { email: details.email } });

    if (user) {
      const updateData: { googleId?: string; name?: string; avatarUrl?: string } = {};
      if (!user.googleId) updateData.googleId = details.googleId;
      if (!user.name) updateData.name = `${details.firstName} ${details.lastName}`;
      if (!user.avatarUrl) updateData.avatarUrl = details.picture;
      if (Object.keys(updateData).length > 0) {
        user = await this.prisma.user.update({ where: { id: user.id }, data: updateData });
      }
    } else {
      user = await this.prisma.user.create({
        data: {
          email: details.email,
          name: `${details.firstName} ${details.lastName}`,
          googleId: details.googleId,
          avatarUrl: details.picture,
        },
      });
    }

    const role = await this.ensureAdminRole(user.id, user.email, user.role);
    const tokens = await this.generateTokens(user.id, user.email, role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return { ...tokens, user: this.toUserDto({ ...user, role }) };
  }

  async getProfile(userId: number) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user) throw new UnauthorizedException('User not found');
    return this.toUserDto(user);
  }

  async updateProfile(userId: number, data: { name?: string; avatarUrl?: string }) {
    const user = await this.prisma.user.update({ where: { id: userId }, data });
    return this.toUserDto(user);
  }

  async logout(userId: number) {
    return this.prisma.user.updateMany({
      where: { id: userId, hashedRefreshToken: { not: null } },
      data: { hashedRefreshToken: null },
    });
  }

  async refreshTokens(userId: number, refreshToken: string) {
    const user = await this.prisma.user.findUnique({ where: { id: userId } });
    if (!user || !user.hashedRefreshToken) throw new ForbiddenException('Access Denied');

    const matches = await bcrypt.compare(refreshToken, user.hashedRefreshToken);
    if (!matches) throw new ForbiddenException('Access Denied');

    const tokens = await this.generateTokens(user.id, user.email, user.role);
    await this.updateRefreshToken(user.id, tokens.refresh_token);
    return tokens;
  }

  private async generateTokens(userId: number, email: string, role: string) {
    const [access_token, refresh_token] = await Promise.all([
      this.jwtService.signAsync({ sub: userId, email, role }, { expiresIn: ACCESS_TOKEN_TTL }),
      this.jwtService.signAsync({ sub: userId, email, role }, { expiresIn: REFRESH_TOKEN_TTL }),
    ]);
    return { access_token, refresh_token };
  }

  private async updateRefreshToken(userId: number, refreshToken: string) {
    const hash = await bcrypt.hash(refreshToken, 10);
    await this.prisma.user.update({ where: { id: userId }, data: { hashedRefreshToken: hash } });
  }

  private toUserDto(user: {
    id: number;
    email: string;
    name: string | null;
    avatarUrl: string | null;
    role: UserRole;
  }) {
    return {
      id: user.id,
      email: user.email,
      name: user.name,
      avatarUrl: user.avatarUrl,
      role: user.role,
    };
  }

  private async ensureAdminRole(
    userId: number,
    email: string,
    currentRole: UserRole,
  ): Promise<UserRole> {
    const adminEmail = this.config.get<string>('ADMIN_EMAIL');
    if (adminEmail && email === adminEmail && currentRole !== UserRole.ADMIN) {
      await this.prisma.user.update({ where: { id: userId }, data: { role: UserRole.ADMIN } });
      return UserRole.ADMIN;
    }
    return currentRole;
  }
}
