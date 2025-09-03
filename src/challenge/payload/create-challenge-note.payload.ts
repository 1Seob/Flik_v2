import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsInt, IsOptional, IsString, Min } from 'class-validator';

export class CreateChallengeNotePayload {
  @IsInt()
  @ApiProperty({
    description: '챌린지 ID',
    type: Number,
  })
  challengeId!: number;

  @IsString()
  @Min(1, { message: '노트 내용은 최소 1글자 이상이어야 합니다.' })
  @ApiProperty({
    description: '노트 내용',
    type: String,
  })
  body!: string;

  @IsInt()
  @IsOptional()
  @ApiPropertyOptional({
    description: '인용할 문장 좋아요 ID',
    type: Number,
  })
  quoteId?: number | null;
}
