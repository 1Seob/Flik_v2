import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';
import { SaveBookData } from './type/save-book-data.type';
import { PageData } from 'src/sentence-like/type/page-type';
import { Prisma } from '@prisma/client';
import { ReviewData } from 'src/review/type/review-data.type';
import { BookWithSummaryData } from './type/book-with-summary.type';

type TempReadingResult = {
  book: BookData;
  page: PageData;
};

@Injectable()
export class BookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getBookById(bookId: number): Promise<BookData | null> {
    return this.prisma.book.findUnique({
      where: {
        id: bookId,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalPagesCount: true,
      },
    });
  }

  async saveBook(data: SaveBookData, pages: string[]): Promise<BookData> {
    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn ?? null,
        pages: {
          create: pages.map((page, i) => ({
            content: page,
            number: i,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalPagesCount: true,
      },
    });
  }

  async getBookByTitleAndAuthor(
    title: string,
    author: string,
  ): Promise<BookData | null> {
    return this.prisma.book.findFirst({
      where: {
        title,
        author,
        deletedAt: null,
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalPagesCount: true,
      },
    });
  }

  async getPagesByBookId(bookId: number): Promise<{ content: string }[]> {
    return this.prisma.page.findMany({
      where: { bookId },
      select: {
        content: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  async getBookPages(bookId: number): Promise<PageData[]> {
    return this.prisma.page.findMany({
      where: { bookId },
      select: {
        id: true,
        content: true,
        number: true,
        bookId: true,
      },
      orderBy: { number: 'asc' },
    });
  }

  async findRecentBooksAndPages(
    userId: string,
    limit = 10,
  ): Promise<[BookData[], PageData[]]> {
    // [첫 번째 쿼리]
    // 사용자가 읽은 책(bookId)별로 가장 최근의 독서 기록(startedAt)을 찾음
    // 결과는 최근에 읽은 책 순서대로 정렬
    const latestLogsByBook = await this.prisma.readingLog.groupBy({
      by: ['bookId'],
      where: { userId },
      _max: {
        startedAt: true,
      },
      orderBy: {
        _max: {
          startedAt: 'desc',
        },
      },
      take: limit,
    });

    // 독서 기록이 없으면 빈 배열 튜플을 반환
    if (latestLogsByBook.length === 0) {
      return [[], []];
    }

    // [두 번째 쿼리]
    // 첫 번째 쿼리에서 찾은 bookId와 startedAt이 정확히 일치하는
    // 모든 독서 기록의 상세 정보를 한 번의 쿼리로 가져옴
    // DTO에 필요한 최소한의 필드만 선택(select)
    const recentReadingLogs = await this.prisma.readingLog.findMany({
      where: {
        userId,
        OR: latestLogsByBook.map((log) => ({
          bookId: log.bookId,
          startedAt: log._max.startedAt,
        })),
      },
      select: {
        bookId: true, // 정렬의 기준이 되므로 포함
        book: {
          select: {
            id: true,
            title: true,
            totalPagesCount: true,
            isbn: true,
          },
        },
        page: {
          select: {
            id: true,
            number: true,
          },
        },
      },
    });

    // [결과 정렬]
    // 두 번째 쿼리의 결과는 순서가 보장되지 않으므로, 첫 번째 쿼리 결과의 순서에 맞게 정렬
    const recentReadingsMap = new Map(
      recentReadingLogs.map((log) => [
        log.bookId,
        { book: log.book, page: log.page },
      ]),
    );

    const sortedRecentReadings = latestLogsByBook
      .map((log) => recentReadingsMap.get(log.bookId))
      .filter((result): result is TempReadingResult => result !== undefined);

    // [데이터 변환]
    // 정렬된 결과 객체 배열을 두 개의 개별 배열로 분리
    const books: BookData[] = sortedRecentReadings.map((r) => r.book);
    const pages: PageData[] = sortedRecentReadings.map((r) => r.page);

    // 최종적으로 튜플 형태로 반환
    return [books, pages];
  }

  async getAverageRatingByBookId(bookId: number): Promise<number | null> {
    const result = await this.prisma.review.aggregate({
      where: { bookId },
      _avg: {
        rating: true,
      },
    });

    // Prisma의 Decimal → number 변환 처리
    return result._avg.rating
      ? new Prisma.Decimal(result._avg.rating).toNumber()
      : null;
  }

  async getTopReviewsByBookId(bookId: number): Promise<ReviewData[]> {
    // 1. 좋아요 Top1
    const topLike = await this.prisma.review.findFirst({
      where: { bookId },
      orderBy: [{ likedBy: { _count: 'desc' } }, { createdAt: 'desc' }],
      include: {
        user: { select: { name: true } },
        _count: {
          select: { likedBy: true },
        },
      },
    });

    // 2. 별점 Top2 (좋아요 → 최신순 보조정렬)
    const topRatings = await this.prisma.review.findMany({
      where: { bookId },
      orderBy: [
        { rating: 'desc' },
        { likedBy: { _count: 'desc' } },
        { createdAt: 'desc' },
      ],
      take: 3, // 일단 3개 가져와서 나중에 중복 제거
      include: {
        user: { select: { name: true } },
        _count: {
          select: { likedBy: true },
        },
      },
    });

    // 3. 병합 + 중복 제거
    const merged: ReviewData[] = [];
    const seen = new Set<number>();

    if (topLike) {
      merged.push({
        id: topLike.id,
        userId: topLike.userId,
        nickname: topLike.user.name,
        bookId: topLike.bookId,
        content: topLike.content,
        likeCount: topLike._count.likedBy,
        rating: Number(topLike.rating),
        createdAt: topLike.createdAt,
      });
      seen.add(topLike.id);
    }

    for (const r of topRatings) {
      if (seen.has(r.id)) continue; // 중복 제거
      merged.push({
        id: r.id,
        userId: r.userId,
        nickname: r.user.name,
        bookId: r.bookId,
        content: r.content,
        likeCount: r._count.likedBy,
        rating: Number(r.rating),
        createdAt: r.createdAt,
      });
    }

    // 4. 3개가 안 되면 나머지 채우기 (리뷰 수가 부족한 경우)
    if (merged.length < 3) {
      const fillers = await this.prisma.review.findMany({
        where: { bookId, id: { notIn: Array.from(seen) } },
        orderBy: [{ createdAt: 'desc' }],
        take: 3 - merged.length,
        include: {
          user: { select: { name: true } },
          _count: { select: { likedBy: true } },
        },
      });

      for (const f of fillers) {
        merged.push({
          id: f.id,
          userId: f.userId,
          nickname: f.user.name,
          bookId: f.bookId,
          content: f.content,
          likeCount: f._count.likedBy,
          rating: Number(f.rating),
          createdAt: f.createdAt,
        });
      }
    }

    return merged.slice(0, 3);
  }

  async getBooksByIds(bookIds: number[]): Promise<BookData[]> {
    return this.prisma.book.findMany({
      where: {
        id: { in: bookIds },
        deletedAt: null,
      },
    });
  }

  async getFirstPageOfBook(bookId: number): Promise<PageData | null> {
    return this.prisma.page.findFirst({
      where: {
        bookId: bookId,
        number: 1,
      },
    });
  }

  async getAiBook(): Promise<BookWithSummaryData | null> {
    const books = await this.prisma.$queryRaw<BookWithSummaryData[]>`
      SELECT id, title, author, isbn, ai_summary AS summary
      FROM "book"
      WHERE ai_summary IS NOT NULL
      ORDER BY RANDOM()
      LIMIT 1
    `;

    return books.length > 0 ? books[0] : null;
  }

  async getSummaryByBookId(bookId: number): Promise<string | null> {
    const book = await this.prisma.book.findUnique({
      where: { id: bookId },
      select: { aiSummary: true },
    });
    return book?.aiSummary ?? null;
  }

  async getOtherBooksByAuthor(
    author: string,
    excludeBookId: number,
    limit = 5,
  ): Promise<BookData[]> {
    return this.prisma.book.findMany({
      where: {
        author,
        id: { not: excludeBookId },
      },
      take: limit,
      orderBy: { views: 'desc' },
    });
  }
}
