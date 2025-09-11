export type CreateReadingStartLogData = {
  userId: string;
  bookId: number;
  pageId: number;
  pageNumber: number;
  participantId?: number | null;
};
