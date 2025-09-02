import { ApiProperty } from '@nestjs/swagger';
import { SentenceLikeData } from '../type/sentence-like-type';

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
    description: '생성일',
    type: Date,
  })
  createdAt!: Date;

  static from(data: SentenceLikeData): SentenceLikeDto {
    return {
      id: data.id,
      userId: data.userId,
      bookId: data.bookId,
      pageId: data.pageId,
      text: data.text,
      createdAt: data.createdAt,
    };
  }

  static fromArray(likes: SentenceLikeData[]): SentenceLikeDto[] {
    return likes.map((like) => this.from(like));
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
