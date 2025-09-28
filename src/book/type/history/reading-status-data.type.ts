import { BookData } from '../../type/book-data.type';

export type ReadingStatusData = {
  book: BookData;
  lastPageNumber: number;
  startedAt: Date;
  endedAt: Date;
};
