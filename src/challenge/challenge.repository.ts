import { PrismaService } from '../common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { CreateChallengeData } from './type/create-challenge-data.type';
import { ChallengeData } from './type/challenge-data.type';
import { ParticipantStatus } from '@prisma/client';
import { BookData } from 'src/book/type/book-data.type';

@Injectable()
export class ChallengeRepository {
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
}
