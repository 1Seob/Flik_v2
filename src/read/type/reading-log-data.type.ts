export type ReadingLogData = {
  id: number;
  userId: string;
  bookId: number;
  pageId: number;
  pageNumber: number;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSec: number | null;
};
