import { BookData } from 'src/book/type/book-data.type';

export type ReadingProgressData = {
  book: BookData;
  maxPageRead: number;
  progress: number;
  challengeParticipation: boolean;
};
