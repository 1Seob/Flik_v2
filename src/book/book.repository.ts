import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';
import { SaveBookData } from './type/save-book-data.type';
import { UpdateBookData } from './type/update-book-data.type';
import { MetadataData } from './type/metadata-data.type';
import { BookQuery } from './query/book.query';

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
        coverImageUrl: true,
      },
    });
  }

  async saveBook(data: SaveBookData, paragraphs: string[]): Promise<BookData> {
    return this.prisma.book.create({
      data: {
        title: data.title,
        author: data.author,
        coverImageUrl: data.coverImageUrl,
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
        coverImageUrl: true,
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
        coverImageUrl: true,
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

  async updateBook(bookId: number, data: UpdateBookData): Promise<BookData> {
    return this.prisma.book.update({
      where: { id: bookId },
      data: {
        title: data.title,
        author: data.author,
        ...(data.coverImageUrl !== undefined && {
          coverImageUrl: data.coverImageUrl,
        }), // undefined이면 기존 값 유지
      },
      select: {
        id: true,
        title: true,
        author: true,
        coverImageUrl: true,
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
        coverImageUrl: true,
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
}
