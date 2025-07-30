import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { ChallengeType } from './enums/challenge-type.enum';

@Injectable()
export class ChallengeRepository {
  constructor(private readonly prisma: PrismaService) {}

  async updateChallenge(
    userId: number,
    bookId: number,
    challengeType: ChallengeType,
  ) {
    return this.prisma.userBook.update({
      where: { userId_bookId: { userId, bookId } },
      data: {
        challengeType,
        challengeStartDate: new Date(),
        lastReadParagraphOrder: 0, // Resetting to 0 when starting a new challenge
      },
    });
  }

  async getChallenge(userId: number, bookId: number) {
    return this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: {
        challengeType: true,
        challengeStartDate: true,
        updatedAt: true,
        lastReadParagraphOrder: true,
      },
    });
  }

  async getActiveChallenges(userId: number) {
    return this.prisma.userBook.findMany({
      where: {
        userId,
        challengeType: { not: ChallengeType.NONE },
      },
      select: {
        bookId: true,
        challengeType: true,
        challengeStartDate: true,
        lastReadParagraphOrder: true,
      },
    });
  }

  async getReadDays(userId: number, bookId: number) {
    return this.prisma.user_reading_activity.findMany({
      where: {
        user_id: userId,
        book_id: bookId,
      },
      select: {
        ended_at: true,
      },
    });
  }

  async getUserChallengeCount(userId: number): Promise<number> {
    return this.prisma.userBook.count({
      where: {
        userId,
        challengeType: { not: ChallengeType.NONE },
      },
    });
  }

  async getLastReadParagraphOrder(userId: number, bookId: number) {
    const activity = await this.prisma.userBook.findUnique({
      where: { userId_bookId: { userId, bookId } },
      select: {
        lastReadParagraphOrder: true,
      },
    });
    return activity?.lastReadParagraphOrder ?? 0;
  }

  async getTotalBookParagraphs(bookId: number) {
    return this.prisma.paragraph.count({
      where: { bookId },
    });
  }

  async deleteChallenge(userId: number, bookId: number) {
    return this.prisma.userBook.delete({
      where: { userId_bookId: { userId, bookId } },
    });
  }
}
