import { ApiProperty } from '@nestjs/swagger';
import { ReadingProgressData } from '../type/reading-progress-data.type';
import { BookDto } from 'src/book/dto/book.dto';

export class ReadingProgressDto {
  @ApiProperty({
    description: '읽은 책',
    type: BookDto,
  })
  book!: BookDto;

  @ApiProperty({
    description: '최대 페이지',
  })
  maxPageRead!: number;

  @ApiProperty({
    description: '달성률',
    type: Number,
  })
  progress!: number;

  @ApiProperty({
    description: '챌린지 참여 여부',
    type: Boolean,
  })
  challengeParticipation!: boolean;

  static from(data: ReadingProgressData): ReadingProgressDto {
    return {
      book: BookDto.from(data.book),
      maxPageRead: data.maxPageRead,
      progress: data.progress,
      challengeParticipation: data.challengeParticipation,
    };
  }

  static fromArray(data: ReadingProgressData[]): ReadingProgressDto[] {
    return data.map((item) => ReadingProgressDto.from(item));
  }
}

export class ReadingProgressListDto {
  @ApiProperty({
    description: '읽기 진행 목록',
    type: [ReadingProgressDto],
  })
  logs!: ReadingProgressDto[];

  static from(data: ReadingProgressData[]): ReadingProgressListDto {
    return {
      logs: ReadingProgressDto.fromArray(data),
    };
  }
}
