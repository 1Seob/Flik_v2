import { BookData } from './book-data.type';

export type BookRankingData = {
  book: BookData;
  rank: number;
  views: number;
  calculatedAt: Date;
};
