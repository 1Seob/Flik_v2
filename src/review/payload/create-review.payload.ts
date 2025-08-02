import { ApiProperty } from '@nestjs/swagger';
import { IsInt, IsString, MaxLength } from 'class-validator';

export class CreateReviewPayload {
  @IsInt()
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @IsString()
  @MaxLength(500)
  @ApiProperty({
    description: '리뷰 내용',
    type: String,
  })
  content!: string;
}
