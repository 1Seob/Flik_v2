import { ApiProperty } from '@nestjs/swagger';
import { Tokens } from '../type/tokens.type';

export class TokenDto {
  @ApiProperty({
    description: 'Access token',
    type: String,
  })
  accessToken!: string;

  static from(tokens: Tokens): TokenDto {
    const { accessToken } = tokens;
    return { accessToken };
  }
}
