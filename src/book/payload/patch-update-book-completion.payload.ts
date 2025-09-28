import { IsOptional, IsDate } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class PatchUpdateBookCompletionPayload {
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: '독서 시작 시간',
    type: Date,
  })
  startedAt?: Date | null;

  @IsOptional()
  @Type(() => Date)
  @IsDate()
  @ApiPropertyOptional({
    description: '독서 종료 시간',
    type: Date,
  })
  endedAt?: Date | null;
}
