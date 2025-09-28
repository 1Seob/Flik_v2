import { BookData } from 'src/book/type/book-data.type';
import { BookCompletionData } from './book-completion-data.type';

export type BookCompletionWithBookData = BookCompletionData & {
  book: BookData;
};
