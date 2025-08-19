import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateReadingStartLogPayload } from './payload/create-reading-start-log.payload';
import { UserBaseInfo } from 'src/auth/type/user-base-info.type';
import { CreateReadingEndLogPayload } from './payload/create-reading-end-log.payload';
import { ReadingLogDto } from './dto/reading-log.dto';

@Injectable()
export class ReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createReadingStartLog(
    payload: CreateReadingStartLogPayload,
    user: UserBaseInfo,
  ): Promise<ReadingLogDto> {
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
  ): Promise<ReadingLogDto> {
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

  async getReadingLog(id: number): Promise<ReadingLogDto | null> {
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
}
