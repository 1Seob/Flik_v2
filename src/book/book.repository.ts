import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';
import { SaveBookData } from './type/save-book-data.type';
import { UpdateBookData } from './type/update-book-data.type';
import { redis } from '../search/redis.provider';
import { PageData } from 'src/page/type/page-type';

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

  //사용자가 최근에 읽은 순서대로 책과 각 책의 마지막 독서 기록을 조회
  async findRecentBooksWithLastLog(userId: string, take: number = 10) {
    const latestLogs = await this.prisma.readingLog.groupBy({
      by: ['bookId'],
      where: { userId },
      _max: { startedAt: true },
      orderBy: { _max: { startedAt: 'desc' } },
      take,
    });

    const idsInOrder = latestLogs.map((log) => log.bookId);

    if (idsInOrder.length === 0) {
      return { booksWithLastLog: [], idsInOrder: [] };
    }

    const booksWithLastLog = await this.prisma.book.findMany({
      where: { id: { in: idsInOrder } },
      include: {
        logs: {
          where: { userId },
          orderBy: { startedAt: { sort: 'desc', nulls: 'last' } },
          take: 1,
        },
      },
    });

    return { booksWithLastLog, idsInOrder };
  }
}
