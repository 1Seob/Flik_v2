import { Injectable } from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Tokens } from './type/tokens.type';
import { TokenService } from './token.service';
import { User } from '@prisma/client';
import { generateNickname } from './generate-nickname';
import { LoginPayload } from './payload/login.payload';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async login(payload: LoginPayload): Promise<Tokens> {
    return this.generateTokens(payload.userId);
  }

  private async generateTokens(userId: string): Promise<Tokens> {
    const tokens = this.tokenService.generateTokens({ userId });

    return tokens;
  }

  /*
  //추후 Supabase 연동 시 사용

  async generateUniqueNickname(): Promise<string> {
    for (let i = 0; i < 5; i++) {
      // 최대 5회 재시도
      const nickname = generateNickname();
      const exists = await this.authRepository.isNicknameExists(nickname);

      if (!exists) return nickname;
    }
    throw new Error('닉네임 생성 실패 (중복)');
  }

  async signIn(supabaseUserId: string): Promise<User> {
    const existing =
      await this.authRepository.getUserBySupabaseId(supabaseUserId);
    if (existing) return existing;

    const nickname = await this.generateUniqueNickname();
    return this.authRepository.createUserWithSupabaseId(
      supabaseUserId,
      nickname,
    );
  }
    */
}
