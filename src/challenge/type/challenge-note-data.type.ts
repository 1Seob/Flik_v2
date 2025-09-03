export type ChallengeNoteData = {
  id: number;
  challengeId: number;
  authorId: string;
  body: string;
  quoteText: string | null;
  createdAt: Date;
  imagePath: string | null;
};
