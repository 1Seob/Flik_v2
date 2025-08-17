import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { User } from '@prisma/client';

@Injectable()
export class AuthRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getUserById(id: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: { id },
    });
  } //jwt.strategy.ts에 쓰이는 테스트용 함수

  /*
  //추후 Supabase 연동 시 사용

  async isNicknameExists(nickname: string): Promise<boolean> {
    const user = await this.prisma.user.findUnique({
      where: { name: nickname },
      select: { id: true },
    });
    return !!user;
  }

  async getUserBySupabaseId(supabaseId: string): Promise<User | null> {
    return this.prisma.user.findFirst({
      where: {
        supabaseId,
        deletedAt: null,
      },
    });
  }

  async createUserWithSupabaseId(
    supabaseId: string,
    nickname: string,
  ): Promise<User> {
    return this.prisma.user.create({
      data: {
        supabaseId,
        name: nickname,
      },
    });
  }
  */
}
