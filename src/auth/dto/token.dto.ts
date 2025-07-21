import { ApiProperty } from '@nestjs/swagger';

export class TokenDto {
  @ApiProperty({
    description: 'Access token',
    type: String,
  })
  accessToken!: string;

  static from(accessToken: string): TokenDto {
    return { accessToken };
  }
}
