export type ReviewData = {
  id: number;
  userId: string;
  bookId: number;
  content: string;
  likeCount: number;
  rating: number;
  createdAt: Date;
};
