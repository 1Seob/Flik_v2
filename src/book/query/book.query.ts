import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString } from 'class-validator';

export class BookQuery {
  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '책 제목',
    type: String,
  })
  title?: string;

  @IsOptional()
  @IsString()
  @ApiPropertyOptional({
    description: '작가',
    type: String,
  })
  author?: string;
}
