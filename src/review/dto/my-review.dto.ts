import { ApiProperty } from '@nestjs/swagger';
import { format } from 'date-fns-tz';
import { MyReviewData } from '../type/my-review-data.type';

export class MyReviewDto {
  @ApiProperty({
    description: '리뷰 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  bookId!: number;

  @ApiProperty({
    description: '책 제목',
    type: String,
  })
  bookTitle!: string;

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
  createdAt!: String;

  static from(data: MyReviewData): MyReviewDto {
    return {
      id: data.id,
      bookId: data.bookId,
      bookTitle: data.bookTitle,
      content: data.content,
      likeCount: data.likeCount,
      liked: data.liked,
      rating: data.rating,
      createdAt: this.toKST(data.createdAt),
    };
  }

  static fromArray(reviews: MyReviewData[]): MyReviewDto[] {
    return reviews.map((review) => this.from(review));
  }

  static toKST(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Seoul' });
  }
}

export class MyReviewListDto {
  @ApiProperty({
    description: '리뷰 목록',
    type: [MyReviewDto],
  })
  reviews!: MyReviewDto[];

  @ApiProperty({
    description: '리뷰 개수',
    type: Number,
  })
  count!: number;

  static from(reviews: MyReviewData[]): MyReviewListDto {
    return {
      reviews: MyReviewDto.fromArray(reviews),
      count: reviews.length,
    };
  }
}
