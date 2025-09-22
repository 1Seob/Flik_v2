export type SentenceLikeData = {
  id: number;
  userId: string;
  bookId: number;
  pageId: number;
  text: string;
  startIndex: number;
  endIndex: number;
  createdAt: Date;
};
