import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsOptional } from 'class-validator';

export class CreateReadingEndLogPayload {
  @IsInt()
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @IsInt()
  @ApiProperty({
    description: '페이지 ID',
    type: Number,
  })
  pageId!: number;

  @IsInt()
  @ApiProperty({
    description: '페이지 번호',
    type: Number,
  })
  pageNumber!: number;

  @IsOptional()
  @ApiProperty({
    description: '챌린지 참여 ID',
    type: Number,
    nullable: true,
  })
  participantId?: number | null;

  @IsInt()
  @ApiProperty({
    description: '읽기 소요 시간',
    type: Number,
  })
  durationSec!: number;
}
