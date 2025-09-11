export type CreateReadingEndLogData = {
  userId: string;
  bookId: number;
  pageId: number;
  pageNumber: number;
  participantId?: number | null;
  durationSec: number;
};
