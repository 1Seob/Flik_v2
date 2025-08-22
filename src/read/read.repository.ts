import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogData } from './type/reading-log-data.type';
import { BookData } from 'src/book/type/book-data.type';

@Injectable()
export class ReadRepository {
  constructor(private readonly prisma: PrismaService) {}

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
              participant: {
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
              participant: {
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
}
