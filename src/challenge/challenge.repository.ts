import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateChallengeData } from './type/create-challenge-data.type';
import { ChallengeData } from './type/challenge-data.type';
import { ParticipantStatus, ChallengeVisibility } from '@prisma/client';
import { BookData } from 'src/book/type/book-data.type';
import { ParticipantData } from './type/participant-data.type';
import { UpdateChallengeData } from './type/update-challenge-data.type';

type JoinRow = {
  id: number; // ChallengeJoin.id
  status: ParticipantStatus;
  user: {
    name: string;
    lastLoginAt: Date;
  };
  challenge: {
    id: number;
    name: string;
    hostId: string;
    bookId: number;
    visibility: ChallengeVisibility;
    startTime: Date;
    endTime: Date;
    completedAt: Date | null;
    cancelledAt: Date | null;
  };
};

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
      where: { challengeId, status: ParticipantStatus.JOINED, leftAt: null },
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

  async leaveAndDeleteChallenge(
    challengeId: number,
    userId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.challengeJoin.delete({
        where: {
          challengeId_userId: {
            challengeId,
            userId,
          },
        },
      }),
      this.prisma.challenge.update({
        where: {
          id: challengeId,
        },
        data: {
          cancelledAt: new Date(),
        },
      }),
    ]);
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

  async updateChallengeJoinStatusAndDeleteChallenge(
    challengeId: number,
    userId: string,
  ): Promise<void> {
    await this.prisma.$transaction([
      this.prisma.challengeJoin.update({
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
      }),
      this.prisma.challenge.update({
        where: {
          id: challengeId,
        },
        data: {
          cancelledAt: new Date(),
        },
      }),
    ]);
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

  async updateChallenge(
    id: number,
    data: UpdateChallengeData,
  ): Promise<ChallengeData> {
    return this.prisma.challenge.update({
      where: { id },
      data: {
        name: data.name,
      },
      select: {
        id: true,
        name: true,
        hostId: true,
        bookId: true,
        visibility: true,
        startTime: true,
        endTime: true,
        completedAt: true,
        cancelledAt: true,
      },
    });
  }

  async getParticipantIdByUserIdAndChallengeId(
    challengeId: number,
    userId: string,
  ): Promise<number> {
    const participation = await this.prisma.challengeJoin.findUnique({
      where: {
        challengeId_userId: {
          challengeId,
          userId,
        },
      },
      select: { id: true },
    });
    return participation!.id;
  }

  async findChallengeExitLogs(participantId: number) {
    return this.prisma.readingLog.findMany({
      where: {
        // '종료 로그'만 필터링 (startedAt은 null, endedAt은 값이 있음)
        startedAt: null,
        endedAt: { not: null },
        // 해당 챌린지 참여 기록(participantId)과 연결된 로그만 조회
        participantId,
      },
      select: {
        pageNumber: true, // 필요한 데이터만 선택
        endedAt: true,
      },
    });
  }

  /**
   * 유저가 참가했던 모든 ChallengeJoin + user + challenge 기본정보
   */
  async findUserJoinsWithChallenge(userId: string): Promise<JoinRow[]> {
    const rows = await this.prisma.challengeJoin.findMany({
      where: { userId },
      select: {
        id: true,
        status: true,
        user: { select: { name: true, lastLoginAt: true } },
        challenge: {
          select: {
            id: true,
            name: true,
            hostId: true,
            bookId: true,
            visibility: true,
            startTime: true,
            endTime: true,
            completedAt: true,
            cancelledAt: true,
          },
        },
      },
      orderBy: { challenge: { startTime: 'desc' } },
    });

    // 타입 단언으로 반환
    return rows as unknown as JoinRow[];
  }

  /**
   * participantId(=ChallengeJoin.id) 별 최대 pageNumber 집계
   * 대용량 로그에서도 효율적 (logs 전체 include X)
   */
  async getMaxPageReadByJoinIds(
    joinIds: number[],
  ): Promise<Map<number, number>> {
    if (joinIds.length === 0) return new Map();

    const grouped = await this.prisma.readingLog.groupBy({
      by: ['participantId'],
      where: { participantId: { in: joinIds } },
      _max: { pageNumber: true },
    });

    return new Map<number, number>(
      grouped.map((g) => [g.participantId as number, g._max.pageNumber ?? 0]),
    );
  }
}
