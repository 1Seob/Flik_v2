import {
  Body,
  Controller,
  HttpCode,
  Param,
  Post,
  Put,
  Req,
  Res,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiCreatedResponse,
  ApiNoContentResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
  ApiParam,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { SignUpPayload } from './payload/sign-up.payload';
import { Response, Request } from 'express';
import { LoginPayload } from './payload/login.payload';
import { ChangePasswordPayload } from './payload/change-password.payload';
import { CurrentUser } from './decorator/user.decorator';
import { UserBaseInfo } from './type/user-base-info.type';
import { JwtAuthGuard } from './guard/jwt-auth.guard';
import { SendEmailPayload } from './payload/send-email.payload';
import { VerificationPayload } from './payload/verification.payload';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-up')
  @ApiOperation({ summary: '회원가입' })
  @ApiCreatedResponse({ type: TokenDto })
  async signUp(
    @Body() payload: SignUpPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenDto> {
    const tokens = await this.authService.signUp(payload);

    // refresh Token은 쿠키로
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      // 이후 실제 도메인으로 변경
      domain: 'localhost',
    });

    return TokenDto.from(tokens.accessToken);
  }

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인' })
  @ApiOkResponse({ type: TokenDto })
  async login(
    @Body() payload: LoginPayload,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenDto> {
    const tokens = await this.authService.login(payload);

    // refresh Token은 쿠키로
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      // 이후 실제 도메인으로 변경
      domain: 'localhost',
    });

    return TokenDto.from(tokens.accessToken);
  }

  @Post('refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: TokenDto })
  async refresh(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenDto> {
    const tokens = await this.authService.refresh(req.cookies['refreshToken']);

    // refresh Token은 쿠키로
    res.cookie('refreshToken', tokens.refreshToken, {
      httpOnly: true,
      secure: true,
      sameSite: 'strict',
      // 이후 실제 도메인으로 변경
      domain: 'localhost',
    });

    return TokenDto.from(tokens.accessToken);
  }

  @Put('password')
  @HttpCode(204)
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth()
  @ApiOperation({ summary: '비밀번호 변경' })
  @ApiNoContentResponse()
  async changePassword(
    @Body() payload: ChangePasswordPayload,
    @CurrentUser() user: UserBaseInfo,
  ): Promise<void> {
    return this.authService.changePassword(payload, user);
  }

  @Post('send-verification-email')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiOperation({ summary: '회원가입 : 인증번호 이메일 전송' })
  async sendVerificationEmail(@Body() email: SendEmailPayload): Promise<void> {
    return this.authService.sendVerificationEmail(email);
  }

  @Post('verify-email')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiOperation({ summary: '회원가입 : 인증번호 검증' })
  async verifyEmail(@Body() payload: VerificationPayload): Promise<void> {
    return this.authService.verifyEmail(payload);
  }

  @Post('find-id')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiOperation({ summary: '아이디 찾기 : 이메일 전송' })
  async findId(@Body() payload: SendEmailPayload): Promise<void> {
    return this.authService.findId(payload);
  }

  @Post('find-password/:username')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiOperation({ summary: '비밀번호 찾기 : 인증번호 이메일 전송' })
  @ApiParam({ name: 'username', required: true, description: '로그인 ID' })
  async sendFindPasswordEmail(
    @Param('username') username: string,
    @Body() payload: SendEmailPayload,
  ): Promise<void> {
    console.log('Sending find password email for username:', username);
    return this.authService.sendFindPasswordEmail(username, payload);
  }

  @Post('verify-password')
  @HttpCode(204)
  @ApiNoContentResponse()
  @ApiOperation({ summary: '비밀번호 찾기 : 인증번호 검증' })
  async verifyPassword(@Body() payload: VerificationPayload): Promise<void> {
    return this.authService.verifyPassword(payload);
  }
}
