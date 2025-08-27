import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';
import { UpdateUserData } from './type/update-user-data.type';

@Injectable()
export class UserRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(userId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        id: userId,
        deletedAt: null,
      },
    });
  }

  async updateUser(userId: string, data: UpdateUserData): Promise<User> {
    return this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        gender: data.gender,
        birthday: data.birthday,
        name: data.name,
      },
    });
  }

  async deleteUser(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        deletedAt: new Date(),
      },
    });
  }

  async isNameExist(name: string): Promise<boolean> {
    const user = await this.prisma.user.findFirst({
      where: {
        name,
        deletedAt: null,
      },
    });
    return !!user;
  }

  async updateProfileImagePath(
    userId: string,
    profileImagePath: string | null,
  ): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        profileImagePath,
      },
    });
  }

  async updateLastAccess(userId: string): Promise<void> {
    await this.prisma.user.update({
      where: {
        id: userId,
      },
      data: {
        lastLoginAt: new Date(),
      },
    });
  }
}
