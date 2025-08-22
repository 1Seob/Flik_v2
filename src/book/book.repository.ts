import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';
import { SaveBookData } from './type/save-book-data.type';
import { UpdateBookData } from './type/update-book-data.type';
import { MetadataData } from './type/metadata-data.type';
import { redis } from '../search/redis.provider';
import { PageData } from 'src/page/type/page-type';

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
    await this.prisma.$transaction([
      this.prisma.bookLike.deleteMany({
        where: { bookId },
      }),
      this.prisma.page.deleteMany({
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
        pages: {
          select: {
            content: true,
          },
        },
      },
    });
    return books.map((book) => ({
      id: book.id,
      title: book.title,
      content: book.pages.map((page) => page.content).join('\n'),
    }));
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
}
