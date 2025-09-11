import { PrismaService } from 'src/common/services/prisma.service';
import { Injectable } from '@nestjs/common';
import { BookData } from './type/book-data.type';

@Injectable()
export class RecommendRepository {
  constructor(private readonly prisma: PrismaService) {}

  /**
   * 사용자의 긍정적 상호작용 (높은 평점 리뷰, 저장) 책 ID 목록을 가져옴
   */
  async findUserPositiveInteractionBookIds(userId: string): Promise<number[]> {
    const highlyRatedBooks = await this.prisma.review.findMany({
      where: {
        userId,
        rating: { gte: 4.0 }, // 4.0 이상 평점
      },
      select: { bookId: true },
    });

    const savedBooks = await this.prisma.bookSave.findMany({
      where: { userId },
      select: { bookId: true },
    });

    const bookIds = [
      ...highlyRatedBooks.map((r) => r.bookId),
      ...savedBooks.map((s) => s.bookId),
    ];

    return [...new Set(bookIds)]; // 중복 제거
  }

  /**
   * 특정 책 목록과 긍정적 상호작용을 한 다른 사용자들을 찾음
   * 협업 필터링(사용자 기반)의 기초 데이터로 사용
   */
  async findUsersWithSimilarInteractions(
    bookIds: number[],
    excludeUserId: string,
  ): Promise<{ userId: string; commonBooksCount: number }[]> {
    const similarUsers = await this.prisma.review.groupBy({
      by: ['userId'],
      where: {
        userId: { not: excludeUserId },
        bookId: { in: bookIds },
        rating: { gte: 4.0 },
      },
      _count: {
        bookId: true,
      },
      orderBy: {
        _count: {
          bookId: 'desc',
        },
      },
      take: 50, // 성능을 위해 유사 사용자 후보를 50명으로 제한
    });

    return similarUsers.map((u) => ({
      userId: u.userId,
      commonBooksCount: u._count.bookId,
    }));
  }

  /**
   * 특정 사용자 목록이 좋아한 책 목록을 가져옴
   * 단, 추천 대상 사용자가 이미 읽은 책은 제외
   */
  async findBooksLikedByUsers(
    userIds: string[],
    excludeBookIds: number[],
  ): Promise<BookData[]> {
    return this.prisma.book.findMany({
      where: {
        id: { notIn: excludeBookIds },
        review: {
          some: {
            userId: { in: userIds },
            rating: { gte: 4.0 },
          },
        },
      },
    });
  }

  /**
   * 사용자가 선호하는 저자 목록을 가져옴
   */
  async findUserFavoriteAuthors(bookIds: number[]): Promise<string[]> {
    const books = await this.prisma.book.findMany({
      where: { id: { in: bookIds } },
      select: { author: true },
    });
    return [...new Set(books.map((b) => b.author))];
  }

  /**
   * 특정 저자들의 다른 책들을 찾음
   * 콘텐츠 기반 필터링에 사용
   */
  async findBooksByAuthors(
    authors: string[],
    excludeBookIds: number[],
  ): Promise<BookData[]> {
    return this.prisma.book.findMany({
      where: {
        author: { in: authors },
        id: { notIn: excludeBookIds },
      },
    });
  }

  /**
   * 인기 도서 목록을 가져옵니다 (콜드 스타트용)
   */
  async findPopularBooks(limit: number): Promise<BookData[]> {
    return this.prisma.book.findMany({
      orderBy: {
        views: 'desc',
      },
      take: limit,
    });
  }

  async getRecommendedBookIds(): Promise<number[]> {
    const recommends = await this.prisma.recommend.findMany();
    return recommends.map((r) => r.bookId);
  }

  async getRecommendedBooks(): Promise<BookData[]> {
    const bookIds = await this.getRecommendedBookIds();
    return this.prisma.book.findMany({
      where: { id: { in: bookIds } },
    });
  }
}
