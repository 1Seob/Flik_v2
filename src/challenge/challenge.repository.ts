import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateChallengeData } from './type/create-challenge-data.type';
import { ChallengeData } from './type/challenge-data.type';
import { ParticipantStatus } from '@prisma/client';
import { BookData } from 'src/book/type/book-data.type';
import { ParticipantData } from './type/participant-data.type';

@Injectable()
export class ChallengeRepository {
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

  async createChallenge(data: CreateChallengeData): Promise<ChallengeData> {
    return this.prisma.challenge.create({
      data: {
        hostId: data.hostId,
        name: data.name,
        bookId: data.bookId,
        visibility: data.visibility,
        startTime: data.startTime,
        endTime: data.endTime,
        challengeJoin: {
          create: {
            userId: data.hostId,
            status: ParticipantStatus.JOINED,
          },
        },
      },
      select: {
        id: true,
        hostId: true,
        name: true,
        bookId: true,
        visibility: true,
        startTime: true,
        endTime: true,
        completedAt: true,
        cancelledAt: true,
        challengeJoin: true,
      },
    });
  }

  async getChallengeById(id: number): Promise<ChallengeData | null> {
    return this.prisma.challenge.findUnique({
      where: {
        id,
        cancelledAt: null,
      },
      select: {
        id: true,
        hostId: true,
        name: true,
        bookId: true,
        visibility: true,
        startTime: true,
        endTime: true,
        completedAt: true,
        cancelledAt: true,
        challengeJoin: true,
      },
    });
  }

  async deleteChallenge(id: number): Promise<void> {
    await this.prisma.challenge.update({
      where: {
        id,
      },
      data: {
        cancelledAt: new Date(),
      },
    });
  }

  async getParticipantsByChallengeId(
    challengeId: number,
  ): Promise<ParticipantData[]> {
    const joins = await this.prisma.challengeJoin.findMany({
      where: { challengeId },
      include: {
        user: {
          select: {
            name: true,
            lastLoginAt: true,
          },
        },
        logs: {
          select: {
            pageNumber: true,
          },
        },
      },
    });

    return joins.map((join) => ({
      id: join.id,
      name: join.user.name,
      maxPageRead:
        join.logs.length > 0
          ? Math.max(...join.logs.map((l) => l.pageNumber))
          : 0,
      lastLoginAt: join.user.lastLoginAt,
    }));
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

  async joinChallenge(challengeId: number, userId: string): Promise<void> {
    await this.prisma.challengeJoin.create({
      data: {
        challengeId,
        userId,
        status: ParticipantStatus.JOINED,
      },
    });
  }

  async getCurrentParticipatingCount(userId: string): Promise<number> {
    return this.prisma.challenge.count({
      where: {
        // 1. ChallengeJoin 관계를 통해 참여자 정보를 필터링
        challengeJoin: {
          some: {
            userId,
            status: ParticipantStatus.JOINED,
            leftAt: null,
          },
        },
        //2. 챌린지가 종료되지 않았고, 취소/완료되지 않았어야 함
        cancelledAt: null,
        completedAt: null,
        endTime: {
          gt: new Date(),
        },
      },
    });
  }

  async leaveChallenge(challengeId: number, userId: string): Promise<void> {
    await this.prisma.challengeJoin.delete({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
    });
  }

  async updateChallengeJoinStatus(
    challengeId: number,
    userId: string,
  ): Promise<void> {
    await this.prisma.challengeJoin.update({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      data: {
        status: ParticipantStatus.LEFT,
        leftAt: new Date(),
      },
    });
  }

  async getUserActiveChallenges(userId: string): Promise<ChallengeData[]> {
    return this.prisma.challenge.findMany({
      where: {
        // 1. ChallengeJoin 관계를 통해 참여자 정보를 필터링
        challengeJoin: {
          some: {
            userId,
            status: ParticipantStatus.JOINED,
            leftAt: null,
          },
        },
        //2. 챌린지가 종료되지 않았고, 취소/완료되지 않았어야 함
        cancelledAt: null,
        completedAt: null,
        endTime: {
          gt: new Date(),
        },
      },
      select: {
        id: true,
        hostId: true,
        name: true,
        bookId: true,
        visibility: true,
        startTime: true,
        endTime: true,
        completedAt: true,
        cancelledAt: true,
        challengeJoin: true,
      },
    });
  }
}
