import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserBaseInfo } from './type/user-base-info.type';
import { SignUpData } from './type/sign-up-data.type';
import { UpdateUserData } from './type/update-user-data.type';
import { VerificationData } from './type/verification-data.type';
import { ActionType } from '@prisma/client';
import { AttemptData } from './type/attempt-data.type';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createUser(data: SignUpData): Promise<UserBaseInfo> {
    return this.prisma.user.create({
      data: {
        loginId: data.loginId,
        gender: data.gender,
        birthday: data.birthday,
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
        profileImagePath: true,
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
        profileImagePath: true,
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
        profileImagePath: true,
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
        profileImagePath: true,
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
        profileImagePath: true,
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
        profileImagePath: true,
        email: true,
        password: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async saveVerificationCode(email: string, code: string): Promise<void> {
    await this.prisma.authCode.upsert({
      where: { email },
      update: {
        code,
        createdAt: new Date(),
        expiredAt: new Date(Date.now() + 5 * 60 * 1000), // 5분 후 만료
        tryCount: 0,
      },
      create: {
        email,
        code,
        expiredAt: new Date(Date.now() + 5 * 60 * 1000), // 5분 후 만료
        tryCount: 0,
      },
    });
  }

  async getVerificationData(email: string): Promise<VerificationData | null> {
    return this.prisma.authCode.findUnique({
      where: { email },
      select: {
        email: true,
        code: true,
        createdAt: true,
        expiredAt: true,
        tryCount: true,
      },
    });
  }

  async getVerificationTryCount(email: string): Promise<number> {
    const verificationData = await this.prisma.authCode.findUnique({
      where: { email },
      select: {
        tryCount: true,
      },
    });
    return verificationData ? verificationData.tryCount : 0;
  }

  async incrementVerificationTryCount(email: string): Promise<void> {
    await this.prisma.authCode.update({
      where: { email },
      data: {
        tryCount: {
          increment: 1,
        },
      },
    });
  }

  async deleteVerification(email: string): Promise<void> {
    await this.prisma.authCode.delete({
      where: { email },
    });
  }

  async isEmailExist(email: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { email, deletedAt: null },
    });
    return user !== null;
  }

  async saveAuthAttempt(email: string, type: ActionType): Promise<void> {
    await this.prisma.authAttempt.upsert({
      where: { email },
      update: {
        actionType: ActionType[type],
        attemptedAt: new Date(),
      },
      create: {
        email,
        actionType: ActionType[type],
        attemptedAt: new Date(),
      },
    });
  }

  async getAuthAttemptData(email: string): Promise<AttemptData | null> {
    return this.prisma.authAttempt.findUnique({
      where: { email },
      select: {
        email: true,
        actionType: true,
        attemptedAt: true,
      },
    });
  }
}
