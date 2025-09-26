import { ApiProperty } from '@nestjs/swagger';
import { BookData } from '../type/book-data.type';
import { PageData } from 'src/page/type/page-type';
import { BasicBookDto } from './basic-book.dto';

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
    type: BasicBookDto,
  })
  book!: BasicBookDto;

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
      book: BasicBookDto.from(data, url),
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
