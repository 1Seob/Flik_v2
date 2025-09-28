import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { CreateBookCompletionData } from './type/history/create-book-completion-data.type';
import { ReadingLogData } from 'src/read/type/reading-log-data.type';
import { BookCompletionData } from './type/history/book-completion-data.type';
import { UpdateBookCompletionData } from './type/history/update-book-completion-data.type';
import { BookCompletionWithBookData } from './type/history/book-completion-with-book-data.type';
import { LatestReadingLogWithBookData } from './type/history/latest-reading-log-with-book-data.type';
import { SimpleSentenceLikeData } from './type/history/simple-sentence-like-data.type';

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

  async findLastLogByUserAndBook(
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
        startedAt: 'desc', // 가장 최근 기록
      },
    });
  }

  async deleteBookCompletion(userId: string, bookId: number): Promise<void> {
    await this.prisma.bookCompletion.delete({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
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

  async getBookCompletionByUserIdAndBookId(
    userId: string,
    bookId: number,
  ): Promise<BookCompletionData | null> {
    return this.prisma.bookCompletion.findUnique({
      where: {
        userId_bookId: {
          userId,
          bookId,
        },
      },
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

  async getUserBookCompletions(
    userId: string,
  ): Promise<BookCompletionWithBookData[]> {
    const completions = await this.prisma.bookCompletion.findMany({
      where: { userId },
      include: {
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
      orderBy: {
        createdAt: 'desc',
      },
    });

    return completions.map((c) => ({
      id: c.id,
      userId: c.userId,
      bookId: c.bookId,
      startedAt: c.startedAt,
      endedAt: c.endedAt,
      book: c.book,
    }));
  }

  async findLatestLogsByUser(
    userId: string,
    excludeBookIds: number[] = [],
  ): Promise<LatestReadingLogWithBookData[]> {
    // 1. bookId별 최신 startedAt 뽑기
    const grouped = await this.prisma.readingLog.groupBy({
      by: ['bookId'],
      where: {
        userId,
        startedAt: { not: null },
        NOT: excludeBookIds.length
          ? { bookId: { in: excludeBookIds } }
          : undefined,
      },
      _max: {
        startedAt: true,
      },
    });

    if (grouped.length === 0) return [];

    // 2. 실제 ReadingLog + Book join
    const logs = await this.prisma.readingLog.findMany({
      where: {
        userId,
        OR: grouped.map((g) => ({
          bookId: g.bookId,
          startedAt: g._max.startedAt,
        })),
      },
      include: {
        book: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // 3. DTO 매핑
    return logs.map((log) => ({
      log: {
        id: log.id,
        userId: log.userId,
        bookId: log.bookId,
        pageId: log.pageId,
        pageNumber: log.pageNumber,
        startedAt: log.startedAt,
        endedAt: log.endedAt,
        durationSec: log.durationSec,
      },
      book: {
        id: log.book.id,
        title: log.book.title,
        author: log.book.author,
        isbn: log.book.isbn,
        views: log.book.views,
        totalPagesCount: log.book.totalPagesCount,
      },
    }));
  }

  async getSentenceLikesByUserAndBook(
    userId: string,
    bookId: number,
  ): Promise<SimpleSentenceLikeData[]> {
    const sentenceLikes = await this.prisma.sentenceLike.findMany({
      where: { userId, bookId },
      include: {
        page: {
          select: {
            number: true,
          },
        },
      },
      orderBy: {
        page: {
          number: 'asc', // 페이지 번호 낮은 순
        },
      },
    });

    return sentenceLikes.map((sl) => ({
      id: sl.id,
      text: sl.text,
      pageNumber: sl.page.number,
    }));
  }
}
