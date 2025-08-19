import { ApiProperty } from '@nestjs/swagger';
import { IsDate, IsInt, IsOptional } from 'class-validator';
import { Type } from 'class-transformer';

export class CreateReadingStartLogPayload {
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

  @IsDate()
  @Type(() => Date)
  @ApiProperty({
    description: '읽기 시작 시간',
    type: Date,
  })
  startedAt!: Date;
}
