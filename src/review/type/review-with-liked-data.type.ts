import { ReviewData } from './review-data.type';

export type ReviewWithLikedData = ReviewData & {
  liked: boolean;
  isAuthor: boolean;
};
