import { BookData } from 'src/book/type/book-data.type';

export type ReadingProgressData = {
  book: BookData;
  lastPageNumber: number;
};
