import { ApiProperty } from '@nestjs/swagger';
import { BookData } from '../type/book-data.type';
import { BasicBookDto } from './basic-book.dto';
import { ReviewData } from 'src/review/type/review-data.type';
import { SimpleReviewDto } from 'src/review/dto/simple-review.dto';

export class DetailedBookDto {
  @ApiProperty({
    description: '책 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '책 제목',
    type: String,
  })
  title!: string;

  @ApiProperty({
    description: '책 저자',
    type: String,
  })
  author!: string;

  @ApiProperty({
    description: '조회수',
    type: Number,
  })
  views!: number;

  @ApiProperty({
    description: '총 페이지 수',
    type: Number,
  })
  totalPages!: number;

  @ApiProperty({
    description: '평균 별점',
    type: Number,
  })
  averageRating!: number;

  @ApiProperty({
    description: '책 저장 여부',
    type: Boolean,
  })
  isSaved!: boolean;

  @ApiProperty({
    description: '책 커버 이미지 URL',
    type: String,
    nullable: true,
  })
  coverImageUrl!: string | null;

  @ApiProperty({
    description: '베스트 리뷰 목록',
    type: [SimpleReviewDto],
  })
  bestReviews!: SimpleReviewDto[];

  @ApiProperty({
    description: '유사 책 목록',
    type: [BasicBookDto],
  })
  similarBooks!: BasicBookDto[];

  @ApiProperty({
    description: '미리보기',
    type: String,
  })
  preview!: string;

  static from(
    data: BookData,
    reviews: ReviewData[],
    nicknames: string[],
    similarBooks: BookData[],
    averageRating: number,
    isSaved: boolean,
    preview: string,
    url?: string | null,
    similarBooksUrl?: (string | null)[],
  ): DetailedBookDto {
    const similarBooksUrls = similarBooksUrl ?? similarBooks.map(() => null);
    return {
      id: data.id,
      title: data.title,
      author: data.author,
      views: data.views,
      totalPages: data.totalPagesCount,
      coverImageUrl: url ?? null,
      averageRating: averageRating,
      isSaved: isSaved,
      preview: preview,
      bestReviews: SimpleReviewDto.fromArray(reviews, nicknames),
      similarBooks: BasicBookDto.fromArray(similarBooks, similarBooksUrls),
    };
  }
}
