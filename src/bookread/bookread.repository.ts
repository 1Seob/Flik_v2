import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import {
  startOfMonth,
  endOfMonth,
  startOfDay,
  addHours,
  endOfDay,
} from 'date-fns';
import { BookData } from 'src/book/type/book-data.type';

@Injectable()
export class BookReadRepository {
  constructor(private readonly prisma: PrismaService) {}

  async createBookRead(
    userId: number,
    bookReadData: { bookId: number; lastPageIndex: number; dailyGoal: number },
  ) {
    // 1. 해당 book의 전체 문단 조회 (1 ~ 마지막)
    const paragraphs = await this.prisma.paragraph.findMany({
      where: { bookId: bookReadData.bookId },
    });

    // 2. 마지막 문단 order 구하기
    const maxOrder = Math.max(...paragraphs.map((p) => p.order));

    // 3. 1 ~ lastPageIndex 문단만 필터링
    const targetParagraphs = paragraphs.filter(
      (p) => p.order <= bookReadData.lastPageIndex,
    );

    // 4. 이미 기록된 문단 조회 (optional 중복 방지)
    const existingActivities = await this.prisma.user_reading_activity.findMany(
      {
        where: {
          user_id: userId,
          book_id: bookReadData.bookId,
          paragraph_id: { in: targetParagraphs.map((p) => p.id) },
        },
        select: { paragraph_id: true },
      },
    );

    const alreadyReadParagraphIds = new Set(
      existingActivities.map((e) => e.paragraph_id),
    );

    // 5. 일괄 기록 데이터 생성 (completedAt 조건부 추가)
    const isCompleted = bookReadData.lastPageIndex === maxOrder;
    const now = new Date();

    const activitiesToCreate = targetParagraphs
      .filter((p) => !alreadyReadParagraphIds.has(p.id))
      .map((p) => ({
        user_id: userId,
        book_id: bookReadData.bookId,
        paragraph_id: p.id,
        order: p.order,
        readAt: addHours(new Date(), 9),
        dailyGoal: bookReadData.dailyGoal,
        completedAt: isCompleted ? now : null, // 완독 처리
      }));

    if (activitiesToCreate.length > 0) {
      await this.prisma.user_reading_activity.createMany({
        data: activitiesToCreate,
      });
    }

    return {
      message: `${activitiesToCreate.length}개의 문단 기록 완료`,
      isCompleted,
    };
  }

  async getBooksReadByMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<number[]> {
    // KST 월 경계 생성
    const kstStart = startOfMonth(new Date(year, month - 1));
    const kstEnd = endOfMonth(new Date(year, month - 1));
    const startUtc = addHours(kstStart, 9);
    const endUtc = addHours(kstEnd, 9);

    console.log('Start UTC:', startUtc.toISOString());
    console.log('End UTC:', endUtc.toISOString());

    const activities = await this.prisma.user_reading_activity.findMany({
      where: {
        user_id: userId,
        read_at: {
          gte: startUtc,
          lte: endUtc,
        },
      },
      select: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
      },
    });

    // 중복 제거
    const uniqueBooksMap = new Map<number, (typeof activities)[0]['book']>();
    for (const activity of activities) {
      uniqueBooksMap.set(activity.book.id, activity.book);
    }
    return Array.from(uniqueBooksMap.values()).map((book) => book.id);
  }

  async completeBookRead(userId: number, bookId: number) {
    const now = new Date();
    await this.prisma.user_reading_activity.updateMany({
      where: {
        user_id: userId,
        book_id: bookId,
      },
      data: {
        completed_at: addHours(now, 9),
      },
    });

    return {
      message: '책 완독 기록 완료',
    };
  }

  async getBooksCompletedByMonth(
    userId: number,
    year: number,
    month: number,
  ): Promise<number[]> {
    const kstStart = startOfMonth(new Date(year, month - 1));
    const kstEnd = endOfMonth(new Date(year, month - 1));

    const startUtc = addHours(kstStart, 9);
    const endUtc = addHours(kstEnd, 9);

    const activities = await this.prisma.user_reading_activity.findMany({
      where: {
        user_id: userId,
        completed_at: {
          gte: startUtc,
          lte: endUtc,
        },
      },
      select: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
      },
    });
    const uniqueBooksMap = new Map<number, (typeof activities)[0]['book']>();
    for (const activity of activities) {
      uniqueBooksMap.set(activity.book.id, activity.book);
    }
    return Array.from(uniqueBooksMap.values()).map((book) => book.id);
  }

  async getDailyReadingProgress(
    userId: number,
    year: number,
    month: number,
    day: number,
  ): Promise<
    {
      books: BookData;
      pagesRead: number;
      dailyGoal: number;
      progressRate: number;
    }[]
  > {
    const kstStart = startOfDay(new Date(year, month - 1, day));
    const kstEnd = endOfDay(new Date(year, month - 1, day));

    const startUtc = addHours(kstStart, 9);
    const endUtc = addHours(kstEnd, 9);

    console.log('Start UTC:', startUtc.toISOString());
    console.log('End UTC:', endUtc.toISOString());

    const activities = await this.prisma.user_reading_activity.findMany({
      where: {
        user_id: userId,
        read_at: {
          gte: startUtc,
          lte: endUtc,
        },
      },
      select: {
        book: {
          select: {
            id: true,
            title: true,
            author: true,
            coverImageUrl: true,
          },
        },
        daily_goal: true,
        completed_at: true,
      },
    });
    const pagesRead = new Map<number, number>();
    const dailyGoalsMap = new Map<number, number | null>();
    const uniqueBooksMap = new Map<number, (typeof activities)[0]['book']>();

    for (const activity of activities) {
      const bookId = activity.book.id;

      // book 저장
      uniqueBooksMap.set(bookId, activity.book);

      // daily_goal 저장
      dailyGoalsMap.set(bookId, activity.daily_goal);

      // read count 집계
      pagesRead.set(bookId, (pagesRead.get(bookId) || 0) + 1);
    }
    return Array.from(uniqueBooksMap.values()).map((book) => {
      const bookId = book.id;
      const pagesReadCount = pagesRead.get(bookId) || 0;
      const dailyGoal = dailyGoalsMap.get(bookId) || null;

      // progressRate 계산
      const progressRate =
        dailyGoal !== null ? (pagesReadCount / dailyGoal) * 100 : 0;

      return {
        books: book,
        pagesRead: pagesReadCount,
        dailyGoal: dailyGoal || 0,
        progressRate,
      };
    });
  }
}
