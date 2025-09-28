import { ApiProperty } from '@nestjs/swagger';
import { BasicBookDto } from '../basic-book.dto';
import { ReadingStatusData } from 'src/book/type/history/reading-status-data.type';
import { SimpleSentenceLikeData } from 'src/book/type/history/simple-sentence-like-data.type';
import { format } from 'date-fns-tz';

export class SimpleSentenceLikeDto {
  @ApiProperty({
    description: '문장 좋아요 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '문장 텍스트',
    type: String,
  })
  text!: string;

  @ApiProperty({
    description: '페이지 번호',
    type: Number,
  })
  pageNumber!: number;

  static from(data: SimpleSentenceLikeData): SimpleSentenceLikeDto {
    return {
      id: data.id,
      text: data.text,
      pageNumber: data.pageNumber,
    };
  }

  static fromArray(data: SimpleSentenceLikeData[]): SimpleSentenceLikeDto[] {
    return data.map((item) => this.from(item));
  }
}

export class ReadingStatusDto {
  @ApiProperty({
    description: '책 정보',
    type: BasicBookDto,
  })
  book!: BasicBookDto;

  @ApiProperty({
    description: '마지막 독서 페이지 번호',
    type: Number,
  })
  lastPageNumber!: number;

  @ApiProperty({
    description: '시작 날짜',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  startedAt!: string | null;

  @ApiProperty({
    description: '완료 날짜',
    type: String,
    format: 'date-time',
    nullable: true,
  })
  endedAt!: string | null;

  @ApiProperty({
    description: '문장 좋아요 목록',
    type: [SimpleSentenceLikeDto],
  })
  sentenceLikes!: SimpleSentenceLikeDto[];

  static from(
    data: ReadingStatusData,
    sentenceLikes: SimpleSentenceLikeData[],
    url?: string | null,
  ): ReadingStatusDto {
    return {
      book: BasicBookDto.from(data.book, url),
      lastPageNumber: data.lastPageNumber,
      startedAt: this.toKST(data.startedAt),
      endedAt: this.toKST(data.endedAt),
      sentenceLikes: SimpleSentenceLikeDto.fromArray(sentenceLikes),
    };
  }

  static toKST(date: Date): string {
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Seoul' });
  }
}
