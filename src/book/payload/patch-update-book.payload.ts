import { IsString, IsOptional } from 'class-validator';
import { ApiPropertyOptional } from '@nestjs/swagger';
import { Transform } from 'class-transformer';

export class PatchUpdateBookPayload {
  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '책 제목',
    type: String,
  })
  title?: string | null;

  @IsOptional()
  @IsString()
  @Transform(({ value }) => (value === '' ? undefined : value))
  @ApiPropertyOptional({
    description: '책 저자',
    type: String,
  })
  author?: string | null;

  @IsOptional()
  @ApiPropertyOptional({
    description: 'ISBN 코드',
    type: String,
  })
  isbn?: string | null;

  @IsOptional()
  @ApiPropertyOptional({
    description: '총 페이지 수',
    type: Number,
  })
  totalPagesCount?: number;
}
