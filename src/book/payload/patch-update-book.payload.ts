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
    description: '책 표지 이미지',
    type: 'string',
    format: 'binary',
  })
  coverImage?: Express.Multer.File;
}
