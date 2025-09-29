import { Injectable } from '@nestjs/common';
import { RankingRepository } from './ranking.repository';
import { BookRankingListDto, RankStatus } from './dto/book-ranking.dto';
import { BookRankingData } from './type/book-ranking-data.type';
import { BookRankingWithStatusData } from './type/book-ranking-data-with-status-data.type';
import { BookService } from './book.service';

@Injectable()
export class RankingService {
  constructor(
    private readonly rankingRepository: RankingRepository,
    private readonly bookService: BookService,
  ) {}

  async getBookRankings(): Promise<BookRankingListDto> {
    // 1. 최신 랭킹 데이터를 가져옵니다.
    const latestRankings: BookRankingData[] =
      await this.rankingRepository.findLatestRankings(9);
    if (latestRankings.length === 0) return BookRankingListDto.from([]);

    const latestBookIds = latestRankings.map((r) => r.book.id);
    const latestCalculatedAt = latestRankings[0].calculatedAt;

    // 2. 이전 랭킹 데이터를 비교를 위해 가져옵니다.
    const previousRankings: BookRankingData[] =
      await this.rankingRepository.findPreviousRankings(
        latestCalculatedAt,
        latestBookIds,
      );

    // 빠른 조회를 위해 이전 랭킹을 Map 형태로 변환 (key: bookId, value: rank)
    const previousRankMap = new Map(
      previousRankings.map((r) => [r.book.id, r.rank]),
    );

    const urls: (string | null)[] = await Promise.all(
      latestRankings.map((r) =>
        this.bookService.getBookCoverImageUrlByNaverSearchApi(r.book.isbn),
      ),
    );

    // 3. 최신 랭킹과 이전 랭킹을 비교하여 DTO를 만듭니다.
    const response: BookRankingWithStatusData[] = latestRankings.map(
      (current) => {
        const previousRank = previousRankMap.get(current.book.id);
        let status: RankStatus;
        let rankChange: number | null = null;

        if (previousRank === undefined) {
          status = RankStatus.NEW; // 이전 랭킹에 없으면 'NEW'
        } else if (current.rank < previousRank) {
          status = RankStatus.UP;
          rankChange = previousRank - current.rank;
        } else if (current.rank > previousRank) {
          status = RankStatus.DOWN;
          rankChange = current.rank - previousRank;
        } else {
          status = RankStatus.SAME;
        }

        return {
          ...current,
          status,
          rankChange,
        };
      },
    );

    return BookRankingListDto.from(response, urls);
  }
}
