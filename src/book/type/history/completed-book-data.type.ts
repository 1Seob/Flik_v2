import { BookData } from '../book-data.type';

export type CompletedBookData = {
  book: BookData;
  startedAt: Date | null;
  endedAt: Date | null;
  completed: boolean;
};
