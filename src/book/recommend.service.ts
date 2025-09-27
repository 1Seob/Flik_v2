import { Injectable } from '@nestjs/common';
import { RecommendRepository } from './recommend.repository';
import { PrismaService } from 'src/common/services/prisma.service';
import { BookService } from './book.service';
import { SimpleBookListDto } from './dto/simple-book.dto';

/* 추천 점수 가중치
const WEIGHTS = {
  COLLABORATIVE_FILTERING: 1.5,
  CONTENT_BASED: 1.0,
};
*/

@Injectable()
export class RecommendService {
  constructor(
    private readonly recommendRepository: RecommendRepository,
    private readonly prisma: PrismaService,
    private readonly bookService: BookService,
  ) {}

  async getRecommendedBooks(): Promise<SimpleBookListDto> {
    const books = await this.recommendRepository.getRecommendedBooks();
    const urls: (string | null)[] = await Promise.all(
      books.map((book) =>
        this.bookService.getBookCoverImageUrlByNaverSearchApi(book.isbn),
      ),
    );
    return SimpleBookListDto.from(books, urls);
  }

  /*
  async getRecommendedBooks(userId: string): Promise<BookListDto> {
    const userPositiveBookIds =
      await this.recommendRepository.findUserPositiveInteractionBookIds(userId);

    // 1. 콜드 스타트 처리: 사용자 활동이 없으면 인기 도서 추천
    if (userPositiveBookIds.length === 0) {
      const books: BookData[] =
        await this.recommendRepository.findPopularBooks(50);
      const urls: (string | null)[] = await Promise.all(
        books.map((book) => this.bookService.getBookCoverImage(book.id)),
      );
      return BookListDto.from(books, urls);
    }

    const recommendationScores = new Map<number, number>();

    // 2. 협업 필터링(User-based) 점수 계산
    const similarUsers =
      await this.recommendRepository.findUsersWithSimilarInteractions(
        userPositiveBookIds,
        userId,
      );

    if (similarUsers.length > 0) {
      const similarUserIds = similarUsers.slice(0, 50).map((u) => u.userId); // 상위 50명의 유사 사용자
      const cfBooks = await this.recommendRepository.findBooksLikedByUsers(
        similarUserIds,
        userPositiveBookIds,
      );

      for (const book of cfBooks) {
        const currentScore = recommendationScores.get(book.id) || 0;
        recommendationScores.set(
          book.id,
          currentScore + WEIGHTS.COLLABORATIVE_FILTERING,
        );
      }
    }

    // 3. 콘텐츠 기반(Author-based) 필터링 점수 계산
    const favoriteAuthors =
      await this.recommendRepository.findUserFavoriteAuthors(
        userPositiveBookIds,
      );
    if (favoriteAuthors.length > 0) {
      const contentBasedBooks =
        await this.recommendRepository.findBooksByAuthors(
          favoriteAuthors,
          userPositiveBookIds,
        );

      for (const book of contentBasedBooks) {
        const currentScore = recommendationScores.get(book.id) || 0;
        recommendationScores.set(book.id, currentScore + WEIGHTS.CONTENT_BASED);
      }
    }

    // 4. 점수 기반 정렬 및 상위 N개 선택
    const sortedBookIds = Array.from(recommendationScores.entries())
      .sort((a, b) => b[1] - a[1])
      .map((entry) => entry[0]);

    // 최종 추천 목록 필터링 및 가져오기 (이미 상호작용한 책 제외)
    const finalBookIds = sortedBookIds
      .filter((id) => !userPositiveBookIds.includes(id))
      .slice(0, 50);

    if (finalBookIds.length === 0) {
      const books: BookData[] =
        await this.recommendRepository.findPopularBooks(50);
      return BookListDto.from(books, []);
    }

    // (개선) Prisma에서는 findMany에 id 순서를 보장하지 않으므로, 애플리케이션 레벨에서 순서를 맞춰줌
    const finalBooks: BookData[] = await this.prisma.book.findMany({
      where: { id: { in: finalBookIds } },
    });
    const urls: (string | null)[] = await Promise.all(
      finalBooks.map((book) => this.bookService.getBookCoverImage(book.id)),
    );

    return BookListDto.from(finalBooks, urls);
  }
    */
}
