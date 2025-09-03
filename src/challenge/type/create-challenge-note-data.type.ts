export type CreateChallengeNoteData = {
  challengeId: number;
  authorId: string;
  body: string;
  quoteText?: string | null;
  quotePageId?: number | null;
  quoteBookId?: number | null;
};
