import { BookData } from './book-data.type';

export type RecentBookData = BookData & {
  progress: number;
};
