import { BookRankingData } from './book-ranking-data.type';
import { RankStatus } from '../dto/book-ranking.dto';

export type BookRankingWithStatusData = BookRankingData & {
  status: RankStatus;
  rankChange: number | null;
};
