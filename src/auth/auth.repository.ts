import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserBaseInfo } from './type/user-base-info.type';
import { SignUpData } from './type/sign-up-data.type';
import { UpdateUserData } from './type/update-user-data.type';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: SignUpData): Promise<UserBaseInfo> {
    return this.prisma.user.create({
      data: {
        loginId: data.loginId,
        gender: data.gender,
        birthday: data.birthday,
        profileImageUrl: data.profileImageUrl,
        email: data.email,
        password: data.password,
        name: data.name,
        userCategories: {
          create: data.interestCategories.map((categoryId) => ({
            categoryId,
          })),
        },
      },
      select: {
        id: true,
        loginId: true,
        gender: true,
        birthday: true,
        profileImageUrl: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async updateUser(id: number, data: UpdateUserData): Promise<UserBaseInfo> {
    return this.prisma.user.update({
      where: {
        id: id,
      },
      data: {
        loginId: data.loginId ?? undefined,
        gender: data.gender ?? undefined,
        birthday: data.birthday ?? undefined,
        profileImageUrl: data.profileImageUrl,
        email: data.email,
        password: data.password,
        name: data.name,
        refreshToken: data.refreshToken,
      },
      select: {
        id: true,
        loginId: true,
        gender: true,
        birthday: true,
        profileImageUrl: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async getUserById(id: number): Promise<UserBaseInfo | null> {
    return this.prisma.user.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      select: {
        id: true,
        loginId: true,
        gender: true,
        birthday: true,
        profileImageUrl: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async getUserByEmail(email: string): Promise<UserBaseInfo | null> {
    return this.prisma.user.findUnique({
      where: {
        email,
        deletedAt: null,
      },
      select: {
        id: true,
        loginId: true,
        gender: true,
        birthday: true,
        profileImageUrl: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async getUserByLoginId(loginId: string): Promise<UserBaseInfo | null> {
    return this.prisma.user.findUnique({
      where: {
        loginId,
        deletedAt: null,
      },
      select: {
        id: true,
        loginId: true,
        gender: true,
        birthday: true,
        profileImageUrl: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async getUserByName(name: string): Promise<UserBaseInfo | null> {
    return this.prisma.user.findUnique({
      where: {
        name,
        deletedAt: null,
      },
      select: {
        id: true,
        loginId: true,
        gender: true,
        birthday: true,
        profileImageUrl: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }
}
