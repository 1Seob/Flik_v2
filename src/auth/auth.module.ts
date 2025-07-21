import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { AuthRepository } from './auth.repository';
import { JwtStrategy } from './guard/jwt.strategy';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { BcryptPasswordService } from './bcrypt-password.service';
import { TokenService } from './token.service';

@Module({
  imports: [
    JwtModule.registerAsync({
      inject: [ConfigService],
      useFactory: async (configService: ConfigService) => ({
        secret: configService.get('JWT_ACCESS_TOKEN_SECRET'),
        signOptions: {
          expiresIn: `${configService.get('JWT_ACCESS_TOKEN_EXPIRE_TIME')}`,
        },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    AuthRepository,
    JwtStrategy,
    BcryptPasswordService,
    TokenService,
  ],
})
export class AuthModule {}
