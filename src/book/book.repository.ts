import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';
import { SaveBookData } from './type/save-book-data.type';
import { UpdateBookData } from './type/update-book-data.type';
import { redis } from '../search/redis.provider';
import { PageData } from 'src/page/type/page-type';

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

  async deleteBook(bookId: number): Promise<void> {
    await this.prisma.book.update({
      where: { id: bookId },
      data: { deletedAt: new Date() },
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

  async updateBook(bookId: number, data: UpdateBookData): Promise<BookData> {
    return this.prisma.book.update({
      where: { id: bookId },
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn ?? null,
        totalPagesCount: data.totalPagesCount,
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

  async saveBookToUser(userId: string, bookId: number): Promise<void> {
    await this.prisma.bookSave.create({
      data: {
        userId,
        bookId,
      },
    });
  }

  async unsaveBookFromUser(userId: string, bookId: number): Promise<void> {
    await this.prisma.bookSave.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
  }

  async getSavedBooksByUser(userId: string): Promise<BookData[]> {
    const savedBooks = await this.prisma.bookSave.findMany({
      where: { userId },
      select: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            isbn: true,
            views: true,
            totalPagesCount: true,
          },
        },
      },
      orderBy: { createdAt: 'desc' }, // 가장 최근에 저장된 순서대로
    });
    return savedBooks.map((item) => item.book);
  }

  async isBookSavedByUser(userId: string, bookId: number): Promise<boolean> {
    const savedBook = await this.prisma.bookSave.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    return savedBook !== null;
  }

  async incrementBookViews(bookId: number, title: string): Promise<void> {
    await this.prisma.book.update({
      where: { id: bookId },
      data: {
        views: {
          increment: 1,
        },
      },
    });
    await redis.zincrby('autocomplete:views', 1, title);
  }

  async updateBookPages(bookId: number, pages: string[]): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.page.deleteMany({
        where: { bookId },
      }),
      this.prisma.page.createMany({
        data: pages.map((content, index) => ({
          content,
          number: index + 1,
          bookId,
        })),
      }),
      this.prisma.book.update({
        where: { id: bookId },
        data: {
          totalPagesCount: pages.length,
        },
      }),
    ]);
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
}
