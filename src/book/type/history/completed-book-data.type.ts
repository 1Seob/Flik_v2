import { BookData } from '../book-data.type';

export type CompletedBookData = {
  id: number | null;
  book: BookData;
  startedAt: Date | null;
  endedAt: Date | null;
  completed: boolean;
};
