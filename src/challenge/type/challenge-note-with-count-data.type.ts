import { ChallengeNoteData } from './challenge-note-data.type';

export type ChallengeNoteWithCountData = ChallengeNoteData & {
  commentsCount: number;
  likesCount: number;
  liked: boolean;
};
