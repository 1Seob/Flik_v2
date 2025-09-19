import { ReviewData } from './review-data.type';

export type ReviewWithLikedData = ReviewData & {
  nickname: string;
  liked: boolean;
  isAuthor: boolean;
};
