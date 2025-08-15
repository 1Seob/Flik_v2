import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsString } from 'class-validator';

export class BookSearchQuery {
  @IsString()
  @ApiPropertyOptional({
    description: '검색어',
    type: String,
  })
  query!: string;
}
