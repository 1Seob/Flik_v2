import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserBaseInfo } from './type/user-base-info.type';
import { UpdateUserData } from '../user/type/update-user-data.type';
import { User, AuthProvider } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: number): Promise<UserBaseInfo | null> {
    return this.prisma.user.findUnique({
      where: {
        id: id,
        deletedAt: null,
      },
      select: {
        id: true,
        provider: true,
        providerId: true,
        gender: true,
        birthday: true,
        profileImagePath: true,
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
        gender: data.gender ?? undefined,
        birthday: data.birthday ?? undefined,
        name: data.name,
        refreshToken: data.refreshToken,
      },
      select: {
        id: true,
        provider: true,
        providerId: true,
        gender: true,
        birthday: true,
        profileImagePath: true,
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
        provider: true,
        providerId: true,
        gender: true,
        birthday: true,
        profileImagePath: true,
        name: true,
        refreshToken: true,
      },
    });
  }

  async getUserByProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        provider,
        providerId,
        deletedAt: null,
      },
    });
  }

  async createUserWithProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User> {
    const user = await this.prisma.$transaction(async (tx) => {
      // ensure ProviderConfig exists (시드에서 생성했지만 혹시 없으면 생성)
      const cfg = await tx.providerConfig.upsert({
        where: { provider },
        update: {}, // prefix만 바꾸려면 update에 작성
        create: { provider, prefix: provider }, // 기본 prefix=provider
      });

      // counter 증가 (원자적)
      const updated = await tx.providerConfig.update({
        where: { provider },
        data: { counter: { increment: 1 } },
      });
      const nickname = `${cfg.prefix}_${updated.counter}`; // ex) google_1

      // 유저 생성
      const created = await tx.user.create({
        data: {
          provider,
          providerId,
          name: nickname, // unique
          // profileImagePath는 별도 API에서 업데이트
        },
      });

      return created;
    });
    return user;
  }
}
