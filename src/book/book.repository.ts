import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';
import { SaveBookData } from './type/save-book-data.type';
import { UpdateBookData } from './type/update-book-data.type';
import { MetadataData } from './type/metadata-data.type';
import { BookQuery } from './query/book.query';
import { distributeParagraphs } from './parsing';
import { ParagraphData } from '../paragraph/type/paragraph-type';

@Injectable()
export class BookRepository {
  constructor(private readonly prisma: PrismaService) {}

  async getBookById(bookId: number): Promise<BookData | null> {
    return this.prisma.book.findUnique({
      where: {
        id: bookId,
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalParagraphsCount: true,
      },
    });
  }

  async saveBook(data: SaveBookData, paragraphs: string[]): Promise<BookData> {
    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn ?? null,
        paragraphs: {
          create: paragraphs.map((paragraph, i) => ({
            content: paragraph,
            order: i,
          })),
        },
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalParagraphsCount: true,
      },
    });
  }

  async deleteBook(bookId: number): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.bookLike.deleteMany({
        where: { bookId },
      }),
      this.prisma.paragraph.deleteMany({
        where: { bookId },
      }),
      this.prisma.book.delete({
        where: { id: bookId },
      }),
    ]);
  }

  async getBookByTitleAndAuthor(
    title: string,
    author: string,
  ): Promise<BookData | null> {
    return this.prisma.book.findFirst({
      where: {
        title,
        author,
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalParagraphsCount: true,
      },
    });
  }

  async getParagraphsByBookId(bookId: number): Promise<{ content: string }[]> {
    return this.prisma.paragraph.findMany({
      where: { bookId },
      select: {
        content: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async getBookParagraphs(bookId: number): Promise<ParagraphData[]> {
    return this.prisma.paragraph.findMany({
      where: { bookId },
      select: {
        id: true,
        content: true,
        order: true,
        bookId: true,
      },
      orderBy: { order: 'asc' },
    });
  }

  async updateBook(bookId: number, data: UpdateBookData): Promise<BookData> {
    return this.prisma.book.update({
      where: { id: bookId },
      data: {
        title: data.title,
        author: data.author,
        isbn: data.isbn ?? null,
        totalParagraphsCount: data.totalParagraphsCount,
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalParagraphsCount: true,
      },
    });
  }

  async getBooks(query: BookQuery): Promise<BookData[]> {
    return this.prisma.book.findMany({
      where: {
        ...(query.title && { title: query.title }),
        ...(query.author && { author: query.author }),
      },
      select: {
        id: true,
        title: true,
        author: true,
        isbn: true,
        views: true,
        totalParagraphsCount: true,
      },
    });
  }

  /*
  async toggleBookLike(bookId: number, userId: number): Promise<void> {
    const like = await this.prisma.bookLike.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
    });

    if (like) {
      await this.prisma.bookLike.delete({
        where: {
          userId_bookId: {
            userId,
            bookId,
          },
        },
      });
    } else {
      await this.prisma.bookLike.create({
        data: {
          bookId,
          userId,
        },
      });
    }
  }

  async getLikedBookIdsByUser(userId: number): Promise<number[]> {
    const likes = await this.prisma.bookLike.findMany({
      where: { userId },
      select: { bookId: true },
    });
    return likes.map((like) => like.bookId);
  }

  */

  async getBooksMetadata(
    offset: number,
    limit: number,
  ): Promise<MetadataData[]> {
    const books = await this.prisma.book.findMany({
      skip: offset,
      take: limit,
      select: {
        id: true,
        title: true,
        paragraphs: {
          select: {
            content: true,
          },
        },
      },
    });
    return books.map((book) => ({
      id: book.id,
      title: book.title,
      content: book.paragraphs.map((paragraph) => paragraph.content).join('\n'),
    }));
  }

  async createUserBookIfNotExists(
    userId: number,
    bookId: number,
  ): Promise<void> {
    const existing = await this.prisma.userBook.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });

    if (!existing) {
      await this.prisma.userBook.create({
        data: {
          userId,
          bookId,
        },
      });
    }
  }

  async getParagraphCountByBookId(bookId: number): Promise<number> {
    return this.prisma.paragraph.count({
      where: { bookId },
    });
  }

  async saveBookToUser(userId: number, bookId: number): Promise<void> {
    await this.prisma.bookSave.create({
      data: {
        userId,
        bookId,
      },
    });
  }

  async unsaveBookFromUser(userId: number, bookId: number): Promise<void> {
    await this.prisma.bookSave.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
  }

  async getSavedBookIdsByUser(userId: number): Promise<number[]> {
    const savedBooks = await this.prisma.bookSave.findMany({
      where: { userId },
      select: { bookId: true },
    });
    return savedBooks.map((savedBook) => savedBook.bookId);
  }

  async isBookSavedByUser(userId: number, bookId: number): Promise<boolean> {
    const savedBook = await this.prisma.bookSave.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    return savedBook !== null;
  }

  async getUserBook(
    userId: number,
    bookId: number,
  ): Promise<{ lastReadParagraphOrder: number } | null> {
    return this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { lastReadParagraphOrder: true },
    });
  }

  async createUserBook(
    userId: number,
    bookId: number,
    order = 0,
  ): Promise<void> {
    await this.prisma.userBook.create({
      data: {
        userId,
        bookId,
        lastReadParagraphOrder: order,
      },
    });
  }

  async getLastReadParagraph(bookId: number, userId: number): Promise<number> {
    const record = await this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: { lastReadParagraphOrder: true },
    });
    return record?.lastReadParagraphOrder ?? 0;
  }

  async updateLastReadParagraph(
    bookId: number,
    userId: number,
    order: number,
  ): Promise<void> {
    const record = await this.prisma.userBook.findFirst({
      where: {
        userId,
        bookId,
      },
    });

    if (!record) throw new Error('해당 레코드 없음');

    await this.prisma.userBook.update({
      where: {
        id: record.id, // ← PK로 update
      },
      data: {
        updatedAt: new Date(),
        lastReadParagraphOrder: order,
      },
    });
  }

  async getParagraphsByDay(bookId: number, day: number): Promise<string[]> {
    const all = await this.getParagraphsByBookId(bookId);
    const distributed = distributeParagraphs(
      Array.from({ length: all.length }, (_, i) => i),
    );
    const chapter = distributed[day - 1] || [];
    return chapter.map((i) => all[i].content);
  }

  async getReadingStreak(userId: number): Promise<number> {
    const dates = await this.prisma.user_reading_activity.findMany({
      where: { user_id: userId },
      select: { ended_at: true },
      orderBy: { ended_at: 'desc' },
    });

    const uniqueDates = new Set(
      dates.map((r) => r.ended_at.toISOString().slice(0, 10)),
    );

    let streak = 0;
    let today = new Date();

    while (true) {
      const dateStr = today.toISOString().slice(0, 10);
      if (uniqueDates.has(dateStr)) {
        streak++;
        today.setDate(today.getDate() - 1);
      } else {
        break;
      }
    }

    return streak;
  }
}
