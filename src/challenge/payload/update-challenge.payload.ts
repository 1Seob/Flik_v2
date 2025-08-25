import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateChallengePayload {
  @IsOptional()
  @IsString()
  @MinLength(2, { message: '챌린지 이름은 최소 2자 이상이어야 합니다.' })
  @MaxLength(25, { message: '챌린지 이름은 최대 25자 이하여야 합니다.' })
  @ApiPropertyOptional({
    description: '챌린지 이름',
    type: String,
  })
  name?: string | null;
}
