import { ApiProperty } from '@nestjs/swagger';
import { ReadingBookDto } from './reading-book.dto';
import { CompletedBookDto } from './completed-book.dto';

export class HistoryDto {
  @ApiProperty({
    description: '독서 중 목록',
    type: [ReadingBookDto],
  })
  readingBooks!: ReadingBookDto[];

  @ApiProperty({
    description: '완독 목록',
    type: [CompletedBookDto],
  })
  completedBooks!: CompletedBookDto[];
}
