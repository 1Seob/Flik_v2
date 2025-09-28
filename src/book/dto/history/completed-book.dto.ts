import { ApiProperty } from '@nestjs/swagger';
import { BasicBookDto } from '../basic-book.dto';
import { format } from 'date-fns-tz';
import { CompletedBookData } from 'src/book/type/history/completed-book-data.type';

export class CompletedBookDto {
  @ApiProperty({
    description: '완독 정보 ID',
    type: Number,
    nullable: true,
  })
  id!: number | null;

  @ApiProperty({
    description: '책 정보',
    type: BasicBookDto,
  })
  book!: BasicBookDto;

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
    description: '완료 여부',
    type: Boolean,
  })
  completed!: boolean;

  static from(data: CompletedBookData, url?: string | null): CompletedBookDto {
    return {
      id: data.id,
      book: BasicBookDto.from(data.book, url),
      startedAt: this.toKST(data.startedAt),
      endedAt: this.toKST(data.endedAt),
      completed: data.completed,
    };
  }

  static fromArray(
    data: CompletedBookData[],
    url?: (string | null)[],
  ): CompletedBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((item, index) => CompletedBookDto.from(item, urls[index]));
  }

  static toKST(date: Date | null): string | null {
    if (!date) return null;
    return format(date, "yyyy-MM-dd'T'HH:mm:ssXXX", { timeZone: 'Asia/Seoul' });
  }
}
