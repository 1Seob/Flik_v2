import { IsString, IsOptional } from 'class-validator';
import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SaveBookPayload {
  @IsString()
  @ApiProperty({
    description: '책 제목',
    type: String,
  })
  title!: string;

  @IsString()
  @ApiProperty({
    description: '책 저자',
    type: String,
  })
  author!: string;

  @IsOptional()
  @ApiPropertyOptional({
    description: '책 ISBN 코드',
    type: String,
  })
  isbn?: string | null;

  @ApiProperty({
    description: '총 문단 수',
    type: Number,
  })
  totalParagraphsCount!: number;
}
