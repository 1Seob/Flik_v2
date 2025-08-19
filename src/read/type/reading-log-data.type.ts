export type ReadingLogData = {
  id: number;
  userId: string;
  bookId: number;
  pageId: number;
  pageNum: number;
  participantId: number | null;
  startedAt: Date | null;
  endedAt: Date | null;
  durationSec: number | null;
};
