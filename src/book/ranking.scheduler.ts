import { Injectable } from '@nestjs/common';
import { Cron, CronExpression } from '@nestjs/schedule';
import { PrismaService } from 'src/common/services/prisma.service';

@Injectable()
export class RankingScheduler {
  constructor(private readonly prisma: PrismaService) {}

  //@Cron('*/2 * * * *', { timeZone: 'Asia/Seoul' }) // 매 2분마다 실행 (테스트용)
  @Cron(CronExpression.EVERY_DAY_AT_MIDNIGHT, { timeZone: 'Asia/Seoul' })
  async handleCron() {
    console.log('매일 자정, 도서 랭킹 집계를 시작합니다.');

    const calculatedAt = new Date(); // 현재 시점을 기준으로 집계

    // 1. 조회수(views) 기준으로 상위 10권의 책을 가져옵니다.
    const topBooks = await this.prisma.book.findMany({
      orderBy: {
        views: 'desc',
      },
      take: 10, // 상위 10개만 집계 (필요에 따라 조절)
      select: {
        id: true,
        views: true,
      },
    });

    // 2. 랭킹 데이터(스냅샷)를 생성합니다.
    const rankingData = topBooks.map((book, index) => ({
      bookId: book.id,
      rank: index + 1, // 순위는 1부터 시작
      views: book.views,
      calculatedAt: calculatedAt,
    }));

    // 3. 생성된 랭킹 데이터를 DB에 한 번에 저장합니다.
    if (rankingData.length > 0) {
      await this.prisma.bookRanking.createMany({
        data: rankingData,
      });
      console.log(
        `${rankingData.length}개의 도서 랭킹이 성공적으로 저장되었습니다.`,
      );
    }
  }
}
