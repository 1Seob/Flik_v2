import { Injectable } from '@nestjs/common';
import { PrismaService } from '../common/services/prisma.service';
import { redis } from './redis.provider';
import { BookData } from 'src/book/type/book-data.type';
import { BookSearchQuery } from './query/book-search-query';

@Injectable()
export class SearchRepository {
  constructor(private readonly prisma: PrismaService) {}

  // Redis에 책 제목과 작가명을 초기 로딩하는 메서드
  // 이 메서드는 애플리케이션 시작 시 한 번 호출되어야 함
  async loadBooksToRedis(): Promise<void> {
    const books = await this.prisma.book.findMany({
      where: {
        deletedAt: null,
      },
    });

    const lexicalSearchKey = 'autocomplete:lexical';
    const viewsSearchKey = 'autocomplete:views';

    const pipeline = redis.pipeline();
    for (const book of books) {
      pipeline.zadd(lexicalSearchKey, 0, book.title);
      pipeline.zadd(lexicalSearchKey, 0, book.author);
      pipeline.zadd(viewsSearchKey, book.views, book.title);
    }
    await pipeline.exec();
  }

  // Redis에서 자동완성 검색 결과를 가져오는 메서드
  async searchAutocomplete(
    query: string,
  ): Promise<{ lexical: string[]; views: string[] }> {
    const lexicalSearchKey = 'autocomplete:lexical';
    const viewsSearchKey = 'autocomplete:views';
    const limit = 5;

    // 첫 번째: '포함 문자열' 검색 후 사전식 정렬
    const allLexicalResults = await redis.zrange(lexicalSearchKey, 0, -1);
    const filteredLexical = allLexicalResults
      .filter((member) => member.includes(query)) // 포함 문자열로 필터링
      .sort((a, b) => a.localeCompare(b, 'ko')) // 한글 사전식 정렬
      .slice(0, limit); // 5개만 가져오기

    // 두 번째: 조회수 순 검색
    const allViewsResults = await redis.zrevrangebyscore(
      viewsSearchKey,
      '+inf',
      '-inf',
    );
    const filteredViews = allViewsResults
      .filter((member) => member.includes(query)) // 포함 문자열로 필터링
      .slice(0, limit); // 5개만 가져오기

    return {
      lexical: filteredLexical,
      views: filteredViews,
    };
  }

  async getBooks(query: BookSearchQuery): Promise<BookData[]> {
    return this.prisma.book.findMany({
      where: {
        deletedAt: null,
        OR: [
          { title: { contains: query.query, mode: 'insensitive' } },
          { author: { contains: query.query, mode: 'insensitive' } },
        ],
      },
    });
  }

  async getAllBookIds(): Promise<number[]> {
    const books = await this.prisma.book.findMany({
      where: {
        deletedAt: null,
      },
      select: {
        id: true,
      },
    });
    return books.map((book) => book.id);
  }

  async getAllBookIsbns(): Promise<(string | null)[]> {
    const books = await this.prisma.book.findMany({
      where: {
        deletedAt: null,
        NOT: {
          isbn: null, // ISBN이 null이 아닌 책만 조회
        },
      },
      select: {
        isbn: true,
      },
    });
    return books.map((book) => book.isbn);
  }
}
