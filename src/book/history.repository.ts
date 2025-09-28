import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateBookCompletionData } from './type/history/create-book-completion-data.type';
import { ReadingLogData } from 'src/read/type/reading-log-data.type';
import { BookCompletionData } from './type/history/book-completion-data.type';
import { UpdateBookCompletionData } from './type/history/update-book-completion-data.type';

@Injectable()
export class HistoryRepository {
  constructor(private readonly prisma: PrismaService) {}

  async completeBook(
    data: CreateBookCompletionData,
  ): Promise<BookCompletionData> {
    return this.prisma.bookCompletion.create({
      data: {
        bookId: data.bookId,
        userId: data.userId,
        startedAt: data.startedAt,
      },
    });
  }

  async findFirstLogByUserAndBook(
    userId: string,
    bookId: number,
  ): Promise<ReadingLogData | null> {
    return this.prisma.readingLog.findFirst({
      where: {
        userId,
        bookId,
        startedAt: { not: null }, // 진입 로그 기준
      },
      orderBy: {
        startedAt: 'asc', // 가장 처음 기록
      },
    });
  }

  async deleteBookCompletion(userId: string, bookId: number): Promise<void> {
    await this.prisma.bookCompletion.deleteMany({
      where: {
        userId,
        bookId,
      },
    });
  }

  async isBookCompletionExists(
    userId: string,
    bookId: number,
  ): Promise<boolean> {
    const count = await this.prisma.bookCompletion.count({
      where: {
        userId,
        bookId,
      },
    });
    return count > 0;
  }

  async getBookCompletionById(id: number): Promise<BookCompletionData | null> {
    return this.prisma.bookCompletion.findUnique({
      where: { id },
    });
  }

  async updateBookCompletion(
    id: number,
    data: UpdateBookCompletionData,
  ): Promise<BookCompletionData> {
    return this.prisma.bookCompletion.update({
      where: { id },
      data: {
        startedAt: data.startedAt,
        endedAt: data.endedAt,
      },
    });
  }
}
