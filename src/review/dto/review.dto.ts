import { ApiProperty } from '@nestjs/swagger';
import { ReviewData } from '../type/review-data.type';

export class ReviewDto {
  @ApiProperty({
    description: '리뷰 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '사용자 ID',
    type: Number,
  })
  userId!: number;

  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '리뷰 내용',
    type: String,
  })
  content!: string;

  @ApiProperty({
    description: '좋아요 수',
    type: Number,
  })
  likeCount!: number;

  @ApiProperty({
    description: '리뷰 작성 시간',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  static from(data: ReviewData): ReviewDto {
    return {
      id: data.id,
      userId: data.userId,
      bookId: data.bookId,
      content: data.content,
      likeCount: data.likeCount,
      createdAt: data.createdAt,
    };
  }

  static fromArray(reviews: ReviewData[]): ReviewDto[] {
    return reviews.map((review) => this.from(review));
  }
}

export class ReviewListDto {
  @ApiProperty({
    description: '리뷰 목록',
    type: [ReviewDto],
  })
  reviews!: ReviewDto[];

  static from(reviews: ReviewData[]): ReviewListDto {
    return {
      reviews: ReviewDto.fromArray(reviews),
    };
  }
}
