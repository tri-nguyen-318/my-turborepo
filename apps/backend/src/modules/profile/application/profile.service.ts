import { Injectable, ForbiddenException } from '@nestjs/common';
import { PrismaService } from '../../../shared/database/prisma.service';

const ALLOWED_EMAIL = 'nguyenhuutri31081999nht@gmail.com';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicInfo() {
    const owner = await this.prisma.user.findUnique({ where: { email: ALLOWED_EMAIL } });
    if (!owner) return {};
    const info = await this.prisma.personalInfo.findUnique({ where: { userId: owner.id } });
    return { ...info, avatarUrl: owner.avatarUrl };
  }

  async getPersonalInfo(userId: number) {
    return this.prisma.personalInfo.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
  }

  async updatePersonalInfo(userEmail: string, userId: number, data: any) {
    if (userEmail !== ALLOWED_EMAIL) {
      throw new ForbiddenException('You do not have permission to update personal info.');
    }

    const { id, userId: _uid, ...updateData } = data;

    return this.prisma.personalInfo.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData },
    });
  }
}
