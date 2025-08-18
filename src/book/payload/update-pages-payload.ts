import { IsString, IsInt } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class UpdatePagesPayload {
  @IsInt()
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @IsString()
  @ApiProperty({
    description: '파일 제목',
    type: String,
  })
  fileName!: string;
}
