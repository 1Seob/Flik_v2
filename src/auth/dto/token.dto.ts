import { ApiProperty } from '@nestjs/swagger';
import { Tokens } from '../type/tokens.type';

export class TokenDto {
  @ApiProperty({
    description: '유저 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: 'Access token',
    type: String,
  })
  accessToken!: string;

  @ApiProperty({
    description: 'Refresh token',
    type: String,
  })
  refreshToken!: string;

  static from(tokens: Tokens, userId: number): TokenDto {
    const { accessToken, refreshToken } = tokens;
    return { id: userId, accessToken, refreshToken };
  }
}
