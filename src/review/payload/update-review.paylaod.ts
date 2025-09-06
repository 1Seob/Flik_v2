import { ApiProperty } from '@nestjs/swagger';
import {
  IsNumber,
  IsString,
  Max,
  MaxLength,
  Min,
  MinLength,
} from 'class-validator';

export class UpdateReviewPayload {
  @IsString()
  @MinLength(1, { message: '리뷰 내용은 최소 1자 이상이어야 합니다.' })
  @MaxLength(100, { message: '리뷰 내용은 최대 100자 이하여야 합니다.' })
  @ApiProperty({
    description: '리뷰 내용',
    type: String,
  })
  content!: string;

  @IsNumber(
    { maxDecimalPlaces: 1 },
    { message: '소수점은 한 자리까지만 허용됩니다.' },
  )
  @Min(0.0, { message: '별점은 0.0 이상이어야 합니다.' })
  @Max(5.0, { message: '별점은 5.0 이하이어야 합니다.' })
  @ApiProperty({
    description: '별점 (0.0 ~ 5.0)',
    type: Number,
    minimum: 0.0,
    maximum: 5.0,
  })
  rating!: number;
}
