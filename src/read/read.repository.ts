import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { ReadingLogData } from './type/reading-log-data.type';
import { BookData } from 'src/book/type/book-data.type';
import { PageData } from 'src/sentence-like/type/page-type';
import { subDays } from 'date-fns';
import { CreateReadingStartLogData } from './type/create-reading-start-log-data.typte';
import { CreateReadingEndLogData } from './type/create-reading-end-log-data.type';
import { redis } from 'src/search/redis.provider';
import { SentenceLikeData } from 'src/sentence-like/type/sentence-like-type';

@Injectable()
export class ReadRepository {
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

  async getPageById(pageId: number): Promise<PageData | null> {
    return this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });
  }

  async createReadingStartLog(
    data: CreateReadingStartLogData,
  ): Promise<ReadingLogData> {
    return this.prisma.readingLog.create({
      data: {
        startedAt: new Date(),
        pageNumber: data.pageNumber,
        user: {
          connect: {
            id: data.userId,
          },
        },
        book: {
          connect: {
            id: data.bookId,
          },
        },
        page: {
          connect: {
            id: data.pageId,
          },
        },
      },
    });
  }

  async createReadingEndLog(
    data: CreateReadingEndLogData,
  ): Promise<ReadingLogData> {
    return this.prisma.readingLog.create({
      data: {
        endedAt: new Date(),
        pageNumber: data.pageNumber,
        durationSec: data.durationSec,
        user: {
          connect: {
            id: data.userId,
          },
        },
        book: {
          connect: {
            id: data.bookId,
          },
        },
        page: {
          connect: {
            id: data.pageId,
          },
        },
      },
    });
  }

  async getReadingLog(id: number): Promise<ReadingLogData | null> {
    return this.prisma.readingLog.findUnique({
      where: {
        id,
      },
    });
  }

  async deleteReadingLog(id: number): Promise<void> {
    await this.prisma.readingLog.delete({
      where: {
        id,
      },
    });
  }

  async getReadingLogsByBookId(
    bookId: number,
    user: UserBaseInfo,
  ): Promise<ReadingLogData[]> {
    return this.prisma.readingLog.findMany({
      where: {
        bookId,
        userId: user.id,
      },
    });
  }

  async getNormalLogsWithBookByDate(
    startDate: Date,
    endDate: Date,
    user: UserBaseInfo,
  ): Promise<(ReadingLogData & { book: BookData })[]> {
    return this.prisma.readingLog.findMany({
      where: {
        userId: user.id,
        OR: [
          { startedAt: { gte: startDate, lte: endDate } },
          { endedAt: { gte: startDate, lte: endDate } },
        ],
      },
      include: {
        book: true,
      },
    });
  }

  async getMonthlyReadingLogs(
    monthStart: Date,
    monthEnd: Date,
    user: UserBaseInfo,
  ) {
    return this.prisma.readingLog.findMany({
      where: {
        userId: user.id,
        OR: [
          { startedAt: { gte: monthStart, lte: monthEnd } },
          { endedAt: { gte: monthStart, lte: monthEnd } },
        ],
      },
      select: {
        startedAt: true,
        endedAt: true,
      },
    });
  }

  async getReadingStreak(user: UserBaseInfo) {
    return this.prisma.readingStreakHistory.findUnique({
      where: {
        userId: user.id,
      },
    });
  }

  async findUniqueReadingDates(userId: string, days: number): Promise<Date[]> {
    // 성능을 위해 최근 N일 데이터만 가져옴.
    const sinceDate = subDays(new Date(), days);

    const logs = await this.prisma.readingLog.findMany({
      where: {
        userId: userId,
        startedAt: {
          gte: sinceDate,
        },
      },
      select: {
        startedAt: true,
      },
      orderBy: {
        startedAt: 'desc',
      },
    });

    // startedAt이 null이 아닌 로그만 필터링
    return logs
      .map((log) => log.startedAt)
      .filter((date): date is Date => date !== null);
  }

  async initReadingStreak(userId: string): Promise<void> {
    await this.prisma.readingStreakHistory.create({
      data: {
        userId,
      },
    });
  }

  async updateReadingStreak(userId: string, days: number) {
    return this.prisma.readingStreakHistory.update({
      where: {
        userId,
      },
      data: {
        days,
      },
    });
  }

  async getLastNormalPage(
    bookId: number,
    userId: string,
  ): Promise<PageData | null> {
    const log = await this.prisma.readingLog.findFirst({
      where: {
        userId: userId,
        bookId: bookId,
      },
      orderBy: {
        startedAt: { sort: 'desc', nulls: 'last' },
      },
      select: {
        page: true,
      },
    });
    return log ? log.page : null;
  }

  async getFirstPageOfBook(bookId: number): Promise<PageData | null> {
    return this.prisma.page.findFirst({
      where: {
        bookId: bookId,
        number: 1,
      },
    });
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

  async getAllLastNormalPagesWithBooks(
    userId: string,
  ): Promise<(PageData & { book: BookData })[]> {
    const logs = await this.prisma.readingLog.findMany({
      where: {
        userId: userId,
      },
      orderBy: {
        startedAt: { sort: 'desc', nulls: 'last' },
      },
      select: {
        page: true,
        book: true,
      },
      distinct: ['bookId'],
    });
    return logs.map((log) => ({
      ...log.page,
      book: log.book,
    }));
  }
}
