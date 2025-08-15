import { Body, Controller, HttpCode, Post } from '@nestjs/common';
import { ApiOkResponse, ApiOperation, ApiTags } from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { TokenDto } from './dto/token.dto';
import { LoginPayload } from './payload/login.payload';

@Controller('auth')
@ApiTags('Auth API')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('login')
  @HttpCode(200)
  @ApiOperation({ summary: '로그인 (테스트 계정용)' })
  @ApiOkResponse({ type: TokenDto })
  async login(@Body() payload: LoginPayload): Promise<TokenDto> {
    const tokens = await this.authService.login(payload);

    return TokenDto.from(tokens);
  }
}
