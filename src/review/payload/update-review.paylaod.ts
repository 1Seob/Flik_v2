import { ApiProperty } from '@nestjs/swagger';
import { IsString, MaxLength } from 'class-validator';

export class UpdateReviewPayload {
  @IsString()
  @MaxLength(500)
  @ApiProperty({
    description: '리뷰 내용',
    type: String,
  })
  content!: string;
}
