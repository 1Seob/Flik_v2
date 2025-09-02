import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString } from 'class-validator';

export class CreateSentenceLikePayload {
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

  @IsString()
  @ApiProperty({
    description: '문장 내용',
    type: String,
  })
  text!: string;
}
