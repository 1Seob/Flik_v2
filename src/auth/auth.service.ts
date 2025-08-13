import {
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { AuthRepository } from './auth.repository';
import { Tokens } from './type/tokens.type';
import { TokenService } from './token.service';
import { UserBaseInfo } from './type/user-base-info.type';
import { AuthProvider, User } from '@prisma/client';

@Injectable()
export class AuthService {
  constructor(
    private readonly authRepository: AuthRepository,
    private readonly tokenService: TokenService,
  ) {}

  async generateTokens(userId: number): Promise<Tokens> {
    const tokens = this.tokenService.generateTokens({ userId });

    await this.authRepository.updateUser(userId, {
      refreshToken: tokens.refreshToken,
    });

    return tokens;
  }

  async refresh(refreshToken: string): Promise<Tokens> {
    const data = this.tokenService.verifyRefreshToken(refreshToken);

    const user = await this.authRepository.getUserById(data.userId);
    if (!user) {
      throw new NotFoundException('존재하지 않는 사용자입니다.');
    }

    if (user.refreshToken !== refreshToken) {
      throw new UnauthorizedException('유효하지 않은 토큰입니다.');
    }

    return this.generateTokens(user.id);
  }

  async getUserByRefreshToken(refreshToken: string): Promise<UserBaseInfo> {
    const data = this.tokenService.verifyRefreshToken(refreshToken);
    if (!data) throw new UnauthorizedException('유효하지 않은 토큰입니다.');

    const user = await this.authRepository.getUserById(data.userId);
    if (!user) throw new NotFoundException('존재하지 않는 사용자입니다.');

    return user;
  }

  async signInWithProvider(
    provider: AuthProvider,
    providerId: string,
  ): Promise<User> {
    // 1) 이미 있으면 바로 반환
    const existing = await this.authRepository.getUserByProvider(
      provider,
      providerId,
    );
    if (existing) return existing;

    // 2) 없으면 새로 생성
    return this.authRepository.createUserWithProvider(provider, providerId);
  }
}
