export type MyReviewData = {
  id: number;
  bookId: number;
  bookTitle: string;
  content: string;
  likeCount: number;
  rating: number;
  liked: boolean;
  createdAt: Date;
};
