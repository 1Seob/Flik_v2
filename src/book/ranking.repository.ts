import { Injectable } from '@nestjs/common';
import { PrismaService } from 'src/common/services/prisma.service';
import { BookRankingData } from './type/book-ranking-data.type';

@Injectable()
export class RankingRepository {
  constructor(private readonly prisma: PrismaService) {}

  // 가장 최근에 집계된 랭킹 데이터를 가져옵니다.
  async findLatestRankings(limit: number = 10): Promise<BookRankingData[]> {
    const latestEntry = await this.prisma.bookRanking.findFirst({
      orderBy: { calculatedAt: 'desc' },
    });

    if (!latestEntry) return [];

    return this.prisma.bookRanking.findMany({
      where: { calculatedAt: latestEntry.calculatedAt },
      orderBy: { rank: 'asc' },
      take: limit,
      include: {
        book: true,
      },
    });
  }

  // 특정 시점 이전의 랭킹 데이터를 가져옵니다 (순위 비교용).
  async findPreviousRankings(
    currentDate: Date,
    bookIds: number[],
  ): Promise<BookRankingData[]> {
    const previousEntry = await this.prisma.bookRanking.findFirst({
      where: { calculatedAt: { lt: currentDate } },
      orderBy: { calculatedAt: 'desc' },
    });

    if (!previousEntry) return [];

    return this.prisma.bookRanking.findMany({
      where: {
        calculatedAt: previousEntry.calculatedAt,
        bookId: { in: bookIds },
      },
      include: {
        book: true,
      },
    });
  }
}
