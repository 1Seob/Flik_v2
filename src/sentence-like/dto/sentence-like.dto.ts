import { ApiProperty } from '@nestjs/swagger';
import { SentenceLikeData } from '../type/sentence-like-type';
import { format } from 'date-fns-tz';

export class SentenceLikeDto {
  @ApiProperty({
    description: '문장 좋아요 ID',
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
    description: '페이지 ID',
    type: Number,
  })
  pageId!: number;

  @ApiProperty({
    description: '문장 텍스트',
    type: String,
  })
  text!: string;

  @ApiProperty({
    description: '문장 시작 인덱스',
    type: Number,
  })
  startIndex!: number;

  @ApiProperty({
    description: '문장 끝 인덱스',
    type: Number,
  })
  endIndex!: number;

  @ApiProperty({
    description: '생성일',
    type: String,
    format: 'date-time',
  })
  createdAt!: string;

  static from(data: SentenceLikeData): SentenceLikeDto {
    return {
      id: data.id,
      userId: data.userId,
      bookId: data.bookId,
      pageId: data.pageId,
      text: data.text,
      startIndex: data.startIndex,
      endIndex: data.endIndex,
      createdAt: this.toKST(data.createdAt),
    };
  }

  static fromArray(likes: SentenceLikeData[]): SentenceLikeDto[] {
    return likes.map((like) => this.from(like));
  }

  static toKST(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Seoul' });
  }
}

export class SentenceLikeListDto {
  @ApiProperty({
    description: '문장 좋아요 목록',
    type: [SentenceLikeDto],
  })
  sentenceLikes!: SentenceLikeDto[];

  static from(data: SentenceLikeData[]): SentenceLikeListDto {
    return {
      sentenceLikes: SentenceLikeDto.fromArray(data),
    };
  }
}
