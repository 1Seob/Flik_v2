import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from 'src/book/type/book-data.type';

@Injectable()
export class LibraryRepository {
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

  async saveBookToUser(userId: string, bookId: number): Promise<void> {
    await this.prisma.bookSave.create({
      data: {
        userId,
        bookId,
      },
    });
  }

  async isBookSavedByUser(userId: string, bookId: number): Promise<boolean> {
    const savedBook = await this.prisma.bookSave.findUnique({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
    return savedBook !== null;
  }

  async unsaveBookFromUser(userId: string, bookId: number): Promise<void> {
    await this.prisma.bookSave.delete({
      where: {
        userId_bookId: { userId, bookId },
      },
    });
  }
}
