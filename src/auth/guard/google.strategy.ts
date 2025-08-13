import { Injectable } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { Profile, Strategy } from 'passport-google-oauth20';
import { AuthService } from '../auth.service';
import { AuthProvider } from '@prisma/client';

@Injectable()
// ❶ PassportStrategy(Strategy) 상속
export class GoogleStrategy extends PassportStrategy(Strategy) {
  constructor(private authService: AuthService) {
    super({
      clientID: process.env.GOOGLE_CLIENT_ID, // 클라이언트 ID
      clientSecret: process.env.GOOGLE_CLIENT_SECRET, // 시크릿
      callbackURL: process.env.GOOGLE_CALLBACK_URL, // 콜백 URL
      scope: ['profile'], // scope
    });
  }

  // ❹ OAuth 인증이 끝나고 콜백으로 실행되는 메서드
  async validate(accessToken: string, refreshToken: string, profile: Profile) {
    const provider: AuthProvider = AuthProvider.GOOGLE;
    const providerId = profile.id;

    // 가입/조회 후 user 반환 → req.user로 주입됨
    const user = await this.authService.signInWithProvider(
      provider,
      providerId,
    );
    return user;
  }
}
