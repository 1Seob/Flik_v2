import { ApiProperty } from '@nestjs/swagger';
import { BookData } from '../type/book-data.type';
import { PageData } from 'src/page/type/page-type';

export class SimpleBookDto {
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
    description: '총 페이지 수',
    type: Number,
  })
  totalPages!: number;

  @ApiProperty({
    description: '책 커버 이미지 URL',
    type: String,
    nullable: true,
  })
  coverImageUrl!: string | null;

  static from(data: BookData, url?: string | null): SimpleBookDto {
    return {
      id: data.id,
      title: data.title,
      totalPages: data.totalPagesCount,
      coverImageUrl: url ?? null,
    };
  }

  static fromArray(data: BookData[], url?: (string | null)[]): SimpleBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) => SimpleBookDto.from(book, urls[index]));
  }
}

export class SimplePageDto {
  @ApiProperty({
    description: '페이지 ID',
    type: Number,
  })
  id!: number;

  @ApiProperty({
    description: '페이지 번호',
    type: Number,
  })
  pageNumber!: number;

  static from(data: PageData): SimplePageDto {
    return {
      id: data.id,
      pageNumber: data.number,
    };
  }
}

export class RecentBookDto {
  @ApiProperty({
    description: '책 정보',
    type: SimpleBookDto,
  })
  book!: SimpleBookDto;

  @ApiProperty({
    description: '최근 읽은 페이지 정보',
    type: SimplePageDto,
  })
  recentPage?: SimplePageDto;

  static from(
    data: BookData,
    page: PageData,
    url?: string | null,
  ): RecentBookDto {
    return {
      book: SimpleBookDto.from(data, url),
      recentPage: SimplePageDto.from(page),
    };
  }

  static fromArray(
    data: BookData[],
    page: PageData[],
    url?: (string | null)[],
  ): RecentBookDto[] {
    const urls = url ?? data.map(() => null);
    return data.map((book, index) =>
      RecentBookDto.from(book, page[index], urls[index]),
    );
  }
}

export class RecentBookListDto {
  @ApiProperty({
    description: '최근 읽은 책 목록',
    type: [RecentBookDto],
  })
  recentBooks!: RecentBookDto[];

  static from(
    data: BookData[],
    pageData: PageData[],
    url?: (string | null)[],
  ): RecentBookListDto {
    const urls = url ?? data.map(() => null);
    return {
      recentBooks: RecentBookDto.fromArray(data, pageData, urls),
    };
  }
}
