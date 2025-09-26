import { ApiProperty } from '@nestjs/swagger';
import { ReviewData } from '../type/review-data.type';
import { format } from 'date-fns-tz';

export class SimpleReviewDto {
  @ApiProperty({
    description: '리뷰 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '작성자 ID',
    type: String,
  })
  userId!: string;

  @ApiProperty({
    description: '작성자 닉네임',
    type: String,
  })
  nickname!: string;

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
    description: '리뷰 작성 시간',
    type: String,
    format: 'date-time',
  })
  createdAt!: String;

  static from(data: ReviewData, nickname: string): SimpleReviewDto {
    return {
      id: data.id,
      userId: data.userId,
      nickname: nickname,
      content: data.content,
      likeCount: data.likeCount,
      rating: data.rating,
      createdAt: this.toKST(data.createdAt),
    };
  }

  static toKST(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Seoul' });
  }

  static fromArray(
    reviews: ReviewData[],
    nicknames: string[],
  ): SimpleReviewDto[] {
    return reviews.map((review, index) => this.from(review, nicknames[index]));
  }
}

export class SimpleReviewListDto {
  @ApiProperty({
    description: '리뷰 목록',
    type: [SimpleReviewDto],
  })
  reviews!: SimpleReviewDto[];

  static from(reviews: ReviewData[], nicknames: string[]): SimpleReviewListDto {
    return {
      reviews: SimpleReviewDto.fromArray(reviews, nicknames),
    };
  }
}
