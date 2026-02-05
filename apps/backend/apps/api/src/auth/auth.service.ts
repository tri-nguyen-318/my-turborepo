import { Injectable, ConflictException, UnauthorizedException } from '@nestjs/common';
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

    return this.generateToken(user.id, user.email, user.name, user.avatarUrl);
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

    return this.generateToken(user.id, user.email, user.name, user.avatarUrl);
  }

  async validateGoogleUser(details: { email: string; firstName: string; lastName: string; picture: string; googleId: string }) {
    const user = await this.prisma.user.findUnique({
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
          await this.prisma.user.update({
              where: { id: user.id },
              data: updateData
          });
      }
      return this.generateToken(user.id, user.email, updatedName, updatedAvatar);
    }

    const newUser = await this.prisma.user.create({
      data: {
        email: details.email,
        name: `${details.firstName} ${details.lastName}`,
        googleId: details.googleId,
        avatarUrl: details.picture
      },
    });

    return this.generateToken(newUser.id, newUser.email, newUser.name, newUser.avatarUrl);
  }

  private generateToken(userId: number, email: string, name: string | null, avatarUrl?: string | null) {
    const payload = { sub: userId, email };
    return {
      access_token: this.jwtService.sign(payload),
      user: {
          id: userId,
          email: email,
          name: name,
          avatarUrl: avatarUrl
      }
    };
  }
}
