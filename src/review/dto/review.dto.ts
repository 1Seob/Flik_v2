import { ApiProperty } from '@nestjs/swagger';
import { ReviewWithLikedData } from '../type/review-with-liked-data.type';

export class ReviewDto {
  @ApiProperty({
    description: '리뷰 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '사용자 ID',
    type: String,
  })
  userId!: string;

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
    description: '별점 (0.0 ~ 5.0)',
    type: Number,
  })
  rating!: number;

  @ApiProperty({
    description: '좋아요 여부',
    type: Boolean,
  })
  liked!: boolean;

  @ApiProperty({
    description: '리뷰 작성 시간',
    type: String,
    format: 'date-time',
  })
  createdAt!: Date;

  static from(data: ReviewWithLikedData): ReviewDto {
    return {
      id: data.id,
      userId: data.userId,
      bookId: data.bookId,
      content: data.content,
      likeCount: data.likeCount,
      liked: data.liked,
      rating: data.rating,
      createdAt: data.createdAt,
    };
  }

  static fromArray(reviews: ReviewWithLikedData[]): ReviewDto[] {
    return reviews.map((review) => this.from(review));
  }
}

export class ReviewListDto {
  @ApiProperty({
    description: '리뷰 목록',
    type: [ReviewDto],
  })
  reviews!: ReviewDto[];

  @ApiProperty({
    description: '리뷰 개수',
    type: Number,
  })
  count!: number;

  @ApiProperty({
    description: '평균 별점',
    type: Number,
  })
  averageRating!: number;

  static from(reviews: ReviewWithLikedData[]): ReviewListDto {
    return {
      reviews: ReviewDto.fromArray(reviews),
      count: reviews.length,
      averageRating:
        reviews.reduce((sum, review) => sum + review.rating, 0) /
        (reviews.length || 1), // 리뷰가 없을 때 나누기 0 방지
    };
  }
}
