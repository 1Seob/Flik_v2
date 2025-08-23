import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogData } from './type/reading-log-data.type';
import { BookData } from 'src/book/type/book-data.type';
import { PageData } from 'src/page/type/page-type';
import { ChallengeData } from 'src/challenge/type/challenge-data.type';

@Injectable()
export class ReadRepository {
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

  async getPageById(pageId: number): Promise<PageData | null> {
    return this.prisma.page.findUnique({
      where: {
        id: pageId,
      },
    });
  }

  async createReadingStartLog(
    payload: CreateReadingStartLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogData> {
    return this.prisma.readingLog.create({
      data: {
        startedAt: payload.startedAt,
        pageNumber: payload.pageNumber,
        user: {
          connect: {
            id: user.id,
          },
        },
        book: {
          connect: {
            id: payload.bookId,
          },
        },
        page: {
          connect: {
            id: payload.pageId,
          },
        },
        ...(payload.participantId !== undefined &&
        payload.participantId !== null
          ? {
              join: {
                connect: {
                  id: payload.participantId,
                },
              },
            }
          : {}),
      },
    });
  }

  async createReadingEndLog(
    payload: CreateReadingEndLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogData> {
    return this.prisma.readingLog.create({
      data: {
        endedAt: payload.endedAt,
        pageNumber: payload.pageNumber,
        durationSec: payload.durationSec,
        user: {
          connect: {
            id: user.id,
          },
        },
        book: {
          connect: {
            id: payload.bookId,
          },
        },
        page: {
          connect: {
            id: payload.pageId,
          },
        },
        ...(payload.participantId !== undefined &&
        payload.participantId !== null
          ? {
              join: {
                connect: {
                  id: payload.participantId,
                },
              },
            }
          : {}),
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
        participantId: null,
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

  async getChallengeLogsWithBookByDate(
    startDate: Date,
    endDate: Date,
    user: UserBaseInfo,
  ): Promise<(ReadingLogData & { book: BookData })[]> {
    return this.prisma.readingLog.findMany({
      where: {
        userId: user.id,
        participantId: {
          not: null,
        },
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

  async getChallengeByParticipantId(
    participantId: number,
  ): Promise<ChallengeData | null> {
    const join = await this.prisma.challengeJoin.findUnique({
      where: { id: participantId },
      include: {
        challenge: true,
      },
    });

    if (!join) return null;

    return {
      id: join.challenge.id,
      name: join.challenge.name,
      hostId: join.challenge.hostId,
      bookId: join.challenge.bookId,
      visibility: join.challenge.visibility,
      startTime: join.challenge.startTime,
      endTime: join.challenge.endTime,
      completedAt: join.challenge.completedAt,
      cancelledAt: join.challenge.cancelledAt,
    };
  }

  async isUserParticipating(
    challengeId: number,
    userId: string,
  ): Promise<boolean> {
    const participation = await this.prisma.challengeJoin.findFirst({
      where: {
        challengeId,
        userId,
      },
    });
    return participation !== null;
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
}
