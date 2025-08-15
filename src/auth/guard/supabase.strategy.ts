/*

// Supabase JWT 전략 : 추후에 적용 예정

import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { passportJwtSecret } from 'jwks-rsa';
import { TokenSchema } from '../type/token-schema.type';
import { AuthRepository } from '../auth.repository';
import { UserBaseInfo } from '../type/user-base-info.type';
import { UserService } from 'src/user/user.service';
import { AuthService } from '../auth.service';


@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private readonly configService: ConfigService,
    private readonly authService: AuthService,
  ) {
    const supabaseUrl = configService.get<string>('NEXT_PUBLIC_SUPABASE_URL');
    if (!supabaseUrl) {
      throw new Error('SUPABASE_URL is not defined');
    }

    super({
      // 1. 토큰 서명 검증 설정
      secretOrKeyProvider: passportJwtSecret({
        cache: true,
        rateLimit: true,
        jwksRequestsPerMinute: 5,
        // Supabase의 공개 키 목록(JWKS) URI
        jwksUri: `${supabaseUrl}/auth/v1/.well-known/jwks.json`,
      }),

      // 2. 요청에서 JWT를 추출하는 방법 설정 (Bearer 토큰 사용)
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),

      // 3. 토큰 발급자(issuer)와 대상(audience) 검증
      // Supabase JWT의 'aud'는 'authenticated', 'iss'는 auth API URL 입니다.
      audience: 'authenticated',
      issuer: `${supabaseUrl}/auth/v1`,
      algorithms: ['RS256'], // Supabase는 RS256 알고리즘 사용
    });
  }

  // 4. 토큰 검증 성공 후 실행될 메소드
  //이 메소드의 반환값은 req.user에 담김
  async validate(payload: any) {
    const supabaseUserId = payload.sub; // Supabase의 고유 User ID
    const user = await this.authService.signIn(supabaseUserId);

    return user;
  }
}

*/
