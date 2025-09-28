import { BookData } from 'src/book/type/book-data.type';
import { ReadingLogData } from 'src/read/type/reading-log-data.type';

export type LatestReadingLogWithBookData = {
  log: ReadingLogData;
  book: BookData;
};
