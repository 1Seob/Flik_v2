import {
  Body,
  Controller,
  HttpCode,
  Post,
  Req,
  Res,
  UseGuards,
  Get,
} from '@nestjs/common';
import {
  ApiCreatedResponse,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { Response, Request } from 'express';
import { GoogleAuthGuard } from './guard/jwt-auth.guard';
import { RequestRefreshPayload } from './payload/request-refresh.payload';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Get('v1/to-google') // ❷ 구글 로그인으로 이동하는 라우터 메서드
  @ApiOperation({ summary: '구글 로그인 페이지로 이동' })
  @ApiOkResponse({ description: 'Redirects to Google login page' })
  @UseGuards(GoogleAuthGuard)
  async googleAuth(@Req() req: Request) {}

  @Get('google/callback') // ❸ 구글 로그인 후 콜백 실행 후 이동 시 실행되는 라우터 메서드
  @ApiOperation({ summary: '구글 로그인 후 정보 가져오기 (리디렉션용)' })
  @ApiCreatedResponse({ type: TokenDto })
  @UseGuards(GoogleAuthGuard)
  async googleAuthRedirect(
    @Req() req: Request,
    @Res({ passthrough: true }) res: Response,
  ): Promise<TokenDto> {
    const userId = (req as any).user.id;
    const tokens = await this.authService.generateTokens(userId);
    return TokenDto.from(tokens, userId);
  }

  @Post('v1/refresh')
  @HttpCode(200)
  @ApiOperation({ summary: '토큰 갱신' })
  @ApiOkResponse({ type: TokenDto })
  async refresh(@Body() payload: RequestRefreshPayload): Promise<TokenDto> {
    const tokens = await this.authService.refresh(payload.refreshToken);
    const user = await this.authService.getUserByRefreshToken(
      payload.refreshToken,
    );
    return TokenDto.from(tokens, user.id);
  }
}
