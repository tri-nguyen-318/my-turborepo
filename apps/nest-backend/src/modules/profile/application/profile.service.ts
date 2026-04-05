import { Injectable, ForbiddenException } from '@nestjs/common';
import { Prisma } from '@prisma/client';
import { PrismaService } from '../../../shared/database/prisma.service';

@Injectable()
export class ProfileService {
  constructor(private readonly prisma: PrismaService) {}

  async getPublicInfo() {
    const owner = await this.prisma.user.findFirst({ where: { role: 'ADMIN' } });
    if (!owner) return {};
    const info = await this.prisma.personalInfo.findUnique({ where: { userId: owner.id } });
    return { ...info, avatarUrl: owner.avatarUrl };
  }

  async getPersonalInfo(userId: number) {
    const info = await this.prisma.personalInfo.upsert({
      where: { userId },
      update: {},
      create: { userId },
    });
    return info;
  }

  async updatePersonalInfo(
    userRole: string,
    userId: number,
    data: Prisma.PersonalInfoUpdateInput & { id?: number; userId?: number },
  ) {
    if (userRole !== 'ADMIN') {
      throw new ForbiddenException('You do not have permission to update personal info.');
    }

    const updateData = Object.fromEntries(
      Object.entries(data).filter(([k]) => k !== 'id' && k !== 'userId'),
    ) as Prisma.PersonalInfoUncheckedUpdateInput;

    return this.prisma.personalInfo.upsert({
      where: { userId },
      update: updateData,
      create: { userId, ...updateData } as Prisma.PersonalInfoUncheckedCreateInput,
    });
  }
}
