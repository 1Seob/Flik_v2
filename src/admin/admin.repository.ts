import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from 'src/book/type/book-data.type';
import { UpdateBookData } from 'src/book/type/update-book-data.type';

@Injectable()
export class AdminRepository {
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

  async deleteBook(bookId: number): Promise<void> {
    await this.prisma.book.update({
      where: { id: bookId },
      data: { deletedAt: new Date() },
    });
  }
}
